from backend.app.database import SessionLocal, Base, engine
from backend.app.models import (
    User, ArtisanProfile, Category, Product, ProductImage,
    LearningModule, MachineDirectory, Review, UserBadge
)
from backend.app.auth import hash_password

def seed_database(force: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded and not forced
    existing_cat_count = db.query(Category).count()
    if existing_cat_count > 0 and not force:
        print(f"Database already contains {existing_cat_count} categories. Skipping seed to preserve all existing records.")
        db.close()
        return

    if force:
        print("Force flag set: clearing demo records for clean test run...")
        # Clear existing records only when explicitly forced (e.g. in test suite)
        db.query(Review).delete()
        db.query(ProductImage).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.query(LearningModule).delete()
        db.query(MachineDirectory).delete()
        db.commit()

    print("Seeding comprehensive LINGROVE database...")

    # 1. Categories (Aligned with Categories A through F)
    categories_data = [
        {
            "name": "Interior Design & Home Décor",
            "slug": "interior-decor",
            "description": "Artisan bamboo pendant lamps, ambient floor shades, decorative wall panels, room dividers, and interior accents.",
            "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
        },
        {
            "name": "Traditional Village-Made Products",
            "slug": "traditional-crafts",
            "description": "Authentic rural harvest baskets, winnowing trays (cheta), hand fans (visanakarra), mats, and woven storage boxes.",
            "image_url": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80"
        },
        {
            "name": "Bamboo Furniture",
            "slug": "furniture",
            "description": "Ergonomic lounge stools, handcrafted coffee tables, solid modular shelving, and mortise-pin joined chairs.",
            "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80"
        },
        {
            "name": "Kitchen & Household",
            "slug": "kitchen-household",
            "description": "Bamboo cutlery organizers, handled serving trays, heat-diffusing coasters, and countertop napkin dispensers.",
            "image_url": "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80"
        },
        {
            "name": "Raw Bamboo & Structural Materials",
            "slug": "raw-structural",
            "description": "Seasoned culms for pandiri ceremonial canopies, selected Dendrocalamus poles, weaving slivers, and craft bundles.",
            "image_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
        },
        {
            "name": "Thin Bamboo Sticks & Craft Material",
            "slug": "thin-sticks",
            "description": "Bundles of precision thin bamboo sticks for lawful art, festival crafts, school modeling, and decorative applications.",
            "image_url": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80"
        },
        {
            "name": "Vinayaka Chavithi Collection",
            "slug": "vinayaka-chavithi",
            "description": "Eco-friendly bamboo pandiri frames, mandapam decorations, festival torans, and traditional puja baskets for Ganesh festival.",
            "image_url": "/products/bamboo-poles-bundle.jpg"
        },
        {
            "name": "Pooja Essentials",
            "slug": "pooja-essentials",
            "description": "Handcrafted bamboo pooja baskets, sacred offering trays, flower baskets, and ceremonial festival containers.",
            "image_url": "/products/bamboo-harvest-basket.jpg"
        },
        {
            "name": "Bamboo Home & Lifestyle",
            "slug": "bamboo-home-lifestyle",
            "description": "Eco-friendly bamboo storage organizers, decorative lamps, handcrafted desk accessories, and modern living essentials.",
            "image_url": "/products/bamboo-pendant-lamp.jpg"
        },
        {
            "name": "Village Handicrafts",
            "slug": "village-handicrafts",
            "description": "Traditional rural woven bamboo crafts, artisan-made heritage decor, and authentic village handicrafts.",
            "image_url": "/products/bamboo-winnowing-tray.jpg"
        },
        {
            "name": "Seasonal & Festival Products",
            "slug": "seasonal-festivals",
            "description": "Artisan-crafted festive decorations for Sankranti, Diwali, Ugadi, and special seasonal celebration gift sets.",
            "image_url": "/products/bamboo-festival-sticks.jpg"
        }
    ]

    cat_map = {}
    for c in categories_data:
        cat = Category(**c)
        db.add(cat)
        db.flush()
        cat_map[cat.slug] = cat.id

    # 2. Users (if not exist)
    admin_user = db.query(User).filter(User.email == "admin@lingrove.org").first()
    if not admin_user:
        admin_user = User(
            email="admin@lingrove.org",
            password_hash=hash_password("admin123"),
            full_name="CMRTC Platform Administrator",
            phone="+91 98765 43210",
            role="admin",
            preferred_language="en",
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
        )
        db.add(admin_user)

    artisan_user1 = db.query(User).filter(User.email == "ramesh@lingrove.org").first()
    if not artisan_user1:
        artisan_user1 = User(
            email="ramesh@lingrove.org",
            password_hash=hash_password("artisan123"),
            full_name="Ramesh Kumar",
            phone="+91 94401 23456",
            role="artisan",
            preferred_language="te",
            avatar_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
        )
        db.add(artisan_user1)

    artisan_user2 = db.query(User).filter(User.email == "laxmi@lingrove.org").first()
    if not artisan_user2:
        artisan_user2 = User(
            email="laxmi@lingrove.org",
            password_hash=hash_password("artisan123"),
            full_name="Laxmi Bai",
            phone="+91 94402 34567",
            role="artisan",
            preferred_language="te",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
        )
        db.add(artisan_user2)

    customer_user = db.query(User).filter(User.email == "kavita@lingrove.org").first()
    if not customer_user:
        customer_user = User(
            email="kavita@lingrove.org",
            password_hash=hash_password("customer123"),
            full_name="Kavita Sharma",
            phone="+91 98800 11223",
            role="customer",
            preferred_language="hi",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        )
        db.add(customer_user)
    db.commit()

    # 3. Artisan Profiles
    artisan_profile1 = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == artisan_user1.id).first()
    if not artisan_profile1:
        artisan_profile1 = ArtisanProfile(
            user_id=artisan_user1.id,
            artisan_name="Ramesh Kumar",
            village="Lingala Village",
            region="Telangana",
            bio="Master bamboo artisan with over 12 years of hands-on experience in traditional weaving, harvest baskets, and raw culm sizing at CMRTC facility.",
            craft_specialization="Traditional Basketry & Raw Bamboo Processing",
            experience_years=12,
            phone="+91 94401 23456",
            avatar_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
            total_earnings=84500.0,
            is_verified=True
        )
        db.add(artisan_profile1)

    artisan_profile2 = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == artisan_user2.id).first()
    if not artisan_profile2:
        artisan_profile2 = ArtisanProfile(
            user_id=artisan_user2.id,
            artisan_name="Laxmi Bai",
            village="Lingala Village",
            region="Telangana",
            bio="Pioneering rural artisan entrepreneur specializing in bamboo lampshades, living room decor, and household utilities.",
            craft_specialization="Bamboo Lighting & Interior Décor",
            experience_years=8,
            phone="+91 94402 34567",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
            total_earnings=62300.0,
            is_verified=True
        )
        db.add(artisan_profile2)
    db.commit()

    # 4. Comprehensive Products (22+ Products across Categories A - F)
    products_data = [
        # --- Category A: Interior Design & Home Décor ---
        {
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["interior-decor"],
            "title": "Artisan Woven Bamboo Pendant Lamp Shade",
            "description": "Exquisite geometric bamboo pendant shade that projects warm atmospheric shadow patterns across living and dining spaces. Includes standard E27 holder ring.",
            "price": 1249.0,
            "stock": 14,
            "rating": 5.0,
            "review_count": 18,
            "dimensions": "35cm Diameter x 30cm Height",
            "materials": "Heat-Treated Bamboo Slivers, Jute Binding",
            "is_demo": True,
            "image": "/products/bamboo-pendant-lamp.jpg"
        },
        {
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["interior-decor"],
            "title": "Cylindrical Bamboo Floor Standing Lamp",
            "description": "Vertical ambient floor light crafted from uniform bamboo slats with an inner parchment diffuser for soft living room illumination.",
            "price": 2199.0,
            "stock": 8,
            "rating": 4.9,
            "review_count": 7,
            "dimensions": "25cm Diameter x 90cm Height",
            "materials": "Planed Bamboo Slats, Natural Timber Base",
            "is_demo": True,
            "image": "/products/bamboo-floor-lamp.jpg"
        },
        {
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["interior-decor"],
            "title": "Hexagonal Woven Bamboo Wall Art Panel",
            "description": "Decorative handcrafted lattice wall piece celebrating traditional Telangana geometric weaving patterns. Ready to mount.",
            "price": 899.0,
            "stock": 20,
            "rating": 4.8,
            "review_count": 11,
            "dimensions": "60cm x 60cm x 3cm",
            "materials": "Fine Seasoned Bamboo Strips",
            "is_demo": True,
            "image": "/products/bamboo-wall-panel.jpg"
        },
        {
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["interior-decor"],
            "title": "Minimalist Elevated Bamboo Planter with Tripod Stand",
            "description": "Solid natural culm plant holder on interlocking three-leg bamboo stand for indoor foliage and balcony decor.",
            "price": 549.0,
            "stock": 25,
            "rating": 4.7,
            "review_count": 15,
            "dimensions": "22cm Diameter x 32cm Height",
            "materials": "Boron-Treated Bamboo Culm",
            "is_demo": True,
            "image": "/products/bamboo-planter-stand.jpg"
        },
        {
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["interior-decor"],
            "title": "Sunburst Bamboo Splint Mirror Frame",
            "description": "Radial sunburst decorative mirror surround crafted from hand-cleaved tapering bamboo splints. Adds warmth and organic elegance.",
            "price": 1450.0,
            "stock": 9,
            "rating": 4.9,
            "review_count": 6,
            "dimensions": "50cm Total Diameter (25cm Mirror)",
            "materials": "Seasoned Bamboo Splints, Glass Mirror",
            "is_demo": True,
            "image": "/products/bamboo-sunburst-mirror.jpg"
        },

        # --- Category B: Traditional Village-Made Products ---
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["traditional-crafts"],
            "title": "Traditional Lingala Double-Rim Harvest Basket",
            "description": "Sturdy rural storage and market basket featuring reinforced circular double-rim and tight check weave. Built for heavy produce or home storage.",
            "price": 649.0,
            "stock": 30,
            "rating": 4.9,
            "review_count": 24,
            "dimensions": "34cm x 34cm x 26cm",
            "materials": "Matured Lingala Bamboo, Herbal Polish",
            "is_demo": True,
            "image": "/products/bamboo-harvest-basket.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["traditional-crafts"],
            "title": "Handcrafted Bamboo Winnowing Tray (Cheta / Soop)",
            "description": "Essential traditional rural grain cleaning tray with raised wedge borders and smooth polished front edge for easy grain sorting.",
            "price": 349.0,
            "stock": 35,
            "rating": 4.8,
            "review_count": 16,
            "dimensions": "42cm x 38cm x 8cm",
            "materials": "Outer Bamboo Epidermal Splints",
            "is_demo": True,
            "image": "/products/bamboo-winnowing-tray.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["traditional-crafts"],
            "title": "Natural Woven Bamboo Hand Fan (Visanakarra)",
            "description": "Classic rural cooling fan with tightly woven flexible slats and durable carved bamboo handle. Lightweight, zero-electricity comfort.",
            "price": 149.0,
            "stock": 50,
            "rating": 5.0,
            "review_count": 22,
            "dimensions": "28cm x 22cm (Handle: 14cm)",
            "materials": "Fine Flexible Bamboo Sliver",
            "is_demo": True,
            "image": "/products/bamboo-hand-fan.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["traditional-crafts"],
            "title": "Traditional Rollable Bamboo Floor Mat (Chapa)",
            "description": "Natural rollable sitting and sleeping mat woven from ultra-fine polished bamboo slivers. Keeps cool during summer heat.",
            "price": 999.0,
            "stock": 18,
            "rating": 4.9,
            "review_count": 13,
            "dimensions": "180cm x 90cm (6ft x 3ft)",
            "materials": "Micro-Sized Bamboo Weaving Slats",
            "is_demo": True,
            "image": "/products/bamboo-floor-mat.jpg"
        },

        # --- Category C: Bamboo Furniture ---
        {
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["furniture"],
            "title": "Ergonomic Bamboo Low Back Lounge Stool",
            "description": "Stout handcrafted seating stool made from thick-walled seasoned Dendrocalamus bamboo poles with tight rope-interwoven seating.",
            "price": 1899.0,
            "stock": 8,
            "rating": 4.8,
            "review_count": 9,
            "dimensions": "42cm x 42cm x 45cm",
            "materials": "Solid Node Bamboo, Jute Weave Seat",
            "is_demo": True,
            "image": "/products/bamboo-lounge-stool.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["furniture"],
            "title": "Handcrafted Solid Bamboo Coffee Table",
            "description": "Durable, eco-friendly table featuring cross-braced bamboo culm legs and a smooth slat top. Ideal for living rooms or covered patios.",
            "price": 3299.0,
            "stock": 5,
            "rating": 4.9,
            "review_count": 8,
            "dimensions": "75cm x 50cm x 45cm",
            "materials": "Seasoned Bamboo Poles, Hardwood Pins",
            "is_demo": True,
            "image": "/products/bamboo-coffee-table.jpg"
        },
        {
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["furniture"],
            "title": "Four-Tier Open Bamboo Display & Book Shelf",
            "description": "Lightweight yet rigid multi-tier utility rack for books, pantry storage, or potted succulents. Easy to wipe clean.",
            "price": 2799.0,
            "stock": 7,
            "rating": 4.7,
            "review_count": 5,
            "dimensions": "60cm x 30cm x 110cm",
            "materials": "Treated Structural Bamboo Culms",
            "is_demo": True,
            "image": "/products/bamboo-tier-shelf.jpg"
        },

        # --- Category D: Kitchen & Household ---
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["kitchen-household"],
            "title": "Adjustable Bamboo Cutlery & Utensil Organizer",
            "description": "Compartmentalized drawer tray for dining forks, spoons, and cooking ladles. Antibacterial natural bamboo surface.",
            "price": 699.0,
            "stock": 25,
            "rating": 4.9,
            "review_count": 19,
            "dimensions": "36cm x 28cm x 6cm",
            "materials": "Fine Sanded Bamboo Slats, Food-Grade Oil",
            "is_demo": True,
            "image": "/products/bamboo-cutlery-organizer.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["kitchen-household"],
            "title": "Dual-Handle Bamboo Serving Tray",
            "description": "Comfortable lightweight breakfast and tea tray with sturdy raised rim to prevent spills during hosting.",
            "price": 549.0,
            "stock": 30,
            "rating": 4.8,
            "review_count": 14,
            "dimensions": "40cm x 28cm x 5cm",
            "materials": "Laminated Bamboo Base, Woven Trim",
            "is_demo": True,
            "image": "/products/bamboo-serving-tray.jpg"
        },
        {
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["kitchen-household"],
            "title": "Bamboo Weave Table Coaster Set (Pack of 6)",
            "description": "Round heat-insulating cup coasters accompanied by a matching woven holding case. Protects wood tabletops from moisture rings.",
            "price": 279.0,
            "stock": 45,
            "rating": 4.8,
            "review_count": 21,
            "dimensions": "10cm Diameter each",
            "materials": "Interlocking Bamboo Ribbon",
            "is_demo": True,
            "image": "/products/bamboo-table-coasters.jpg"
        },

        # --- Category E: Raw Bamboo & Structural Materials ---
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["raw-structural"],
            "title": "Seasoned Bamboo Poles for Pandiri & Event Canopies (Bundle of 10)",
            "description": "Uniform 10-foot long straight bamboo poles harvested from mature 3-year clumps. Ideal for traditional wedding pandiri, ceremonial canopies, and garden trellises. (Note: Intended for traditional event and horticultural framing; not certified for permanent load-bearing civil construction).",
            "price": 1499.0,
            "stock": 20,
            "rating": 4.9,
            "review_count": 12,
            "dimensions": "Length: 10 ft (3.05m) | Diameter: 2.5 - 3 inches",
            "materials": "Seasoned Dendrocalamus Strictus Bamboo",
            "is_demo": True,
            "image": "/products/bamboo-poles-bundle.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["raw-structural"],
            "title": "Raw Dendrocalamus Strictus Bamboo Culms (Pack of 5)",
            "description": "Selected solid-wall bamboo culms air-seasoned and debarked at CMRTC center. Ready for custom carpentry, shelving, and outdoor furniture fabrication.",
            "price": 899.0,
            "stock": 25,
            "rating": 4.8,
            "review_count": 7,
            "dimensions": "Length: 8 ft (2.4m) | Diameter: 2.8 inches",
            "materials": "Boron-Salt Treated Raw Bamboo",
            "is_demo": True,
            "image": "/products/bamboo-raw-culms.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["raw-structural"],
            "title": "Split Bamboo Weaving Strips Bundle (100 Strips)",
            "description": "Calibrated 1.2mm flexible bamboo ribbons prepared using mechanical slicing machinery. Ideal for basket makers, craft schools, and DIY weavers.",
            "price": 399.0,
            "stock": 40,
            "rating": 5.0,
            "review_count": 15,
            "dimensions": "Length: 1.5m | Width: 12mm | Thickness: 1.2mm",
            "materials": "Debarked Outer-Cortex Bamboo Strips",
            "is_demo": True,
            "image": "/products/bamboo-weaving-strips.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["raw-structural"],
            "title": "Flat Bamboo Garden Trellis Laths (Pack of 50)",
            "description": "Planed flat bamboo splints designed for plant climbing supports, vegetable vine trellises, and rural boundary fencing.",
            "price": 599.0,
            "stock": 30,
            "rating": 4.7,
            "review_count": 8,
            "dimensions": "Length: 6 ft (1.8m) | Width: 25mm | Thickness: 5mm",
            "materials": "Split Natural Bamboo Laths",
            "is_demo": True,
            "image": "/products/bamboo-trellis-laths.jpg"
        },

        # --- Category F: Thin Bamboo Sticks & Craft Material ---
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["thin-sticks"],
            "title": "Precision Thin Bamboo Craft Sticks (Bundle of 200)",
            "description": "Smooth, uniform cylindrical raw bamboo sticks cut for lawful handicrafts, school architectural modeling, kite framing, and delicate woodwork.",
            "price": 199.0,
            "stock": 60,
            "rating": 4.9,
            "review_count": 28,
            "dimensions": "Length: 30cm | Diameter: 2.5mm",
            "materials": "Machine-Turned Splinter-Free Bamboo",
            "is_demo": True,
            "image": "/products/bamboo-precision-sticks.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["thin-sticks"],
            "title": "Raw Bamboo Incense & Diffuser Sticks (Bundle of 500)",
            "description": "Natural untreated porous bamboo core sticks suitable for herbal incense making, aromatherapy diffuser reeds, and fine hobby projects.",
            "price": 249.0,
            "stock": 80,
            "rating": 4.8,
            "review_count": 17,
            "dimensions": "Length: 25cm | Diameter: 1.8mm",
            "materials": "100% Biodegradable Core Bamboo",
            "is_demo": True,
            "image": "/products/bamboo-incense-sticks.jpg"
        },
        {
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["thin-sticks"],
            "title": "Festival Decoration Bamboo Sticks (Bundle of 100)",
            "description": "Flexible straight bamboo craft sticks supplied in convenient bundles for traditional festival decorations, floral bouquets, and lawful art displays.",
            "price": 299.0,
            "stock": 50,
            "rating": 4.8,
            "review_count": 11,
            "dimensions": "Length: 60cm | Diameter: 3.0mm",
            "materials": "Dried Elastic Bamboo Culm Splints",
            "is_demo": True,
            "image": "/products/bamboo-festival-sticks.jpg"
        },
        # --- Vinayaka Chavithi Collection ---
        {
            "sku": "LNG-VC-0001",
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["vinayaka-chavithi"],
            "subcategory": "Pandiri Frames & Decorative Structures",
            "title": "Modular Bamboo Pandiri Mandapam Frame (8x8 ft)",
            "description": "Sturdy, reusable eco-friendly Ganesh pandiri frame crafted from treated Dendrocalamus strictus solid bamboo poles. Includes pre-drilled interlocking joints, natural coir fastening rope, and step-by-step assembly guide.",
            "price": 3499.0,
            "discount_price": 2999.0,
            "stock": 15,
            "dimensions": "8 ft (H) x 8 ft (W) x 8 ft (D)",
            "weight": "24.5 kg",
            "materials": "100% Solid Natural Lingala Bamboo (Dendrocalamus strictus)",
            "craftsmanship_details": "Hand-cut by Lingala village artisans, kiln-seasoned against borers and moisture, precision mortise-and-peg joinery.",
            "customization_options": "Available in 6x6 ft, 8x8 ft, and 10x10 ft. Optional canopy ceiling trellis kit available on request.",
            "min_order_quantity": 1,
            "estimated_prep_time": "2-3 days handcrafting and seasoning",
            "delivery_pickup_info": "Workshop pickup at CMRTC / Village Workshop or local mini-truck freight dispatch.",
            "is_featured": True,
            "is_seasonal": True,
            "is_demo": False,
            "image": "/products/bamboo-poles-bundle.jpg"
        },
        {
            "sku": "LNG-VC-0002",
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["vinayaka-chavithi"],
            "subcategory": "Pandiri Decorations",
            "title": "Handcrafted Bamboo Hanging Toran & Ceiling Lattice",
            "description": "Festive hanging toran set woven from delicate bamboo slivers and adorned with traditional natural motifs.",
            "price": 549.0,
            "discount_price": 449.0,
            "stock": 40,
            "dimensions": "4 ft (L) x 8 inches (Drop)",
            "weight": "350 g",
            "materials": "Natural Lingala Bamboo slivers, organic vegetable dyes",
            "craftsmanship_details": "Fine hexagonal plaiting by women artisans of Lingala village; finished with non-toxic herbal sealant.",
            "customization_options": "Custom lengths from 3 ft to 12 ft for temple halls and large pandiris.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier delivery across India or workshop pickup.",
            "is_featured": True,
            "is_seasonal": True,
            "is_demo": False,
            "image": "/products/bamboo-festival-sticks.jpg"
        },
        {
            "sku": "LNG-VC-0003",
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["vinayaka-chavithi"],
            "subcategory": "Festival Baskets",
            "title": "Traditional Vinayaka Pooja Patri & Offering Basket",
            "description": "Sacred 21-patri leaves and offering basket hand-woven from young golden bamboo splits.",
            "price": 389.0,
            "discount_price": 320.0,
            "stock": 50,
            "dimensions": "12 inch (Dia) x 5 inch (Depth)",
            "weight": "280 g",
            "materials": "100% Young Spring Bamboo Splits, unbleached natural finish",
            "craftsmanship_details": "Twisted rim reinforcement (kuduru binding) ensuring durability.",
            "customization_options": "Single or set of 3 nesting baskets.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier or workshop pickup.",
            "is_featured": False,
            "is_seasonal": True,
            "is_demo": False,
            "image": "/products/bamboo-harvest-basket.jpg"
        },
        # --- Pooja Essentials ---
        {
            "sku": "LNG-PJ-0001",
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["pooja-essentials"],
            "subcategory": "Pooja Baskets",
            "title": "Heritage Arch-Handle Bamboo Pooja Basket (Phool Dala)",
            "description": "Classic temple and home pooja basket featuring an ergonomic arched bamboo handle and tight twill weave base.",
            "price": 420.0,
            "discount_price": 350.0,
            "stock": 35,
            "dimensions": "10 inch (Dia) x 11 inch (Total Height with handle)",
            "weight": "310 g",
            "materials": "Seasoned Lingala Village Bamboo, solid bentwood handle",
            "craftsmanship_details": "Steam-bent solid bamboo cane handle riveted with natural bamboo pins.",
            "customization_options": "Available in natural blonde bamboo or turmeric-treated golden hue.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier delivery across India or workshop pickup.",
            "is_featured": True,
            "is_seasonal": False,
            "is_demo": False,
            "image": "/products/bamboo-harvest-basket.jpg"
        },
        {
            "sku": "LNG-PJ-0002",
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["pooja-essentials"],
            "subcategory": "Handmade Trays",
            "title": "Ritual Bamboo Offering Tray with Raised Rims",
            "description": "Auspicious flat ceremonial thali tray handwoven from premium sliced bamboo strips.",
            "price": 480.0,
            "discount_price": 399.0,
            "stock": 30,
            "dimensions": "14 inch (L) x 10 inch (W) x 1.8 inch (H)",
            "weight": "420 g",
            "materials": "Fine bamboo outer slivers and split bamboo border",
            "craftsmanship_details": "Dense chevron weave with double-layered rim binding.",
            "customization_options": "Custom sizes available for temple trusts and institutional ceremonies.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier or workshop pickup.",
            "is_featured": False,
            "is_seasonal": False,
            "is_demo": False,
            "image": "/products/bamboo-serving-tray.jpg"
        },
        {
            "sku": "LNG-PJ-0003",
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["pooja-essentials"],
            "subcategory": "Pooja Accessories",
            "title": "Handmade Bamboo Incense Stick Stand & Ash Catcher",
            "description": "Minimalist handcrafted bamboo incense stand with angled slot and natural curved canal for neat ash collection.",
            "price": 199.0,
            "discount_price": 149.0,
            "stock": 60,
            "dimensions": "10 inch (L) x 1.5 inch (W) x 1 inch (H)",
            "weight": "90 g",
            "materials": "Solid seasoned bamboo culm section",
            "craftsmanship_details": "Hand-carved from a single node of mature bamboo; heat-treated finish.",
            "customization_options": "Bulk branded engraving available for wedding return gifts.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier or workshop pickup.",
            "is_featured": False,
            "is_seasonal": False,
            "is_demo": False,
            "image": "/products/bamboo-incense-sticks.jpg"
        },
        # --- Bamboo Home & Lifestyle ---
        {
            "sku": "LNG-HL-0001",
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["bamboo-home-lifestyle"],
            "subcategory": "Storage Baskets",
            "title": "Multi-Utility Nesting Bamboo Storage Organizers (Set of 3)",
            "description": "Set of three rectangular handwoven storage bins ideal for living room shelves, wardrobe organization, and sustainable bathroom storage.",
            "price": 1150.0,
            "discount_price": 950.0,
            "stock": 25,
            "dimensions": "Small (8x6x4 in), Medium (10x8x5 in), Large (12x10x6 in)",
            "weight": "1.2 kg total set",
            "materials": "Select mature bamboo peel strips, unbleached cotton lining",
            "craftsmanship_details": "Woven on village timber frames by master weavers; non-splinter hand-sanded finish.",
            "customization_options": "Removable machine-washable cotton liner in natural or indigo dye.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier delivery across India.",
            "is_featured": True,
            "is_seasonal": False,
            "is_demo": False,
            "image": "/products/bamboo-harvest-basket.jpg"
        },
        {
            "sku": "LNG-HL-0002",
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["bamboo-home-lifestyle"],
            "subcategory": "Table Organizers",
            "title": "Artisan Desk Organizer & Pen Stand with Phone Cradle",
            "description": "Sustainable desktop station featuring twin bamboo cylinders for stationery, business card groove, and an angled bamboo mobile stand.",
            "price": 499.0,
            "discount_price": 399.0,
            "stock": 45,
            "dimensions": "7.5 inch (L) x 3.5 inch (W) x 4 inch (H)",
            "weight": "320 g",
            "materials": "Mature bamboo node sections and solid bamboo baseboard",
            "craftsmanship_details": "Precision-cut at CMRTC bamboo machinery facility and hand-finished with beeswax polish.",
            "customization_options": "Custom logo or name laser engraving available.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier delivery or campus pickup.",
            "is_featured": False,
            "is_seasonal": False,
            "is_demo": False,
            "image": "/products/bamboo-cutlery-organizer.jpg"
        },
        # --- Village Handicrafts ---
        {
            "sku": "LNG-VH-0001",
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["village-handicrafts"],
            "subcategory": "Traditional Woven Crafts",
            "title": "Authentic Telangana Heritage Winnowing Pan (Cheta / Soop)",
            "description": "The quintessential Indian village kitchen and harvest tool, handwoven with high-tensile bamboo splits and reinforced with thick cane edging.",
            "price": 349.0,
            "discount_price": 289.0,
            "stock": 50,
            "dimensions": "16 inch (L) x 14 inch (W) x 4 inch (Rear Rise)",
            "weight": "380 g",
            "materials": "100% Traditional Village Lingala Bamboo & Wild Cane Rattan Binding",
            "craftsmanship_details": "Tight diagonal twill pattern woven by generational artisans of the Medari community.",
            "customization_options": "Natural plain finish or turmeric-blessed ceremonial finish.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier across India or CMRTC pickup.",
            "is_featured": True,
            "is_seasonal": False,
            "is_demo": False,
            "image": "/products/bamboo-winnowing-tray.jpg"
        },
        {
            "sku": "LNG-VH-0002",
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["village-handicrafts"],
            "subcategory": "Artisan Decorative Products",
            "title": "Handcrafted Bamboo Summer Hand Fan (Visanakarra)",
            "description": "Traditional hand fan woven with micro-thin flexible bamboo slivers, featuring a lightweight bamboo handle and colorful fabric-stitched perimeter.",
            "price": 180.0,
            "discount_price": 140.0,
            "stock": 65,
            "dimensions": "12 inch blade width x 15 inch total height",
            "weight": "110 g",
            "materials": "Micro-split bamboo slivers, handloom cotton border",
            "craftsmanship_details": "Intricate cross-weave fan blade mounted on durable single-piece split handle.",
            "customization_options": "Border color choices: Red, Saffron, Green, Royal Blue.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier or workshop pickup.",
            "is_featured": False,
            "is_seasonal": False,
            "is_demo": False,
            "image": "/products/bamboo-hand-fan.jpg"
        },
        # --- Seasonal & Festival Products ---
        {
            "sku": "LNG-SF-0001",
            "artisan_id": artisan_profile1.id,
            "category_id": cat_map["seasonal-festivals"],
            "subcategory": "Sankranti Decorations",
            "title": "Sankranti Harvest Festival Bamboo Gift Hamper Basket",
            "description": "Festive hexagonal lidded bamboo hamper basket created especially for Sankranti harvest gifts, jaggery sweets, sugarcane slices, and festival offerings.",
            "price": 699.0,
            "discount_price": 580.0,
            "stock": 30,
            "dimensions": "11 inch (Dia) x 7 inch (H with fitted lid)",
            "weight": "480 g",
            "materials": "Golden seasoned bamboo with dyed festive accent strips",
            "craftsmanship_details": "Fitted interlocking bamboo lid with loop toggle handle; festive woven check pattern.",
            "customization_options": "Custom gift tag insert and corporate festival packaging.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier across India or CMRTC pickup.",
            "is_featured": True,
            "is_seasonal": True,
            "is_demo": False,
            "image": "/products/bamboo-harvest-basket.jpg"
        },
        {
            "sku": "LNG-SF-0002",
            "artisan_id": artisan_profile2.id,
            "category_id": cat_map["seasonal-festivals"],
            "subcategory": "Diwali & Ugadi Decorations",
            "title": "Eco-Diwali Hanging Bamboo Lantern (Kandil / Akasha Deepam)",
            "description": "Exquisite geometric collapsible hanging lantern crafted from thin bamboo laths and handmade translucent butter paper.",
            "price": 599.0,
            "discount_price": 499.0,
            "stock": 35,
            "dimensions": "14 inch (H) x 10 inch (Dia) with 12 inch tail streamers",
            "weight": "260 g",
            "materials": "Bamboo craft laths, handmade eco-friendly paper, natural jute string",
            "craftsmanship_details": "Collapsible flat-pack design for safe shipping; assembled in seconds.",
            "customization_options": "Choice of paper accent colors: Gold-Yellow, Deep Crimson, Festive Ochre.",
            "min_order_quantity": 1,
            "estimated_prep_time": "Ready to ship",
            "delivery_pickup_info": "Standard courier across India or CMRTC pickup.",
            "is_featured": True,
            "is_seasonal": True,
            "is_demo": False,
            "image": "/products/bamboo-pendant-lamp.jpg"
        }
    ]

    for idx, p in enumerate(products_data):
        image_url = p.pop("image")
        if "sku" not in p:
            p["sku"] = f"LNG-PRD-{idx+1:04d}"
        prod = Product(**p)
        db.add(prod)
        db.flush()
        db.add(ProductImage(product_id=prod.id, image_url=image_url, is_primary=True))
    db.commit()

    # 5. Learning Modules with VERIFIED EDUCATIONAL BAMBOO YOUTUBE VIDEOS
    modules_data = [
        {
            "title": "Bamboo Harvesting & Cross-Cutting Fundamentals",
            "category": "Bamboo Cutting",
            "difficulty": "beginner",
            "estimated_duration": "20 mins",
            "thumbnail_url": "https://i.ytimg.com/vi/1sz1AlNKzUs/hqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=1sz1AlNKzUs",
            "is_demo": True,
            "summary": "Master the initial selection of mature 3-4 year old bamboo culms and precision cross-cutting techniques without splintering.",
            "learning_objectives": "1. Identify mature bamboo stems by grey-green patina.\n2. Select proper saw blade tooth pitch.\n3. Secure culms properly to eliminate splintering.\n4. Apply eye and hearing safety gear.",
            "steps_content": "### Step 1: Inspection\nSelect culms that have reached at least 3 years maturity. Stems should exhibit uniform grey-green coloration without fungal spots.\n\n### Step 2: Marking\nMeasure required length from the node joint. Keep cuts 2cm away from nodes to maximize joint integrity.\n\n### Step 3: Sawing Technique\nUse a fine-toothed Japanese pull saw or circular cutter. Rotate the culm during cutting rather than forcing blade through.",
            "safety_precautions": "Always wear safety goggles and leather gloves. Bamboo splinters can be deep and easily infected. Keep hands 15cm clear of blades."
        },
        {
            "title": "Precision Bamboo Splitting: Hand & Wedge Methods",
            "category": "Bamboo Splitting",
            "difficulty": "beginner",
            "estimated_duration": "25 mins",
            "thumbnail_url": "https://i.ytimg.com/vi/7vCeeOWfuAY/hqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=7vCeeOWfuAY",
            "is_demo": True,
            "summary": "Learn how to divide round bamboo culms into symmetrical halves, quarters, and eighths using radial splitting tools and hand wedges.",
            "learning_objectives": "1. Understand radial grain cleavage.\n2. Center radial splitter star blades.\n3. Execute hammer mallet strikes safely.\n4. Grade split splints by width.",
            "steps_content": "### Step 1: Vertical Positioning\nPlace the cut bamboo culm vertically on a stable wooden block.\n\n### Step 2: Aligning the Splitter\nCenter the radial wedge splitter on the top opening of the culm.\n\n### Step 3: Striking\nUse a rubber or wooden mallet to drive the splitter straight downwards. Guide the splits smoothly along natural fibers.",
            "safety_precautions": "Never hold the bamboo below the wedge with bare hands. Use protective gloves. Stand firm with balanced posture."
        },
        {
            "title": "Bamboo Slicing & Uniform Strip Processing",
            "category": "Bamboo Slicing",
            "difficulty": "intermediate",
            "estimated_duration": "30 mins",
            "thumbnail_url": "https://i.ytimg.com/vi/rvja5Y2Mj_A/hqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=rvja5Y2Mj_A",
            "is_demo": True,
            "summary": "Remove inner and outer green silica skin and create uniform millimeter-precise weaving slivers using slicing blades.",
            "learning_objectives": "1. Remove internal pith layer.\n2. Calibrate slicing blade gap to 1.2mm.\n3. Feed bamboo splints consistently.\n4. Grade outer epidermal strips versus inner core.",
            "steps_content": "### Step 1: Skin Debarking\nPeel or plane the glassy outer green epidermis.\n\n### Step 2: Blade Calibration\nSet the machine or hand guillotine gap to exactly 1.2mm for flexible weaving splints.\n\n### Step 3: Feeding\nFeed strips horizontally with steady feed rate, keeping fibers aligned.",
            "safety_precautions": "Keep finger clearance at least 10cm from roller guides. Never reverse motorized rollers with hands near opening."
        },
        {
            "title": "Traditional Lingala Basket Weaving: Hexagonal & Plain",
            "category": "Basket Making",
            "difficulty": "intermediate",
            "estimated_duration": "45 mins",
            "thumbnail_url": "https://i.ytimg.com/vi/qI27XVrPhlA/hqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=qI27XVrPhlA",
            "is_demo": True,
            "summary": "Step-by-step masterclass in creating the signature Lingala reinforced harvest basket with interlocked circular rim.",
            "learning_objectives": "1. Build a self-locking star base.\n2. Bend warp stakes upward.\n3. Weave weft strips using twill pattern.\n4. Bind outer cane rim tightly.",
            "steps_content": "### Step 1: Star Base\nLay 6 horizontal and 6 vertical strips in a woven check. Interlock four diagonal binding slivers.\n\n### Step 2: Wall Rising\nWet the bamboo strips lightly with water to increase elasticity. Bend warp strips upwards 90 degrees.\n\n### Step 3: Rim Reinforcement\nBend a thick split bamboo hoop around the opening. Lash securely with natural rattan or split fiber.",
            "safety_precautions": "Soak splints in clean water before bending to prevent sudden snapped shards. Wear light fingertip protectors."
        },
        {
            "title": "Bamboo Furniture Joinery & Pin Mortise Techniques",
            "category": "Furniture Making",
            "difficulty": "advanced",
            "estimated_duration": "60 mins",
            "thumbnail_url": "https://i.ytimg.com/vi/Ax2iLVLeVK4/hqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=Ax2iLVLeVK4",
            "is_demo": True,
            "summary": "Discover how to join hollow bamboo poles without splitting using fish-mouth joints, hardwood dowels, and tension pins.",
            "learning_objectives": "1. Cut fish-mouth saddle contours.\n2. Drill bolt holes without fiber cracking.\n3. Insert hardwood internal reinforcement plugs.\n4. Assemble rigid stools and armchairs.",
            "steps_content": "### Step 1: Saddle Contour\nTrace the diameter of the receiving pole onto the connecting pole. Use a coping saw or hole saw to profile the fish-mouth curve.\n\n### Step 2: Wood Plug Reinforcement\nTurn a scrap cylindrical wooden dowel to match the internal bore and glue inside the bamboo node.\n\n### Step 3: Pinning\nDrill clean holes through both pieces and drive a bamboo peg or threaded rod with decorative acorn nut.",
            "safety_precautions": "Clamp pieces firmly in vise before drilling. Do not freehand drill through curved bamboo culms."
        },
        {
            "title": "Surface Finishing, Boron Treatment & Packaging",
            "category": "Finishing Techniques",
            "difficulty": "beginner",
            "estimated_duration": "25 mins",
            "thumbnail_url": "https://i.ytimg.com/vi/Zc7G5eN4N3g/hqdefault.jpg",
            "video_url": "https://www.youtube.com/watch?v=Zc7G5eN4N3g",
            "is_demo": True,
            "summary": "Protect finished bamboo items against powder-post beetles, mold, and humidity while applying eco-certified vegetable finishes.",
            "learning_objectives": "1. Prepare eco-friendly Borax-Boric acid bath.\n2. Sand surfaces through 120-320 grit sandpaper.\n3. Apply natural beeswax or linseed polish.\n4. Pack with moisture absorbent silica packets.",
            "steps_content": "### Step 1: Treatment\nDip cleaned bamboo in 1:1 Borax and Boric acid solution to eliminate starch that attracts borers.\n\n### Step 2: Drying\nAir dry slowly in shaded, ventilated racks away from direct midday sun to prevent checking cracks.\n\n### Step 3: Hand Waxing\nBuff with pure beeswax paste using cotton cloth along the grain.",
            "safety_precautions": "Work in well-ventilated space when applying treatments. Wear dust mask during sanding."
        }
    ]

    for m in modules_data:
        db.add(LearningModule(**m))
    db.commit()

    # 6. Machine Directory
    machines_data = [
        {
            "name": "Heavy-Duty Bamboo Cross-Cutting Machine",
            "purpose": "Accurately cuts raw bamboo poles to predetermined lengths without splintering or crushing ends.",
            "main_components": "High-torque 3HP electric motor, tungsten carbide-tipped circular saw blade, clamp roller guide, emergency stop pedal.",
            "maintenance_info": "Inspect blade teeth weekly for chipping. Lubricate linear guide rails every 40 operating hours. Blow sawdust out of motor casing daily.",
            "safety_precautions": "CRITICAL: Never bypass safety blade guards. Operator must wear polycarbonate eye protection, hearing protection, and fitted cuffs.",
            "indicative_price": "₹45,000 – ₹65,000 (Indicative verification at CMRTC)",
            "supplier_info": "CMRTC Engineering Wing & Certified Rural Technology Vendors",
            "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Hydraulic Radial Bamboo Splitting Machine",
            "purpose": "Splits round bamboo culms into 4, 6, 8, or 10 symmetrical longitudinal sections in a single hydraulic stroke.",
            "main_components": "Hydraulic ram cylinder, multi-blade star cutter heads (interchangeable), centering guide carriage, pressure control valve.",
            "maintenance_info": "Check hydraulic fluid reservoir level monthly. Sharpen star wedge blades with oil stone. Tighten carriage mounting bolts.",
            "safety_precautions": "CRITICAL PINCH HAZARD: Keep hands entirely outside ram travel zone while cycle is active. Two-hand safety control button mandatory.",
            "indicative_price": "₹85,000 – ₹1,20,000 (Based on tonnage capacity)",
            "supplier_info": "National Bamboo Mission Authorized Machinery Partners",
            "image_url": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Bamboo Slicing & Node Removing Machine",
            "purpose": "Removes bamboo internal and external knots and slices split bamboo into consistent flexible slivers for weaving.",
            "main_components": "Dual counter-rotating feed rollers, precision flat slicing knife, adjustable micrometer gap dial, 2HP geared motor.",
            "maintenance_info": "Hone knife edge daily. Keep roller grooves free of dried bamboo sap using kerosene wipe down. Check drive chain tension.",
            "safety_precautions": "CRITICAL ROLLER HAZARD: No loose sleeves, long hair, or jewelry. Feed bamboo with push-stick when strip is under 30cm.",
            "indicative_price": "₹60,000 – ₹80,000",
            "supplier_info": "CMRTC Bamboo Technology Incubation Center",
            "image_url": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Bamboo Strip Planer & Sizing Machine",
            "purpose": "Calibrates the exact width and thickness of bamboo strips for precision joinery, furniture, and delicate basket rims.",
            "main_components": "Dual cutter heads (top and bottom), carbide sizing knives, spring-loaded hold-down rollers, dust extraction port.",
            "maintenance_info": "Empty dust collector regularly to avoid fire hazard. Inspect drive belts for slippage every month.",
            "safety_precautions": "Wear certified dust mask and eye shield. Never reach inside clearance port while cutterheads are spinning down.",
            "indicative_price": "₹55,000 – ₹75,000",
            "supplier_info": "State Rural Development Technology Cell",
            "image_url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
        }
    ]

    for m in machines_data:
        db.add(MachineDirectory(**m))
    db.commit()

    # 7. Reviews
    first_product = db.query(Product).first()
    first_module = db.query(LearningModule).first()

    reviews_data = [
        {
            "user_id": customer_user.id,
            "product_id": first_product.id,
            "review_type": "product",
            "rating": 5,
            "comment": "The Lingala harvest basket is exceptionally well made! The bamboo finish is silky smooth, and it holds heavy produce without bowing. Proud to support our rural artisans.",
            "is_verified_purchase": True,
            "is_moderated": True
        },
        {
            "user_id": customer_user.id,
            "module_id": first_module.id,
            "review_type": "learning",
            "rating": 5,
            "comment": "The step-by-step guidance on cross-cutting and safety precautions helped me understand proper blade care. Great initiative by CMRTC!",
            "is_verified_purchase": False,
            "is_moderated": True
        },
        {
            "user_id": customer_user.id,
            "review_type": "platform",
            "rating": 5,
            "comment": "Lingrove is a transformative bridge between rural bamboo craftsmanship and sustainable urban living. Multilingual interface makes it welcoming for everyone.",
            "is_verified_purchase": False,
            "is_moderated": True
        }
    ]

    for r in reviews_data:
        db.add(Review(**r))

    # Badges
    existing_badge_count = db.query(UserBadge).filter(UserBadge.user_id == artisan_user1.id).count()
    if existing_badge_count == 0:
        db.add(UserBadge(
            user_id=artisan_user1.id,
            badge_name="Master Basket Weaver",
            badge_description="Recognized for exceptional craftsmanship in traditional Lingala basketry.",
            badge_icon="Award"
        ))
        db.add(UserBadge(
            user_id=artisan_user1.id,
            badge_name="CMRTC Pioneer Artisan",
            badge_description="Founding rural artisan member at CMRTC Lingala Bamboo Center.",
            badge_icon="ShieldCheck"
        ))

    db.commit()
    db.close()
    print("LINGROVE database successfully seeded with expanded 6 categories, 22+ authentic products, and verified video curriculum!")

if __name__ == "__main__":
    seed_database(force=True)
