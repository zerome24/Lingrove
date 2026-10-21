"""
Lingrove SQLite to PostgreSQL Migration Utility (Production Safe)
Migrates all tables, schemas, and existing records from SQLite (lingrove.db)
to a production PostgreSQL database (e.g. Supabase, Neon, Render Postgres)
safely without dropping or losing records, and synchronizes PostgreSQL sequences.

Usage:
    python backend/app/migrate_to_postgres.py postgresql://user:password@host:5432/lingrove
    or:
    python backend/app/migrate_to_postgres.py "postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
"""

import sys
import os
from pathlib import Path
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

# Add repo root and backend directory to path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(BACKEND_DIR))

from backend.app.database import Base
from backend.app import models

# All model classes in strict foreign-key dependency order
MODEL_CLASSES = [
    models.User,
    models.ArtisanProfile,
    models.Category,
    models.Product,
    models.ProductImage,
    models.SystemSetting,
    models.Order,
    models.OrderItem,
    models.CartItem,
    models.WishlistItem,
    models.LearningModule,
    models.LearningProgress,
    models.MachineDirectory,
    models.Review,
    models.UserBadge,
    models.BulkInquiry,
]

def migrate(target_url: str, source_sqlite_path: str = None):
    if not source_sqlite_path:
        source_sqlite_path = str(BACKEND_DIR / "lingrove.db")

    print(f"[*] Checking source SQLite database: {source_sqlite_path}")
    if not os.path.exists(source_sqlite_path):
        print(f"[!] Error: Source SQLite file '{source_sqlite_path}' does not exist.")
        sys.exit(1)

    # Normalize target URL for PostgreSQL
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    masked_target = target_url.split("@")[-1] if "@" in target_url else target_url
    print(f"[*] Connecting to target PostgreSQL host: {masked_target}")

    source_engine = create_engine(f"sqlite:///{source_sqlite_path}", connect_args={"check_same_thread": False})
    SourceSession = sessionmaker(bind=source_engine)
    source_db = SourceSession()

    try:
        target_engine = create_engine(target_url, pool_pre_ping=True)
        TargetSession = sessionmaker(bind=target_engine)
        target_db = TargetSession()
        # Verify connection
        with target_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[+] Successfully connected to target PostgreSQL database.")
    except Exception as e:
        print(f"[!] Failed to connect to target PostgreSQL database: {e}")
        sys.exit(1)

    print("[*] Creating all schema tables on target PostgreSQL database if not present...")
    Base.metadata.create_all(bind=target_engine)

    total_migrated = 0

    for model in MODEL_CLASSES:
        table_name = model.__tablename__
        try:
            count = source_db.query(model).count()
        except Exception as e:
            print(f"  [-] Table '{table_name}' not present in source database ({e}), skipping.")
            continue

        print(f"[*] Migrating table '{table_name}' ({count} source records)...")
        records = source_db.query(model).all()
        table_migrated = 0

        for r in records:
            pk_col = inspect(model).primary_key[0].name
            pk_val = getattr(r, pk_col)
            existing = target_db.query(model).filter(getattr(model, pk_col) == pk_val).first()
            if not existing:
                data = {c.name: getattr(r, c.name) for c in model.__table__.columns}
                new_obj = model(**data)
                target_db.add(new_obj)
                table_migrated += 1

        target_db.commit()
        total_migrated += table_migrated
        print(f"  [+] '{table_name}': {table_migrated} new records inserted ({count} total in source).")

        # Synchronize PostgreSQL auto-increment sequence if primary key is integer
        try:
            pk_column = inspect(model).primary_key[0]
            if pk_column.type.python_type is int:
                seq_query = text(f"""
                    SELECT setval(
                        pg_get_serial_sequence('{table_name}', '{pk_column.name}'),
                        coalesce(max({pk_column.name}), 1)
                    ) FROM {table_name};
                """)
                with target_engine.begin() as conn:
                    conn.execute(seq_query)
        except Exception:
            # Table might have non-serial PK (like system_settings which has string PK)
            pass

    source_db.close()
    target_db.close()

    print("\n" + "=" * 60)
    print(f"MIGRATION COMPLETE: {total_migrated} total records migrated into PostgreSQL.")
    print("All sequences updated. Your persistent database is ready for production!")
    print("=" * 60)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python backend/app/migrate_to_postgres.py <TARGET_POSTGRES_DATABASE_URL>")
        print("Example:")
        print("  python backend/app/migrate_to_postgres.py \"postgresql://postgres:secret@db.xyz.supabase.co:5432/postgres\"")
        sys.exit(1)
    migrate(sys.argv[1])
