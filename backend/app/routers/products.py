import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from backend.app.database import get_db
from backend.app.config import UPLOAD_DIR
from backend.app.models import Product, ProductImage, ArtisanProfile, User, Category
from backend.app.schemas import ProductOut, ProductCreate, ProductUpdate
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[ProductOut])
def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    category_slug: Optional[str] = None,
    subcategory: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "newest",  # newest, price_asc, price_desc, rating
    artisan_id: Optional[int] = None,
    is_featured: Optional[bool] = None,
    is_seasonal: Optional[bool] = None,
    include_drafts: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if not include_drafts:
        query = query.filter(Product.is_published == True, Product.is_draft == False)
    
    if artisan_id:
        query = query.filter(Product.artisan_id == artisan_id)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    elif category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)

    if subcategory:
        query = query.filter(Product.subcategory.ilike(f"%{subcategory}%"))

    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)

    if is_seasonal is not None:
        query = query.filter(Product.is_seasonal == is_seasonal)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Product.title.ilike(search_pattern),
                Product.description.ilike(search_pattern),
                Product.materials.ilike(search_pattern),
                Product.sku.ilike(search_pattern),
                Product.subcategory.ilike(search_pattern),
                Product.craftsmanship_details.ilike(search_pattern)
            )
        )

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if sort_by == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort_by == "rating":
        query = query.order_by(desc(Product.rating))
    else:
        query = query.order_by(desc(Product.created_at))

    return query.all()

@router.get("/my-products", response_model=List[ProductOut])
def list_my_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        return []
    return db.query(Product).filter(Product.artisan_id == profile.id).order_by(desc(Product.created_at)).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductOut)
def create_product(
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        # Create an artisan profile automatically if user doesn't have one
        profile = ArtisanProfile(
            user_id=current_user.id,
            artisan_name=current_user.full_name,
            village="Lingala",
            region="Telangana"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    sku = product_in.sku or f"LNG-PRD-{uuid.uuid4().hex[:6].upper()}"
    new_product = Product(
        sku=sku,
        artisan_id=profile.id,
        category_id=product_in.category_id,
        title=product_in.title,
        description=product_in.description,
        price=product_in.price,
        discount_price=product_in.discount_price,
        stock=product_in.stock,
        subcategory=product_in.subcategory,
        dimensions=product_in.dimensions,
        weight=product_in.weight,
        materials=product_in.materials or "100% Natural Lingala Bamboo",
        craftsmanship_details=product_in.craftsmanship_details,
        customization_options=product_in.customization_options,
        min_order_quantity=product_in.min_order_quantity or 1,
        estimated_prep_time=product_in.estimated_prep_time or "Ready to ship",
        delivery_pickup_info=product_in.delivery_pickup_info or "Standard courier or CMRTC workshop pickup",
        is_published=product_in.is_published,
        is_draft=product_in.is_draft,
        is_featured=product_in.is_featured,
        is_seasonal=product_in.is_seasonal,
        is_active=product_in.is_active,
        is_demo=False
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # Attach images if provided
    if product_in.image_urls:
        for idx, url in enumerate(product_in.image_urls):
            img = ProductImage(
                product_id=new_product.id,
                image_url=url,
                is_primary=(idx == 0)
            )
            db.add(img)
        db.commit()
        db.refresh(new_product)

    return new_product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Authorization check
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if current_user.role != "admin" and (not profile or product.artisan_id != profile.id):
        raise HTTPException(status_code=403, detail="You do not have permission to edit this product")

    if product_in.title is not None:
        product.title = product_in.title
    if product_in.description is not None:
        product.description = product_in.description
    if product_in.price is not None:
        product.price = product_in.price
    if product_in.discount_price is not None:
        product.discount_price = product_in.discount_price
    if product_in.stock is not None:
        product.stock = product_in.stock
    if product_in.category_id is not None:
        product.category_id = product_in.category_id
    if product_in.sku is not None:
        product.sku = product_in.sku
    if product_in.subcategory is not None:
        product.subcategory = product_in.subcategory
    if product_in.dimensions is not None:
        product.dimensions = product_in.dimensions
    if product_in.weight is not None:
        product.weight = product_in.weight
    if product_in.materials is not None:
        product.materials = product_in.materials
    if product_in.craftsmanship_details is not None:
        product.craftsmanship_details = product_in.craftsmanship_details
    if product_in.customization_options is not None:
        product.customization_options = product_in.customization_options
    if product_in.min_order_quantity is not None:
        product.min_order_quantity = product_in.min_order_quantity
    if product_in.estimated_prep_time is not None:
        product.estimated_prep_time = product_in.estimated_prep_time
    if product_in.delivery_pickup_info is not None:
        product.delivery_pickup_info = product_in.delivery_pickup_info
    if product_in.is_published is not None:
        product.is_published = product_in.is_published
    if product_in.is_draft is not None:
        product.is_draft = product_in.is_draft
    if product_in.is_featured is not None:
        product.is_featured = product_in.is_featured
    if product_in.is_seasonal is not None:
        product.is_seasonal = product_in.is_seasonal
    if product_in.is_active is not None:
        product.is_active = product_in.is_active

    if product_in.image_urls is not None:
        # Replace images
        db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
        for idx, url in enumerate(product_in.image_urls):
            img = ProductImage(
                product_id=product.id,
                image_url=url,
                is_primary=(idx == 0)
            )
            db.add(img)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if current_user.role != "admin" and (not profile or product.artisan_id != profile.id):
        raise HTTPException(status_code=403, detail="You do not have permission to delete this product")

    db.delete(product)
    db.commit()
    return {"message": "Product successfully deleted"}

@router.post("/upload-image")
def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Allowed extensions
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Only image files (jpg, png, webp) are permitted")

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = UPLOAD_DIR / unique_filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"image_url": f"/uploads/{unique_filename}"}
