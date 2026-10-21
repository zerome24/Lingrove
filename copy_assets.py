import os
import glob
import shutil

artifact_dir = r"C:\Users\MANEESH\.gemini\antigravity-ide\brain\7b45364e-9543-45a1-9fb1-a98e422e466b"
dest_dir = r"frontend\public\products"
os.makedirs(dest_dir, exist_ok=True)

mappings = {
    "bamboo_festival_sticks": "bamboo-festival-sticks.jpg",
    "bamboo_incense_sticks": "bamboo-incense-sticks.jpg",
    "bamboo_precision_sticks": "bamboo-precision-sticks.jpg",
    "bamboo_trellis_laths": "bamboo-trellis-laths.jpg"
}

for prefix, dest_name in mappings.items():
    matches = glob.glob(os.path.join(artifact_dir, f"{prefix}_*.jpg"))
    if matches:
        src = matches[-1]
        dest = os.path.join(dest_dir, dest_name)
        shutil.copy2(src, dest)
        print(f"Copied: {dest_name} ({os.path.getsize(dest)} bytes)")
    else:
        print(f"Missing: {prefix}")

# Also update sqlite database
import sqlite3
db_path = r"backend\lingrove.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    product_image_updates = [
        ("Festival Decoration Bamboo Sticks (Bundle of 100)", "/products/bamboo-festival-sticks.jpg"),
        ("Raw Bamboo Incense & Diffuser Sticks (Bundle of 500)", "/products/bamboo-incense-sticks.jpg"),
        ("Precision Thin Bamboo Craft Sticks (Bundle of 200)", "/products/bamboo-precision-sticks.jpg"),
        ("Flat Bamboo Garden Trellis Laths (Pack of 50)", "/products/bamboo-trellis-laths.jpg"),
    ]
    for title, img_url in product_image_updates:
        cur.execute("SELECT id FROM products WHERE title = ?", (title,))
        row = cur.fetchone()
        if row:
            p_id = row[0]
            cur.execute("UPDATE product_images SET image_url = ? WHERE product_id = ? AND is_primary = 1", (img_url, p_id))
            print(f"Updated DB product '{title}' (ID {p_id}) -> {img_url}")
    conn.commit()
    conn.close()

