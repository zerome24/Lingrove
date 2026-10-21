from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import CartItem, Product, User
from backend.app.schemas import CartItemCreate, CartItemUpdate, CartSummaryOut, CartItemOut, CartMergeRequest
from backend.app.auth import get_current_user

from backend.app.pricing import calculate_pricing

router = APIRouter(prefix="/api/cart", tags=["Cart"])

@router.get("", response_model=CartSummaryOut)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    valid_items = []
    items_for_pricing = []
    
    for item in items:
        # Check if product still exists and is published
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.is_published == True,
            Product.is_draft == False
        ).first()
        if product:
            valid_items.append(item)
            items_for_pricing.append({"product": product, "quantity": item.quantity})
        else:
            # Clean up stale cart item
            db.delete(item)
            db.commit()

    pricing = calculate_pricing(items_for_pricing, delivery_type="delivery", db=db)

    return {
        "items": valid_items,
        "subtotal": pricing["subtotal"],
        "shipping_fee": pricing["shipping_fee"],
        "tax_amount": pricing["tax_amount"],
        "total": pricing["total"]
    }

@router.post("/items", response_model=CartItemOut)
def add_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product or not product.is_published:
        raise HTTPException(status_code=404, detail="Product not found or unavailable")

    if product.stock < item_in.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} items currently in stock"
        )

    # Check if already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item_in.product_id
    ).first()

    if existing_item:
        new_quantity = existing_item.quantity + item_in.quantity
        if product.stock < new_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot add more than {product.stock} items in stock"
            )
        existing_item.quantity = new_quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        new_item = CartItem(
            user_id=current_user.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item

@router.put("/items/{item_id}", response_model=CartItemOut)
def update_cart_item(
    item_id: int,
    item_in: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        db.delete(item)
        db.commit()
        raise HTTPException(status_code=404, detail="Product no longer available")

    if item_in.quantity > product.stock:
        raise HTTPException(
            status_code=400,
            detail=f"Requested quantity exceeds available stock of {product.stock}"
        )

    item.quantity = item_in.quantity
    db.commit()
    db.refresh(item)
    return item

@router.delete("/items/{item_id}")
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart"}

@router.delete("/clear")
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}

@router.post("/merge", response_model=CartSummaryOut)
def merge_guest_cart(
    merge_req: CartMergeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deterministically merges guest cart items into the authenticated customer's cart.
    Revalidates stock, ensures no duplicates, and bounds quantities to available inventory.
    """
    for guest_item in merge_req.items:
        if guest_item.quantity <= 0:
            continue

        product = db.query(Product).filter(
            Product.id == guest_item.product_id,
            Product.is_published == True,
            Product.is_draft == False
        ).first()

        if not product or product.stock <= 0:
            continue

        existing_item = db.query(CartItem).filter(
            CartItem.user_id == current_user.id,
            CartItem.product_id == guest_item.product_id
        ).first()

        if existing_item:
            # Merge quantity up to available product stock
            new_qty = min(existing_item.quantity + guest_item.quantity, product.stock)
            existing_item.quantity = new_qty
        else:
            add_qty = min(guest_item.quantity, product.stock)
            new_item = CartItem(
                user_id=current_user.id,
                product_id=guest_item.product_id,
                quantity=add_qty
            )
            db.add(new_item)

    db.commit()

    # Return refreshed cart summary
    return get_cart(current_user=current_user, db=db)

