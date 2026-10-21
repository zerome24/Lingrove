from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.app.database import get_db
from backend.app.models import Review, Order, OrderItem, Product, User
from backend.app.schemas import ReviewCreate, ReviewOut
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.get("", response_model=List[ReviewOut])
def list_reviews(
    product_id: Optional[int] = None,
    module_id: Optional[int] = None,
    review_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Review).filter(Review.is_moderated == True)

    if product_id:
        query = query.filter(Review.product_id == product_id)
    if module_id:
        query = query.filter(Review.module_id == module_id)
    if review_type:
        query = query.filter(Review.review_type == review_type)

    reviews = query.order_by(desc(Review.created_at)).all()
    results = []
    for r in reviews:
        user_name = r.user.full_name if r.user else "Community Member"
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "product_id": r.product_id,
            "module_id": r.module_id,
            "review_type": r.review_type,
            "rating": r.rating,
            "comment": r.comment,
            "is_verified_purchase": r.is_verified_purchase,
            "is_moderated": r.is_moderated,
            "created_at": r.created_at,
            "user_name": user_name
        })
    return results

@router.get("/summary")
def get_reviews_summary(db: Session = Depends(get_db)):
    total_reviews = db.query(Review).filter(Review.is_moderated == True).count()
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.is_moderated == True).scalar() or 4.9

    rating_counts = {}
    for star in range(1, 6):
        cnt = db.query(Review).filter(Review.is_moderated == True, Review.rating == star).count()
        rating_counts[star] = cnt

    return {
        "total_reviews": total_reviews,
        "average_rating": round(float(avg_rating), 1),
        "rating_breakdown": rating_counts
    }

@router.post("", response_model=ReviewOut)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    is_verified = False

    # If it's a product review, check if user has placed an order containing this product
    if review_in.product_id:
        verified_order = db.query(Order).join(OrderItem).filter(
            Order.user_id == current_user.id,
            OrderItem.product_id == review_in.product_id,
            Order.status.in_(["confirmed", "processing", "shipped", "delivered"])
        ).first()
        if verified_order:
            is_verified = True

    new_review = Review(
        user_id=current_user.id,
        product_id=review_in.product_id,
        module_id=review_in.module_id,
        review_type=review_in.review_type,
        rating=review_in.rating,
        comment=review_in.comment,
        is_verified_purchase=is_verified,
        is_moderated=True  # Default visible, moderated
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # Recalculate product rating if it's a product review
    if review_in.product_id:
        product = db.query(Product).filter(Product.id == review_in.product_id).first()
        if product:
            avg_p_rating = db.query(func.avg(Review.rating)).filter(
                Review.product_id == product.id,
                Review.is_moderated == True
            ).scalar() or review_in.rating
            p_count = db.query(Review).filter(
                Review.product_id == product.id,
                Review.is_moderated == True
            ).count()
            product.rating = round(float(avg_p_rating), 1)
            product.review_count = p_count
            db.commit()

    return {
        "id": new_review.id,
        "user_id": new_review.user_id,
        "product_id": new_review.product_id,
        "module_id": new_review.module_id,
        "review_type": new_review.review_type,
        "rating": new_review.rating,
        "comment": new_review.comment,
        "is_verified_purchase": new_review.is_verified_purchase,
        "is_moderated": new_review.is_moderated,
        "created_at": new_review.created_at,
        "user_name": current_user.full_name
    }
