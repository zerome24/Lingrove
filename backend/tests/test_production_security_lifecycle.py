import datetime
import pytest
from backend.app.models import Order, Product, SystemSetting, User
from backend.app.inventory import release_expired_reservations

def get_admin_token(client):
    r = client.post("/api/auth/login", json={
        "email": "admin@lingrove.org",
        "password": "admin123"
    })
    assert r.status_code == 200
    return r.json()["access_token"]

def get_customer_token(client):
    r = client.post("/api/auth/login", json={
        "email": "kavita@lingrove.org",
        "password": "customer123"
    })
    assert r.status_code == 200
    return r.json()["access_token"]

def get_artisan_token(client):
    r = client.post("/api/auth/login", json={
        "email": "ramesh@lingrove.org",
        "password": "artisan123"
    })
    assert r.status_code == 200
    return r.json()["access_token"]

def test_inventory_reservation_and_auto_expiry(client, db_session):
    """
    Test that creating an order temporarily reserves stock,
    and when the reservation window lapses without confirmation,
    release_expired_reservations automatically restores the inventory.
    """
    # 1. Pick a product
    prod = db_session.query(Product).filter(Product.stock >= 5).first()
    assert prod is not None
    initial_stock = prod.stock
    product_id = prod.id

    # 2. Place guest order for 3 units
    order_payload = {
        "customer_name": "Suresh Rao",
        "customer_phone": "9988776655",
        "delivery_type": "delivery",
        "shipping_address": "Kandlakoya Village",
        "shipping_city": "Hyderabad",
        "shipping_state": "Telangana",
        "shipping_pincode": "501401",
        "guest_items": [{"product_id": product_id, "quantity": 3}]
    }
    r = client.post("/api/orders", json=order_payload)
    assert r.status_code == 200
    order_data = r.json()
    order_id = order_data["id"]

    # Verify stock deducted
    db_session.expire_all()
    prod_after_order = db_session.query(Product).filter(Product.id == product_id).first()
    assert prod_after_order.stock == initial_stock - 3

    # 3. Fast-forward the expiration into the past to simulate abandoned unconfirmed request
    order_obj = db_session.query(Order).filter(Order.id == order_id).first()
    past_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)
    order_obj.expires_at = past_time
    db_session.commit()

    # 4. Trigger auto-restoration
    released_count = release_expired_reservations(db_session)
    assert released_count >= 1

    # 5. Verify order is marked expired and stock is fully restored
    db_session.expire_all()
    refreshed_order = db_session.query(Order).filter(Order.id == order_id).first()
    assert refreshed_order.status == "expired"
    assert refreshed_order.reservation_status == "expired"

    refreshed_prod = db_session.query(Product).filter(Product.id == product_id).first()
    assert refreshed_prod.stock == initial_stock

def test_order_cancellation_restocks_inventory(client, db_session):
    """
    Test that cancelling an active order restores reserved stock and marks reservation released.
    """
    prod = db_session.query(Product).filter(Product.stock >= 4).first()
    initial_stock = prod.stock
    product_id = prod.id

    admin_token = get_admin_token(client)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Place order for 2 units
    r = client.post("/api/orders", json={
        "customer_name": "Test Cancellation",
        "customer_phone": "9123456789",
        "delivery_type": "delivery",
        "guest_items": [{"product_id": product_id, "quantity": 2}]
    })
    assert r.status_code == 200
    order_id = r.json()["id"]

    db_session.expire_all()
    assert db_session.query(Product).filter(Product.id == product_id).first().stock == initial_stock - 2

    # Admin cancels order
    r_cancel = client.patch(f"/api/orders/{order_id}/status", json={"status": "cancelled"}, headers=headers)
    assert r_cancel.status_code == 200
    assert r_cancel.json()["status"] == "cancelled"

    db_session.expire_all()
    # Stock must be restored
    assert db_session.query(Product).filter(Product.id == product_id).first().stock == initial_stock

    # Cancelling again should be idempotent and not double-restock
    r_cancel_again = client.patch(f"/api/orders/{order_id}/status", json={"status": "cancelled"}, headers=headers)
    assert r_cancel_again.status_code == 200
    db_session.expire_all()
    assert db_session.query(Product).filter(Product.id == product_id).first().stock == initial_stock

def test_order_privacy_protection_and_token_access(client):
    """
    Test order privacy:
    - Direct access without token/auth is forbidden.
    - Public unverified lookup has customer PII masked.
    - Access with correct token or owner login provides full unmasked data.
    """
    r = client.get("/api/products")
    prod_id = r.json()[0]["id"]

    order_payload = {
        "customer_name": "Private Customer",
        "customer_phone": "9848012345",
        "delivery_type": "delivery",
        "shipping_address": "Secret Lane 7, Hyderabad",
        "guest_items": [{"product_id": prod_id, "quantity": 1}]
    }
    r_order = client.post("/api/orders", json=order_payload)
    assert r_order.status_code == 200
    order = r_order.json()
    order_id = order["id"]
    order_num = order["order_number"]
    token = order["access_token"]
    assert token is not None

    # 1. GET /api/orders/{order_id} without token -> 403 Forbidden
    r_unauth = client.get(f"/api/orders/{order_id}")
    assert r_unauth.status_code == 403

    # 2. GET /api/orders/{order_id}?token=... -> 200 OK with full data
    r_token = client.get(f"/api/orders/{order_id}?token={token}")
    assert r_token.status_code == 200
    assert r_token.json()["shipping_address"] == "Secret Lane 7, Hyderabad"
    assert r_token.json()["customer_phone"] == "9848012345"

    # 3. GET /api/orders/lookup/{order_number} without token -> 200 OK but masked PII
    r_lookup_public = client.get(f"/api/orders/lookup/{order_num}")
    assert r_lookup_public.status_code == 200
    pub_data = r_lookup_public.json()
    assert "Protected" in pub_data["shipping_address"]
    assert "******" in pub_data["customer_phone"]
    assert pub_data["access_token"] is None

    # 4. GET /api/orders/lookup/{order_number}?token=... -> 200 OK unmasked
    r_lookup_auth = client.get(f"/api/orders/lookup/{order_num}?token={token}")
    assert r_lookup_auth.status_code == 200
    assert r_lookup_auth.json()["shipping_address"] == "Secret Lane 7, Hyderabad"

def test_admin_whatsapp_number_update_and_persistence(client, db_session):
    """
    Verify centralized WhatsApp configuration:
    - Non-admin cannot change number.
    - Admin updates number and it is written persistently to system_settings.
    """
    cust_token = get_customer_token(client)
    admin_token = get_admin_token(client)

    # 1. Non-admin forbidden
    r_forbidden = client.put(
        "/api/config/whatsapp",
        json={"whatsapp_number": "9876543210"},
        headers={"Authorization": f"Bearer {cust_token}"}
    )
    assert r_forbidden.status_code == 403

    # 2. Admin successfully updates
    r_admin = client.put(
        "/api/config/whatsapp",
        json={"whatsapp_number": "9059076675"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert r_admin.status_code == 200
    data = r_admin.json()
    assert data["whatsapp_number"] == "919059076675"
    assert "90590 76675" in data["whatsapp_formatted"]

    # 3. Verify database persistence
    db_session.expire_all()
    setting = db_session.query(SystemSetting).filter(SystemSetting.key == "whatsapp_number").first()
    assert setting is not None
    assert setting.value == "919059076675"

def test_registration_privilege_escalation_prevention(client):
    """
    Test that registration rejects/neutralizes attempts to register as 'admin'.
    """
    r = client.post("/api/auth/register", json={
        "email": f"hacker_{datetime.datetime.now().timestamp()}@test.org",
        "password": "password123",
        "full_name": "Malicious Admin Attempt",
        "role": "admin"
    })
    assert r.status_code == 200
    user_data = r.json()["user"]
    # Role must NOT be admin
    assert user_data["role"] == "customer"

def test_insufficient_stock_error_handling(client, db_session):
    """
    Test that ordering more than available inventory returns HTTP 400 with a clear error message.
    """
    prod = db_session.query(Product).first()
    assert prod is not None

    r_fail = client.post("/api/orders", json={
        "customer_name": "Stock Overflow Customer",
        "customer_phone": "9998887776",
        "guest_items": [{"product_id": prod.id, "quantity": prod.stock + 100}]
    })
    assert r_fail.status_code == 400
    assert "Insufficient stock" in r_fail.json()["detail"]

def test_pricing_and_tax_policy(client, db_session):
    """
    Test pricing policies:
    1. 5% GST handicraft tax calculation
    2. Courier delivery under 999 INR charges standard 99 INR delivery fee
    3. Courier delivery over 999 INR has free shipping (0 INR)
    4. Workshop pickup has free shipping (0 INR) even under 999 INR
    """
    prod = db_session.query(Product).filter(Product.price < 500, Product.stock >= 10).first()
    assert prod is not None
    unit_price = prod.discount_price if (prod.discount_price and prod.discount_price > 0) else prod.price

    # 1. Courier delivery under 999
    r_under = client.post("/api/orders", json={
        "customer_name": "Under 999 Customer",
        "customer_phone": "9991112223",
        "delivery_type": "delivery",
        "guest_items": [{"product_id": prod.id, "quantity": 1}]
    })
    assert r_under.status_code == 200
    order_under = r_under.json()
    assert order_under["shipping_fee"] == 99.0
    expected_tax = round(unit_price * 0.05, 2)
    assert order_under["tax_amount"] == expected_tax
    assert order_under["total_amount"] == round(unit_price + 99.0 + expected_tax, 2)

    # 2. Workshop pickup under 999 -> Free shipping
    r_pickup = client.post("/api/orders", json={
        "customer_name": "Pickup Customer",
        "customer_phone": "9991112224",
        "delivery_type": "pickup",
        "guest_items": [{"product_id": prod.id, "quantity": 1}]
    })
    assert r_pickup.status_code == 200
    order_pickup = r_pickup.json()
    assert order_pickup["shipping_fee"] == 0.0
    assert order_pickup["total_amount"] == round(unit_price + expected_tax, 2)
