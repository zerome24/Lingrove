import sqlite3
import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "lingrove.db"

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

NEW_CATEGORIES = [
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

NEW_PRODUCTS = [
    # --- Vinayaka Chavithi Collection ---
    {
        "sku": "LNG-VC-0001",
        "category_slug": "vinayaka-chavithi",
        "subcategory": "Pandiri Frames & Decorative Structures",
        "title": "Modular Bamboo Pandiri Mandapam Frame (8x8 ft)",
        "description": "Sturdy, reusable eco-friendly Ganesh pandiri frame crafted from treated Dendrocalamus strictus solid bamboo poles. Includes pre-drilled interlocking joints, natural coir fastening rope, and step-by-step assembly guide. Replaces plastic and metal structures with 100% natural heritage craftsmanship.",
        "price": 3499.00,
        "discount_price": 2999.00,
        "stock": 15,
        "dimensions": "8 ft (H) x 8 ft (W) x 8 ft (D)",
        "weight": "24.5 kg",
        "materials": "100% Solid Natural Lingala Bamboo (Dendrocalamus strictus) & Organic Coir",
        "craftsmanship_details": "Hand-cut by Lingala village artisans, kiln-seasoned against borers and moisture, precision mortise-and-peg joinery.",
        "customization_options": "Available in 6x6 ft, 8x8 ft, and 10x10 ft. Optional canopy ceiling trellis kit available on request.",
        "min_order_quantity": 1,
        "estimated_prep_time": "2-3 days handcrafting and seasoning",
        "delivery_pickup_info": "Compact bundled poles (8 ft length). Workshop pickup at CMRTC / Village Workshop or local mini-truck freight dispatch.",
        "is_featured": True,
        "is_seasonal": True,
        "image_url": "/products/bamboo-poles-bundle.jpg"
    },
    {
        "sku": "LNG-VC-0002",
        "category_slug": "vinayaka-chavithi",
        "subcategory": "Pandiri Decorations",
        "title": "Handcrafted Bamboo Hanging Toran & Ceiling Lattice",
        "description": "Festive hanging toran set woven from delicate bamboo slivers and adorned with traditional natural motifs. Perfect for adorning the entrance of home mandapams or community pandiris.",
        "price": 549.00,
        "discount_price": 449.00,
        "stock": 40,
        "dimensions": "4 ft (L) x 8 inches (Drop)",
        "weight": "350 g",
        "materials": "Natural Lingala Bamboo slivers, organic vegetable dyes (turmeric & vermilion tones), cotton thread",
        "craftsmanship_details": "Fine hexagonal plaiting by women artisans of Lingala village; finished with non-toxic herbal sealant.",
        "customization_options": "Custom lengths from 3 ft to 12 ft for temple halls and large pandiris.",
        "min_order_quantity": 1,
        "estimated_prep_time": "Ready to ship",
        "delivery_pickup_info": "Standard courier delivery across India or workshop pickup.",
        "is_featured": True,
        "is_seasonal": True,
        "image_url": "/products/bamboo-festival-sticks.jpg"
    },
    {
        "sku": "LNG-VC-0003",
        "category_slug": "vinayaka-chavithi",
        "subcategory": "Festival Baskets",
        "title": "Traditional Vinayaka Pooja Patri & Offering Basket",
        "description": "Sacred 21-patri leaves and offering basket hand-woven from young golden bamboo splits. Breathable weave keeps fresh flowers, modaks, and pooja leaves fresh throughout the ceremonial day.",
        "price": 389.00,
        "discount_price": 320.00,
        "stock": 50,
        "dimensions": "12 inch (Dia) x 5 inch (Depth)",
        "weight": "280 g",
        "materials": "100% Young Spring Bamboo Splits, unbleached natural finish",
        "craftsmanship_details": "Twisted rim reinforcement (kuduru binding) ensuring durability for years of festive usage.",
        "customization_options": "Single or set of 3 nesting baskets.",
        "min_order_quantity": 1,
        "estimated_prep_time": "Ready to ship",
        "delivery_pickup_info": "Standard courier or workshop pickup.",
        "is_featured": False,
        "is_seasonal": True,
        "image_url": "/products/bamboo-harvest-basket.jpg"
    },

    # --- Pooja Essentials ---
    {
        "sku": "LNG-PJ-0001",
        "category_slug": "pooja-essentials",
        "subcategory": "Pooja Baskets",
        "title": "Heritage Arch-Handle Bamboo Pooja Basket (Phool Dala)",
        "description": "Classic temple and home pooja basket featuring an ergonomic arched bamboo handle and tight twill weave base. Designed for carrying daily pooja flowers, sacred water vessels, and offerings.",
        "price": 420.00,
        "discount_price": 350.00,
        "stock": 35,
        "dimensions": "10 inch (Dia) x 11 inch (Total Height with handle)",
        "weight": "310 g",
        "materials": "Seasoned Lingala Village Bamboo, solid bentwood handle",
        "craftsmanship_details": "Steam-bent solid bamboo cane handle riveted with natural bamboo pins; smooth burr-free rim.",
        "customization_options": "Available in natural blonde bamboo or turmeric-treated golden hue.",
        "min_order_quantity": 1,
        "estimated_prep_time": "Ready to ship",
        "delivery_pickup_info": "Standard courier delivery across India or workshop pickup.",
        "is_featured": True,
        "is_seasonal": False,
        "image_url": "/products/bamboo-harvest-basket.jpg"
    },
    {
        "sku": "LNG-PJ-0002",
        "category_slug": "pooja-essentials",
        "subcategory": "Handmade Trays",
        "title": "Ritual Bamboo Offering Tray with Raised Rims",
        "description": "Auspicious flat ceremonial thali tray handwoven from premium sliced bamboo strips. Features sturdy raised edges to securely hold kumkum bharinas, camphor holders, and prasad bowls.",
        "price": 480.00,
        "discount_price": 399.00,
        "stock": 30,
        "dimensions": "14 inch (L) x 10 inch (W) x 1.8 inch (H)",
        "weight": "420 g",
        "materials": "Fine bamboo outer slivers and split bamboo border",
        "craftsmanship_details": "Dense chevron weave with double-layered rim binding for rigidity and water resistance.",
        "customization_options": "Custom sizes available for temple trusts and institutional ceremonies.",
        "min_order_quantity": 1,
        "estimated_prep_time": "Ready to ship",
        "delivery_pickup_info": "Standard courier or workshop pickup.",
        "is_featured": False,
        "is_seasonal": False,
        "image_url": "/products/bamboo-serving-tray.jpg"
    },
    {
        "sku": "LNG-PJ-0003",
        "category_slug": "pooja-essentials",
        "subcategory": "Pooja Accessories",
        "title": "Handmade Bamboo Incense Stick Stand & Ash Catcher",
        "description": "Minimalist handcrafted bamboo incense stand with angled slot and natural curved canal for neat ash collection. Infuses pooja spaces with serene earthiness.",
        "price": 199.00,
        "discount_price": 149.00,
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
        "image_url": "/products/bamboo-incense-sticks.jpg"
    },

    # --- Bamboo Home & Lifestyle ---
    {
        "sku": "LNG-HL-0001",
        "category_slug": "bamboo-home-lifestyle",
        "subcategory": "Storage Baskets",
        "title": "Multi-Utility Nesting Bamboo Storage Organizers (Set of 3)",
        "description": "Set of three rectangular handwoven storage bins ideal for living room shelves, wardrobe organization, and sustainable bathroom storage. Naturally odor-resistant and breathable.",
        "price": 1150.00,
        "discount_price": 950.00,
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
        "image_url": "/products/bamboo-harvest-basket.jpg"
    },
    {
        "sku": "LNG-HL-0002",
        "category_slug": "bamboo-home-lifestyle",
        "subcategory": "Table Organizers",
        "title": "Artisan Desk Organizer & Pen Stand with Phone Cradle",
        "description": "Sustainable desktop station featuring twin bamboo cylinders for stationery, business card groove, and an angled bamboo mobile stand with charging cable port.",
        "price": 499.00,
        "discount_price": 399.00,
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
        "image_url": "/products/bamboo-cutlery-organizer.jpg"
    },

    # --- Village Handicrafts ---
    {
        "sku": "LNG-VH-0001",
        "category_slug": "village-handicrafts",
        "subcategory": "Traditional Woven Crafts",
        "title": "Authentic Telangana Heritage Winnowing Pan (Cheta / Soop)",
        "description": "The quintessential Indian village kitchen and harvest tool, handwoven with high-tensile bamboo splits and reinforced with thick cane edging. Used traditionally for cleaning grains, drying spices, and auspicious wedding rituals.",
        "price": 349.00,
        "discount_price": 289.00,
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
        "image_url": "/products/bamboo-winnowing-tray.jpg"
    },
    {
        "sku": "LNG-VH-0002",
        "category_slug": "village-handicrafts",
        "subcategory": "Artisan Decorative Products",
        "title": "Handcrafted Bamboo Summer Hand Fan (Visanakarra)",
        "description": "Traditional hand fan woven with micro-thin flexible bamboo slivers, featuring a lightweight bamboo handle and colorful fabric-stitched perimeter. Provides gentle, natural cooling without electricity.",
        "price": 180.00,
        "discount_price": 140.00,
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
        "image_url": "/products/bamboo-hand-fan.jpg"
    },

    # --- Seasonal & Festival Products ---
    {
        "sku": "LNG-SF-0001",
        "category_slug": "seasonal-festivals",
        "subcategory": "Sankranti Decorations",
        "title": "Sankranti Harvest Festival Bamboo Gift Hamper Basket",
        "description": "Festive hexagonal lidded bamboo hamper basket created especially for Sankranti harvest gifts, jaggery sweets, sugarcane slices, and festival offerings. Reusable for kitchen storage all year round.",
        "price": 699.00,
        "discount_price": 580.00,
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
        "image_url": "/products/bamboo-harvest-basket.jpg"
    },
    {
        "sku": "LNG-SF-0002",
        "category_slug": "seasonal-festivals",
        "subcategory": "Diwali & Ugadi Decorations",
        "title": "Eco-Diwali Hanging Bamboo Lantern (Kandil / Akasha Deepam)",
        "description": "Exquisite geometric collapsible hanging lantern crafted from thin bamboo laths and handmade translucent butter paper. Creates warm ambient shadows when fitted with an LED diwali bulb or tealight.",
        "price": 599.00,
        "discount_price": 499.00,
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
        "image_url": "/products/bamboo-pendant-lamp.jpg"
    }
]

def seed_expansion(db_path: Path = DB_PATH):
    print(f"[*] Seeding catalogue expansion in {db_path}...")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Insert new categories if not present
    cat_slug_to_id = {}
    for cat in NEW_CATEGORIES:
        c.execute("SELECT id FROM categories WHERE slug = ?", (cat["slug"],))
        row = c.fetchone()
        if not row:
            print(f"  + Inserting category: {cat['name']} ({cat['slug']})")
            c.execute(
                "INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)",
                (cat["name"], cat["slug"], cat["description"], cat["image_url"])
            )
            cat_id = c.lastrowid
        else:
            cat_id = row[0]
            print(f"  = Category exists: {cat['name']} (ID: {cat_id})")
        cat_slug_to_id[cat["slug"]] = cat_id

    # 2. Get active artisan ID to assign products
    c.execute("SELECT id FROM artisan_profiles LIMIT 1")
    artisan_row = c.fetchone()
    artisan_id = artisan_row[0] if artisan_row else 1

    # 3. Insert new products if SKU not already in table
    now_str = utc_now().isoformat()
    inserted_count = 0
    for p in NEW_PRODUCTS:
        c.execute("SELECT id FROM products WHERE sku = ?", (p["sku"],))
        existing_p = c.fetchone()
        if not existing_p:
            cat_id = cat_slug_to_id[p["category_slug"]]
            c.execute("""
                INSERT INTO products (
                    sku, artisan_id, category_id, title, description,
                    price, discount_price, stock, subcategory, dimensions,
                    weight, materials, craftsmanship_details, customization_options,
                    min_order_quantity, estimated_prep_time, delivery_pickup_info,
                    is_published, is_draft, is_demo, is_featured, is_seasonal, is_active,
                    rating, review_count, created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?,
                    1, 0, 0, ?, ?, 1,
                    4.9, 0, ?, ?
                )
            """, (
                p["sku"], artisan_id, cat_id, p["title"], p["description"],
                p["price"], p["discount_price"], p["stock"], p["subcategory"], p["dimensions"],
                p["weight"], p["materials"], p["craftsmanship_details"], p["customization_options"],
                p["min_order_quantity"], p["estimated_prep_time"], p["delivery_pickup_info"],
                1 if p["is_featured"] else 0, 1 if p["is_seasonal"] else 0,
                now_str, now_str
            ))
            product_id = c.lastrowid
            # Also insert primary image
            c.execute("""
                INSERT INTO product_images (product_id, image_url, is_primary)
                VALUES (?, ?, 1)
            """, (product_id, p["image_url"]))
            inserted_count += 1
            print(f"  + Added product: [{p['sku']}] {p['title']}")
        else:
            print(f"  = Product SKU exists: {p['sku']}")

    conn.commit()
    conn.close()
    print(f"[*] Successfully added {inserted_count} new catalogue products.")

if __name__ == "__main__":
    seed_expansion()
