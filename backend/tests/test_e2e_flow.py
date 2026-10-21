import sys
import pytest

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_complete_e2e_workflow(client):
    """
    End-to-End automated integration test verifying full customer & artisan lifecycle:
    Health Check -> Customer Auth -> Product Search -> Cart Management ->
    Order Placement -> Inventory Stock Deduction -> Artisan Order Management ->
    Verified Review Submission -> Bamboo Cost Calculator -> Lingua Multilingual Assistant ->
    Bulk Order Inquiries -> Learning Progress Tracking -> Machine Directory -> Authorization Guard.
    """
    # 1. Health check
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health_data = r.json()
    assert health_data["status"] == "healthy"
    assert health_data["app"] == "LINGROVE"
    assert "Lingala Bamboo Products at CMRTC" in health_data["subtitle"]

    # 2. Customer Authentication
    r = client.post("/api/auth/login", json={
        "email": "kavita@lingrove.org",
        "password": "customer123"
    })
    assert r.status_code == 200, f"Login failed: {r.text}"
    customer_token = r.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {customer_token}"}

    # 3. Product Listing & Search
    r = client.get("/api/products?search=Basket")
    assert r.status_code == 200, f"Product fetch failed: {r.text}"
    products = r.json()
    assert len(products) > 0, "No basket products found"
    target_product = products[0]
    initial_stock = target_product["stock"]
    assert initial_stock >= 2, "Insufficient stock for test order"

    # 4. Cart Operations (ensure fresh state)
    client.delete("/api/cart/clear", headers=cust_headers)
    r = client.post("/api/cart/items", json={
        "product_id": target_product["id"],
        "quantity": 2
    }, headers=cust_headers)
    assert r.status_code == 200, f"Cart add failed: {r.text}"

    r = client.get("/api/cart", headers=cust_headers)
    assert r.status_code == 200
    cart_data = r.json()
    effective_price = target_product["discount_price"] if (target_product.get("discount_price") and target_product["discount_price"] > 0) else target_product["price"]
    expected_subtotal = round(effective_price * 2, 2)
    assert cart_data["subtotal"] == expected_subtotal
    assert cart_data["total"] > 0

    # 5. Place Order (Checkout)
    order_payload = {
        "shipping_name": "Kavita Sharma",
        "shipping_phone": "+91 98800 11223",
        "shipping_address": "42 Green Grove Lane",
        "shipping_city": "Hyderabad",
        "shipping_state": "Telangana",
        "shipping_pincode": "500043",
        "payment_method": "demo_upi",
        "notes": "E2E automated test order"
    }
    r = client.post("/api/orders", json=order_payload, headers=cust_headers)
    assert r.status_code == 200, f"Order placement failed: {r.text}"
    order_data = r.json()
    order_id = order_data["id"]
    assert order_data["status"] == "awaiting_confirmation"
    assert order_data["payment_status"] == "not_yet_confirmed"
    assert order_data["order_number"].startswith("LNG-")

    # 6. Verify Stock Was Deducted Server-Side
    r = client.get(f"/api/products/{target_product['id']}")
    assert r.status_code == 200
    updated_prod = r.json()
    assert updated_prod["stock"] == initial_stock - 2

    # 7. Artisan Order Management
    r = client.post("/api/auth/login", json={
        "email": "ramesh@lingrove.org",
        "password": "artisan123"
    })
    assert r.status_code == 200
    artisan_token = r.json()["access_token"]
    artisan_headers = {"Authorization": f"Bearer {artisan_token}"}

    r = client.patch(f"/api/orders/{order_id}/status", json={"status": "processing"}, headers=artisan_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "processing"

    r = client.patch(f"/api/orders/{order_id}/status", json={"status": "shipped"}, headers=artisan_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "shipped"

    # 8. Verified Purchase Review Submission
    r = client.post("/api/reviews", json={
        "product_id": target_product["id"],
        "review_type": "product",
        "rating": 5,
        "comment": "Superb finish and strength! E2E verified order."
    }, headers=cust_headers)
    assert r.status_code == 200
    review_data = r.json()
    assert review_data["is_verified_purchase"] is True

    # 9. Cost Calculator Formula Verification
    # Total cost = 120 + 180 + 40 + 25 + 35 = 400. Margin = 20% -> Suggested Price = 400 / 0.8 = 500
    r = client.post("/api/calculator", json={
        "material_cost": 120.0,
        "labor_cost": 180.0,
        "finishing_cost": 40.0,
        "packaging_cost": 25.0,
        "transport_cost": 35.0,
        "other_expenses": 0.0,
        "desired_margin_percentage": 20.0
    })
    assert r.status_code == 200
    calc_res = r.json()
    assert calc_res["suggested_selling_price"] == 500.0
    assert calc_res["estimated_profit"] == 100.0

    # 10. Lingua Multilingual Assistant
    # English navigation request
    r = client.post("/api/assistant/chat", json={
        "message": "Open the learning page",
        "language": "en"
    })
    assert r.status_code == 200
    ast_en = r.json()
    assert ast_en["action"] == "NAVIGATE"
    assert ast_en["action_data"] == "/learn"

    # Telugu conversation
    r = client.post("/api/assistant/chat", json={
        "message": "వెదురు బుట్టలు చూపించు",
        "language": "te"
    })
    assert r.status_code == 200
    ast_te = r.json()
    assert ast_te["language"] == "te"

    # Hindi conversation
    r = client.post("/api/assistant/chat", json={
        "message": "मुझे कारीगर के रूप में पंजीकृत होना है",
        "language": "hi"
    })
    assert r.status_code == 200
    ast_hi = r.json()
    assert ast_hi["language"] == "hi"

    # 11. Bulk Order Inquiry Submission
    r = client.post("/api/bulk-inquiries", json={
        "organization_name": "CMR Green Initiatives",
        "contact_person": "Dr. V. Rao",
        "email": "green@cmrtc.edu.in",
        "phone": "+91 99887 76655",
        "product_type": "Bamboo Furniture & Planters",
        "estimated_quantity": 50,
        "notes": "Campus auditorium eco-furnishing"
    })
    assert r.status_code == 200
    assert r.json()["organization_name"] == "CMR Green Initiatives"

    # 12. Learning Progress Tracking
    r = client.get("/api/learning/modules")
    assert r.status_code == 200
    modules = r.json()
    assert len(modules) >= 6
    module_id = modules[0]["id"]

    r = client.post(f"/api/learning/modules/{module_id}/progress", json={
        "is_completed": True,
        "progress_percentage": 100,
        "bookmarked": True
    }, headers=cust_headers)
    assert r.status_code == 200
    progress_data = r.json()
    assert progress_data["is_completed"] is True
    assert progress_data["bookmarked"] is True

    # 13. Machine Directory Inspection
    r = client.get("/api/machines")
    assert r.status_code == 200
    machines = r.json()
    assert len(machines) >= 4
    assert any("Splitting" in m["name"] for m in machines)

    # 14. Security / Authorization Guard: Unauthorized user cannot view another customer's order
    r = client.post("/api/auth/register", json={
        "email": "stranger@lingrove.org",
        "password": "strangerpassword",
        "full_name": "Stranger User",
        "phone": "+91 90000 00000",
        "role": "customer",
        "preferred_language": "en"
    })
    assert r.status_code == 200
    stranger_token = r.json()["access_token"]
    stranger_headers = {"Authorization": f"Bearer {stranger_token}"}

    unauth_r = client.get(f"/api/orders/{order_id}", headers=stranger_headers)
    assert unauth_r.status_code == 403, f"Expected 403 Forbidden, got {unauth_r.status_code}"
