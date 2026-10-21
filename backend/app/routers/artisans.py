from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models import ArtisanProfile, User, Product, OrderItem, Order
from backend.app.schemas import ArtisanProfileOut, ArtisanProfileUpdate
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/artisans", tags=["Artisans"])

@router.get("", response_model=List[ArtisanProfileOut])
def list_artisans(db: Session = Depends(get_db)):
    return db.query(ArtisanProfile).all()

@router.get("/me", response_model=ArtisanProfileOut)
def get_my_artisan_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artisan profile not found for current user"
        )
    return profile

@router.put("/me", response_model=ArtisanProfileOut)
def update_my_artisan_profile(
    profile_in: ArtisanProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        # Create if not existing
        profile = ArtisanProfile(
            user_id=current_user.id,
            artisan_name=current_user.full_name,
            village="Lingala",
            region="Telangana"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    if profile_in.artisan_name is not None:
        profile.artisan_name = profile_in.artisan_name
    if profile_in.village is not None:
        profile.village = profile_in.village
    if profile_in.region is not None:
        profile.region = profile_in.region
    if profile_in.bio is not None:
        profile.bio = profile_in.bio
    if profile_in.craft_specialization is not None:
        profile.craft_specialization = profile_in.craft_specialization
    if profile_in.experience_years is not None:
        profile.experience_years = profile_in.experience_years
    if profile_in.phone is not None:
        profile.phone = profile_in.phone
    if profile_in.avatar_url is not None:
        profile.avatar_url = profile_in.avatar_url

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/stats")
def get_artisan_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Artisan profile not found")

    products = db.query(Product).filter(Product.artisan_id == profile.id).all()
    total_products = len(products)
    published_products = sum(1 for p in products if p.is_published and not p.is_draft)
    total_stock = sum(p.stock for p in products)

    # Calculate earnings from fulfilled/placed orders
    order_items = db.query(OrderItem).filter(OrderItem.artisan_id == profile.id).all()
    total_orders = len(set(oi.order_id for oi in order_items))
    total_earnings = sum(oi.total_price for oi in order_items)
    
    # Update recorded profile earnings if greater
    if total_earnings > profile.total_earnings:
        profile.total_earnings = total_earnings
        db.commit()

    return {
        "artisan_name": profile.artisan_name,
        "village": profile.village,
        "region": profile.region,
        "craft_specialization": profile.craft_specialization,
        "total_products": total_products,
        "published_products": published_products,
        "total_stock": total_stock,
        "total_orders": total_orders,
        "total_earnings": profile.total_earnings or total_earnings,
        "is_verified": profile.is_verified
    }

@router.get("/{artisan_id}", response_model=ArtisanProfileOut)
def get_artisan_by_id(artisan_id: int, db: Session = Depends(get_db)):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.id == artisan_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Artisan not found")
    return profile
