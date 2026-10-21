import sqlite3
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "lingrove.db"

def run_migration(db_path: Path = DB_PATH):
    print(f"[*] Starting migration on {db_path}...")
    if not db_path.exists():
        print(f"[!] Database file {db_path} does not exist. Migration will create schema.")
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Inspect products table
    c.execute("PRAGMA table_info(products)")
    existing_cols = {col[1]: col for col in c.fetchall()}

    product_new_cols = [
        ("sku", "VARCHAR(50)"),
        ("subcategory", "VARCHAR(100)"),
        ("discount_price", "FLOAT"),
        ("craftsmanship_details", "TEXT"),
        ("weight", "VARCHAR(50)"),
        ("customization_options", "TEXT"),
        ("min_order_quantity", "INTEGER DEFAULT 1"),
        ("estimated_prep_time", "VARCHAR(100) DEFAULT 'Ready to ship'"),
        ("delivery_pickup_info", "VARCHAR(255) DEFAULT 'Standard courier or CMRTC workshop pickup'"),
        ("is_featured", "BOOLEAN DEFAULT 0"),
        ("is_seasonal", "BOOLEAN DEFAULT 0"),
        ("is_active", "BOOLEAN DEFAULT 1"),
    ]

    for col_name, col_type in product_new_cols:
        if col_name not in existing_cols:
            print(f"  + Adding column '{col_name}' to products table...")
            c.execute(f"ALTER TABLE products ADD COLUMN {col_name} {col_type}")
        else:
            print(f"  = Column '{col_name}' already exists in products table.")

    # Assign SKUs to existing products without one
    c.execute("SELECT id, title FROM products WHERE sku IS NULL OR sku = ''")
    products_without_sku = c.fetchall()
    for pid, title in products_without_sku:
        sku = f"LNG-PRD-{pid:04d}"
        c.execute("UPDATE products SET sku = ? WHERE id = ?", (sku, pid))
    if products_without_sku:
        print(f"  + Assigned default SKUs to {len(products_without_sku)} existing products.")

    # 2. Inspect orders table
    c.execute("PRAGMA table_info(orders)")
    existing_order_cols = {col[1]: col for col in c.fetchall()}

    order_new_cols = [
        ("customer_name", "VARCHAR(255)"),
        ("customer_phone", "VARCHAR(50)"),
        ("delivery_type", "VARCHAR(50) DEFAULT 'delivery'"),
        ("order_source", "VARCHAR(50) DEFAULT 'web'"),
        ("access_token", "VARCHAR(64)"),
        ("reservation_status", "VARCHAR(50) DEFAULT 'active'"),
        ("expires_at", "DATETIME"),
    ]

    for col_name, col_type in order_new_cols:
        if col_name not in existing_order_cols:
            print(f"  + Adding column '{col_name}' to orders table...")
            c.execute(f"ALTER TABLE orders ADD COLUMN {col_name} {col_type}")
        else:
            print(f"  = Column '{col_name}' already exists in orders table.")

    # Assign access tokens to existing orders without one
    import secrets
    c.execute("SELECT id FROM orders WHERE access_token IS NULL OR access_token = ''")
    orders_without_token = c.fetchall()
    for (oid,) in orders_without_token:
        tok = secrets.token_urlsafe(32)
        c.execute("UPDATE orders SET access_token = ? WHERE id = ?", (tok, oid))
    if orders_without_token:
        print(f"  + Generated secure access tokens for {len(orders_without_token)} existing orders.")

    # 3. Create and populate system_settings table
    c.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            key VARCHAR(100) PRIMARY KEY,
            value TEXT NOT NULL,
            description VARCHAR(255),
            updated_at DATETIME
        )
    """)
    print("  = Verified system_settings table.")

    default_settings = [
        ("whatsapp_number", "919059076675", "Central business WhatsApp contact number"),
        ("shipping_fee", "99.0", "Default standard shipping fee in INR"),
        ("free_shipping_threshold", "999.0", "Free shipping threshold subtotal in INR"),
        ("tax_rate", "0.05", "GST tax rate for bamboo handicraft products (5%)"),
    ]
    for key, val, desc in default_settings:
        c.execute("SELECT key FROM system_settings WHERE key = ?", (key,))
        if not c.fetchone():
            c.execute(
                "INSERT INTO system_settings (key, value, description, updated_at) VALUES (?, ?, ?, datetime('now'))",
                (key, val, desc)
            )
            print(f"  + Seeded default setting '{key}' = '{val}'")

    # 4. Performance Indexes
    c.execute("CREATE INDEX IF NOT EXISTS ix_orders_access_token ON orders (access_token)")
    c.execute("CREATE INDEX IF NOT EXISTS ix_products_category_id ON products (category_id)")
    c.execute("CREATE INDEX IF NOT EXISTS ix_products_is_published ON products (is_published)")

    conn.commit()
    conn.close()
    print("[*] Migration completed successfully.")

if __name__ == "__main__":
    run_migration()
