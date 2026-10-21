import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

def init_engine():
    db_url = settings.DATABASE_URL
    if "sqlite" in db_url:
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False}
        )
    elif "mysql" in db_url:
        try:
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=300,
                connect_args={"connect_timeout": 5}
            )
            with engine.connect() as conn:
                logger.info("Successfully connected to primary database (MySQL)")
            return engine
        except Exception as e:
            logger.warning(
                f"Could not connect to configured MySQL database ({db_url}): {e}. "
                f"Falling back to local SQLite engine: {settings.FALLBACK_SQLITE_URL}"
            )
            return create_engine(
                settings.FALLBACK_SQLITE_URL,
                connect_args={"check_same_thread": False}
            )
    else:
        # PostgreSQL (Supabase / Neon / Render / AWS RDS) or other SQL engines
        try:
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=300
            )
            return engine
        except Exception as e:
            logger.warning(
                f"Could not initialize database ({db_url}): {e}. "
                f"Falling back to local SQLite engine: {settings.FALLBACK_SQLITE_URL}"
            )
            return create_engine(
                settings.FALLBACK_SQLITE_URL,
                connect_args={"check_same_thread": False}
            )

engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
