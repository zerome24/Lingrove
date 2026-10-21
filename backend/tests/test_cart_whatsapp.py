import pytest

def test_business_config_endpoint(client):
    """Verify official business config provides 919059076675 without login."""
    r = client.get("/api/config/business")
    assert r.status_code == 200
    data = r.json()
    assert data["whatsapp_number"] == "919059076675"
    assert "90590 76675" in data["whatsapp_formatted"]
    assert data["business_name"] == "Lingrove"
    assert "CMRTC" in data["subtitle"]

def test_guest_whatsapp_order_creation(client):
    """Verify that a guest customer can place an order without creating an account."""
    # Fetch a product to order
    r = client.get("/api/products")
    assert r.status_code == 200
    products = r.json()
    assert len(products) > 0
    prod = products[0]

    guest_payload = {
        "customer_name": "Ravi Teja",
        "customer_phone": "9876543210",
        "delivery_type": "delivery",
        "shipping_address": "Plot 12, Medchal Highway",
        "shipping_city": "Hyderabad",
        "shipping_state": "Telangana",
        "shipping_pincode": "501401",
        "payment_method": "whatsapp",
        "notes": "Please pack with extra bamboo ties",
        "guest_items": [
            {"product_id": prod["id"], "quantity": 1}
        ]
    }

    # Post without any Authorization header
    r = client.post("/api/orders", json=guest_payload)
    assert r.status_code == 200, f"Guest order failed: {r.text}"
    order = r.json()
    assert order["user_id"] is None
    assert order["customer_name"] == "Ravi Teja"
    assert order["status"] == "awaiting_confirmation"
    assert order["payment_status"] == "not_yet_confirmed"
    assert order["order_number"].startswith("LNG-WA-")

    # Order should be retrievable by reference without login
    r_lookup = client.get(f"/api/orders/lookup/{order['order_number']}")
    assert r_lookup.status_code == 200
    lookup_order = r_lookup.json()
    assert lookup_order["order_number"] == order["order_number"]
    assert lookup_order["total_amount"] == order["total_amount"]

def test_customer_cart_isolation(client):
    """
    Verify customer cart isolation: Customer A's cart items must never be
    visible to Customer B, and unauthenticated requests cannot access private carts.
    """
    # 1. Unauthenticated request to /api/cart should be rejected (401)
    r = client.get("/api/cart")
    assert r.status_code in [401, 403]

    # 2. Login as Customer A (Kavita)
    r_a = client.post("/api/auth/login", json={"email": "kavita@lingrove.org", "password": "customer123"})
    assert r_a.status_code == 200
    token_a = r_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 3. Login as User B (Ramesh - artisan/customer)
    r_b = client.post("/api/auth/login", json={"email": "ramesh@lingrove.org", "password": "artisan123"})
    assert r_b.status_code == 200
    token_b = r_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Clear both carts
    client.delete("/api/cart/clear", headers=headers_a)
    client.delete("/api/cart/clear", headers=headers_b)

    # Add item 1 to Customer A's cart
    r_prod = client.get("/api/products")
    products = r_prod.json()
    prod_1 = products[0]
    prod_2 = products[1] if len(products) > 1 else products[0]

    r_add_a = client.post("/api/cart/items", json={"product_id": prod_1["id"], "quantity": 3}, headers=headers_a)
    assert r_add_a.status_code == 200

    # Add item 2 to Customer B's cart
    r_add_b = client.post("/api/cart/items", json={"product_id": prod_2["id"], "quantity": 1}, headers=headers_b)
    assert r_add_b.status_code == 200

    # Check Customer A's cart: only item 1, qty 3
    r_cart_a = client.get("/api/cart", headers=headers_a)
    cart_a = r_cart_a.json()
    assert len(cart_a["items"]) == 1
    assert cart_a["items"][0]["product_id"] == prod_1["id"]
    assert cart_a["items"][0]["quantity"] == 3

    # Check Customer B's cart: only item 2, qty 1
    r_cart_b = client.get("/api/cart", headers=headers_b)
    cart_b = r_cart_b.json()
    assert len(cart_b["items"]) == 1
    assert cart_b["items"][0]["product_id"] == prod_2["id"]
    assert cart_b["items"][0]["quantity"] == 1

def test_guest_to_account_cart_merge(client):
    """
    Verify deterministic merging of guest cart into authenticated customer cart:
    - Adds guest items
    - Revalidates stock and bounds quantity
    - Avoids duplicate item rows
    """
    # Login as Customer A
    r_login = client.post("/api/auth/login", json={"email": "kavita@lingrove.org", "password": "customer123"})
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Clear cart first
    client.delete("/api/cart/clear", headers=headers)

    r_prod = client.get("/api/products")
    products = r_prod.json()
    prod_1 = products[0]

    # Pre-populate cart with 1 qty of prod_1
    client.post("/api/cart/items", json={"product_id": prod_1["id"], "quantity": 1}, headers=headers)

    # Guest cart had 2 of prod_1
    merge_payload = {
        "items": [
            {"product_id": prod_1["id"], "quantity": 2}
        ]
    }
    r_merge = client.post("/api/cart/merge", json=merge_payload, headers=headers)
    assert r_merge.status_code == 200
    merged_cart = r_merge.json()
    assert len(merged_cart["items"]) == 1
    # 1 existing + 2 from guest = 3 (bounded by stock)
    expected_qty = min(3, prod_1["stock"])
    assert merged_cart["items"][0]["quantity"] == expected_qty
    # Clean up cart state
    client.delete("/api/cart/clear", headers=headers)

def test_product_catalogue_filters(client):
    """Test filtering by new categories, seasonal, featured flags."""
    # Filter by category_slug
    r = client.get("/api/products?category_slug=vinayaka-chavithi")
    assert r.status_code == 200
    vc_products = r.json()
    assert len(vc_products) > 0
    for p in vc_products:
        assert p["category"]["slug"] == "vinayaka-chavithi"

    # Filter by seasonal
    r_seas = client.get("/api/products?is_seasonal=true")
    assert r_seas.status_code == 200
    seas_products = r_seas.json()
    assert len(seas_products) > 0
    for p in seas_products:
        assert p["is_seasonal"] is True

    # Filter by featured
    r_feat = client.get("/api/products?is_featured=true")
    assert r_feat.status_code == 200
    feat_products = r_feat.json()
    assert len(feat_products) > 0
    for p in feat_products:
        assert p["is_featured"] is True
