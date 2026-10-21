def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "LINGROVE"
    assert "Lingala Bamboo Products at CMRTC" in data["subtitle"]

def test_user_login(client):
    response = client.post("/api/auth/login", json={
        "email": "customer123@lingrove.org",
        "password": "wrongpassword"
    })
    assert response.status_code in [401, 404]

    # Test seeded customer login
    response = client.post("/api/auth/login", json={
        "email": "kavita@lingrove.org",
        "password": "customer123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Kavita Sharma"

def test_user_registration(client):
    response = client.post("/api/auth/register", json={
        "email": "newartisan@lingrove.org",
        "password": "artisansecurepass",
        "full_name": "Suresh Varma",
        "phone": "+91 91234 56789",
        "role": "artisan",
        "preferred_language": "te"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "artisan"
    assert data["user"]["preferred_language"] == "te"

def test_products_list_and_filter(client):
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    assert any("Basket" in p["title"] for p in products)

    # Search filter
    search_res = client.get("/api/products?search=Harvest")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data) >= 1
    assert any("Harvest" in p["title"] for p in search_data)

def test_cost_calculator(client):
    # Total cost = 100 + 150 + 30 + 20 + 50 + 10 = 360
    # Desired margin = 20%
    # Suggested selling price = 360 / (1 - 0.20) = 360 / 0.80 = 450.0
    payload = {
        "material_cost": 100.0,
        "labor_cost": 150.0,
        "finishing_cost": 30.0,
        "packaging_cost": 20.0,
        "transport_cost": 50.0,
        "other_expenses": 10.0,
        "desired_margin_percentage": 20.0
    }
    response = client.post("/api/calculator", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_cost"] == 360.0
    assert data["suggested_selling_price"] == 450.0
    assert data["estimated_profit"] == 90.0

def test_cost_calculator_invalid_margin(client):
    payload = {
        "material_cost": 100.0,
        "labor_cost": 100.0,
        "desired_margin_percentage": 100.0  # Invalid! Margin must be < 100%
    }
    response = client.post("/api/calculator", json=payload)
    assert response.status_code in [400, 422]

def test_learning_modules(client):
    response = client.get("/api/learning/modules")
    assert response.status_code == 200
    modules = response.json()
    assert len(modules) >= 6
    assert any("Cutting" in m["category"] for m in modules)

def test_machine_directory(client):
    response = client.get("/api/machines")
    assert response.status_code == 200
    machines = response.json()
    assert len(machines) >= 4
    assert any("Cross-Cutting" in m["name"] for m in machines)

def test_lingua_assistant_navigation(client):
    # Test learn navigation
    response = client.post("/api/assistant/chat", json={
        "message": "Please show me bamboo cutting and weaving tutorials",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "NAVIGATE"
    assert data["action_data"] == "/learn"

    # Test Telugu language response
    response_te = client.post("/api/assistant/chat", json={
        "message": "నేను వెదురు బుట్టలు కొనాలనుకుంటున్నాను",
        "language": "te"
    })
    assert response_te.status_code == 200
    data_te = response_te.json()
    assert data_te["language"] == "te"
    assert data_te["action"] == "NAVIGATE"
    assert data_te["action_data"] == "/products"

    # Test Hindi language response
    response_hi = client.post("/api/assistant/chat", json={
        "message": "मुझे बाँस की टोकरी बनाना सीखना है",
        "language": "hi"
    })
    assert response_hi.status_code == 200
    data_hi = response_hi.json()
    assert data_hi["language"] == "hi"
    assert data_hi["action"] == "NAVIGATE"
    assert data_hi["action_data"] == "/learn"

def test_youtube_video_search_endpoint(client):
    response = client.get("/api/learning/videos?category=Bamboo%20Cutting")
    assert response.status_code == 200
    videos = response.json()
    assert len(videos) > 0
    first_vid = videos[0]
    assert "video_id" in first_vid
    assert "title" in first_vid
    assert "watch_url" in first_vid
    assert "embed_url" in first_vid
    assert "youtube" in first_vid["watch_url"].lower()

def test_expanded_categories(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    cats = response.json()
    assert len(cats) >= 6
    slugs = [c["slug"] for c in cats]
    assert "interior-decor" in slugs
    assert "traditional-crafts" in slugs
    assert "furniture" in slugs
    assert "kitchen-household" in slugs
    assert "raw-structural" in slugs
    assert "thin-sticks" in slugs

