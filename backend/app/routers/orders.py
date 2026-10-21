import uuid
import secrets
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.models import Order, OrderItem, CartItem, Product, ArtisanProfile, User
from backend.app.schemas import OrderCreate, OrderOut, OrderStatusUpdate
from backend.app.auth import get_current_user, get_current_user_optional
from backend.app.pricing import calculate_pricing
from backend.app.inventory import (
    release_expired_reservations,
    cancel_and_restock_order,
    confirm_order_reservation
)

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("", response_model=OrderOut)
def create_order(
    order_in: OrderCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # 1. Clean up any expired reservations to restore available stock immediately
    release_expired_reservations(db)

    # 2. Determine item source: from authenticated user cart or explicit guest items
    items_to_process = []
    is_from_user_cart = False

    if current_user and not order_in.guest_items:
        cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
        if cart_items:
            is_from_user_cart = True
            for ci in cart_items:
                items_to_process.append({"product_id": ci.product_id, "quantity": ci.quantity})

    if not items_to_process and order_in.guest_items:
        for gi in order_in.guest_items:
            if gi.quantity > 0:
                items_to_process.append({"product_id": gi.product_id, "quantity": gi.quantity})

    if not items_to_process:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty. Please add items before placing an order."
        )

    # 3. Lock products and verify stock concurrency-safely
    validated_items_for_pricing = []
    for item in items_to_process:
        product = db.query(Product).filter(
            Product.id == item["product_id"],
            Product.is_published == True,
            Product.is_draft == False
        ).with_for_update().first()

        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Product with ID {item['product_id']} is no longer available."
            )
        if product.stock < item["quantity"]:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.title}'. Only {product.stock} available."
            )
        validated_items_for_pricing.append({
            "product": product,
            "quantity": item["quantity"]
        })

    # 4. Centralized pricing calculation
    pricing = calculate_pricing(
        items_to_process=validated_items_for_pricing,
        delivery_type=order_in.delivery_type,
        db=db
    )

    # 5. Generate unique order number and secure access token
    order_number = f"LNG-WA-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    access_token = secrets.token_urlsafe(32)

    customer_name = (
        order_in.customer_name
        or order_in.shipping_name
        or (current_user.full_name if current_user else "Guest Customer")
    )
    customer_phone = (
        order_in.customer_phone
        or order_in.shipping_phone
        or (current_user.phone if current_user else None)
    )

    is_pickup = pricing["is_pickup"]
    shipping_name = order_in.shipping_name or customer_name
    shipping_phone = order_in.shipping_phone or customer_phone or ""
    shipping_address = order_in.shipping_address or (
        "CMRTC Lingala Bamboo Workshop Pickup" if is_pickup else "Pending Address Confirmation via WhatsApp"
    )
    shipping_city = order_in.shipping_city or ("Hyderabad" if is_pickup else "Telangana")
    shipping_state = order_in.shipping_state or "Telangana"
    shipping_pincode = order_in.shipping_pincode or ("501401" if is_pickup else "500001")

    # Temporary inventory reservation window: 24 hours
    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(hours=24)

    try:
        new_order = Order(
            order_number=order_number,
            access_token=access_token,
            user_id=current_user.id if current_user else None,
            customer_name=customer_name,
            customer_phone=customer_phone,
            total_amount=pricing["total"],
            shipping_fee=pricing["shipping_fee"],
            tax_amount=pricing["tax_amount"],
            status="awaiting_confirmation",  # Truthful status: awaiting seller WhatsApp confirmation
            reservation_status="active",       # Temporary 24h inventory reservation
            expires_at=expires_at,
            shipping_name=shipping_name,
            shipping_phone=shipping_phone,
            shipping_address=shipping_address,
            shipping_city=shipping_city,
            shipping_state=shipping_state,
            shipping_pincode=shipping_pincode,
            delivery_type=order_in.delivery_type,
            order_source="whatsapp",
            payment_method=order_in.payment_method or "whatsapp",
            payment_status="not_yet_confirmed",  # Truthful payment status: coordinated directly on WhatsApp
            notes=order_in.notes
        )
        db.add(new_order)
        db.flush()

        for oi in pricing["items"]:
            product = oi["product"]
            # Deduct stock for temporary reservation
            product.stock -= oi["quantity"]
            
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                artisan_id=oi["artisan_id"],
                quantity=oi["quantity"],
                unit_price=oi["unit_price"],
                total_price=oi["total_price"]
            )
            db.add(order_item)

            if oi["artisan_id"]:
                artisan = db.query(ArtisanProfile).filter(ArtisanProfile.id == oi["artisan_id"]).first()
                if artisan:
                    artisan.total_earnings = (artisan.total_earnings or 0.0) + oi["total_price"]

        # Clear authenticated user's cart if order was placed from user cart
        if is_from_user_cart and current_user:
            db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()

        db.commit()
        db.refresh(new_order)
        return new_order
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating order: {str(e)}"
        )

@router.get("/lookup/{order_number}", response_model=OrderOut)
def lookup_order_by_number(
    order_number: str,
    token: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    release_expired_reservations(db)
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order reference not found")

    # Privacy verification: Check access permission
    has_permission = False
    if current_user:
        if current_user.role == "admin" or order.user_id == current_user.id:
            has_permission = True
        else:
            profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
            if profile and any(item.artisan_id == profile.id for item in order.items):
                has_permission = True

    if not has_permission and token and order.access_token and order.access_token == token:
        has_permission = True

    if not has_permission and phone and order.customer_phone:
        clean_stored = order.customer_phone.replace(" ", "").replace("-", "")
        clean_query = phone.replace(" ", "").replace("-", "")
        if clean_query and (clean_stored.endswith(clean_query) or clean_query.endswith(clean_stored)):
            has_permission = True

    if not has_permission:
        # Sanitize customer PII to protect privacy on public unverified lookup
        def mask_phone(p: Optional[str]) -> str:
            if not p:
                return ""
            clean = p.replace(" ", "")
            return clean[:3] + "******" + clean[-2:] if len(clean) >= 6 else "******"

        sanitized_order = OrderOut(
            id=order.id,
            order_number=order.order_number,
            access_token=None,  # Do not leak token
            user_id=None,
            customer_name=(order.customer_name or "").split(" ")[0] if order.customer_name else "Customer",
            customer_phone=mask_phone(order.customer_phone),
            total_amount=order.total_amount,
            shipping_fee=order.shipping_fee,
            tax_amount=order.tax_amount,
            status=order.status,
            reservation_status=order.reservation_status,
            expires_at=order.expires_at,
            shipping_name="Protected Customer",
            shipping_phone=mask_phone(order.shipping_phone),
            shipping_address="Protected Address (Token Required)",
            shipping_city=order.shipping_city,
            shipping_state=order.shipping_state,
            shipping_pincode=order.shipping_pincode,
            delivery_type=order.delivery_type,
            order_source=order.order_source,
            payment_method=order.payment_method,
            payment_status=order.payment_status,
            notes=None,
            created_at=order.created_at,
            items=[
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "total_price": item.total_price,
                    "product": item.product
                }
                for item in order.items
            ]
        )
        return sanitized_order

    return order

@router.get("", response_model=List[OrderOut])
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    release_expired_reservations(db)
    if current_user.role == "admin":
        return db.query(Order).order_by(desc(Order.created_at)).all()
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(desc(Order.created_at)).all()

@router.get("/artisan-orders")
def list_artisan_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    release_expired_reservations(db)
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=403, detail="Artisan profile required")

    order_items = db.query(OrderItem).filter(OrderItem.artisan_id == profile.id).all()
    order_ids = list(set(oi.order_id for oi in order_items))
    orders = db.query(Order).filter(Order.id.in_(order_ids)).order_by(desc(Order.created_at)).all()
    return orders

@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    token: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    release_expired_reservations(db)
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Authorization check
    has_permission = False
    if current_user:
        if current_user.role == "admin" or order.user_id == current_user.id:
            has_permission = True
        else:
            profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
            if profile and any(item.artisan_id == profile.id for item in order.items):
                has_permission = True

    # Token-based access for guest customers with receipt link
    if not has_permission and token and order.access_token and order.access_token == token:
        has_permission = True

    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this order. Valid account login or order access token required."
        )

    return order

@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    target_status = status_in.status.lower()
    valid_statuses = [
        "awaiting_confirmation", "pending", "confirmed",
        "processing", "shipped", "delivered", "completed", "cancelled", "expired"
    ]
    if target_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    # Only admin or involved artisan can update order status
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    is_artisan = profile and any(item.artisan_id == profile.id for item in order.items)

    if current_user.role != "admin" and not is_artisan:
        raise HTTPException(status_code=403, detail="Permission denied to update order status")

    # Handle inventory lifecycle transitions
    if target_status in ["confirmed", "processing"]:
        confirm_order_reservation(db, order, target_status)
    elif target_status in ["cancelled", "expired"]:
        cancel_and_restock_order(db, order)
    else:
        order.status = target_status
        db.commit()

    db.refresh(order)
    return order
