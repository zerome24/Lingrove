from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, ArtisanProfile
from backend.app.schemas import UserCreate, UserLogin, UserOut, UserUpdate, TokenResponse
from backend.app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    new_user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role="artisan" if user_in.role == "artisan" else "customer",
        preferred_language=user_in.preferred_language,
        avatar_url=f"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If registered as artisan, initialize artisan profile
    if new_user.role == "artisan":
        artisan_profile = ArtisanProfile(
            user_id=new_user.id,
            artisan_name=new_user.full_name,
            village="Lingala Village",
            region="Telangana",
            bio=f"{new_user.full_name} is a dedicated artisan crafting sustainable bamboo products at CMRTC.",
            craft_specialization="Traditional Bamboo Weaving & Home Decor",
            experience_years=4,
            phone=new_user.phone
        )
        db.add(artisan_profile)
        db.commit()

    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_profile(update_in: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name
    if update_in.phone is not None:
        current_user.phone = update_in.phone
    if update_in.preferred_language is not None:
        current_user.preferred_language = update_in.preferred_language
    if update_in.avatar_url is not None:
        current_user.avatar_url = update_in.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user
