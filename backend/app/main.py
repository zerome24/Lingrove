import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Request

from backend.app.config import settings, UPLOAD_DIR
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database
from backend.app.inventory import release_expired_reservations

from backend.app.routers import (
    auth, artisans, categories, products,
    cart, orders, learning, machines,
    reviews, calculator, assistant, bulk, config
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables and seed default data (skipped during testing for isolation)
    env = os.getenv("ENVIRONMENT", settings.ENVIRONMENT).lower()
    if env != "testing":
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            # Clean up any expired reservations on startup
            release_expired_reservations(db)
        except Exception as e:
            print(f"Startup reservation notice: {e}")
        finally:
            db.close()

        # Only seed demo accounts in development/local environments
        if env not in ["production", "prod"]:
            try:
                seed_database()
            except Exception as e:
                print(f"Database initialization notice: {e}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description=f"{settings.APP_SUBTITLE} — Learn. Create. Sell. Grow Together.",
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include API Routers
app.include_router(auth.router)
app.include_router(artisans.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(learning.router)
app.include_router(machines.router)
app.include_router(reviews.router)
app.include_router(calculator.router)
app.include_router(assistant.router)
app.include_router(bulk.router)
app.include_router(config.router)

@app.get("/api")
@app.get("/")
def api_root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "subtitle": settings.APP_SUBTITLE,
        "docs": "/api/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": "LINGROVE",
        "subtitle": settings.APP_SUBTITLE,
        "tagline": "Learn. Create. Sell. Grow Together.",
        "database": engine.url.drivername,
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
