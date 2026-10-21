import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from backend.app.models import Order, OrderItem, Product

RESERVATION_DURATION_HOURS = 24

def release_expired_reservations(db: Session) -> int:
    """
    Finds unconfirmed orders whose 24-hour reservation window has lapsed.
    Restores the reserved stock to the products, sets order status to 'expired',
    and sets reservation_status to 'expired'.
    Returns the count of expired orders processed.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    expired_orders = db.query(Order).filter(
        Order.status == "awaiting_confirmation",
        Order.reservation_status == "active",
        Order.expires_at.isnot(None),
        Order.expires_at < now
    ).all()

    released_count = 0
    for order in expired_orders:
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock += item.quantity
        order.status = "expired"
        order.reservation_status = "expired"
        released_count += 1

    if released_count > 0:
        db.commit()
    return released_count

def reserve_inventory_for_order(
    db: Session,
    order: Order,
    items_with_quantities: list[dict],
    reservation_hours: int = RESERVATION_DURATION_HOURS
) -> None:
    """
    Atomically verifies sufficient stock and reserves it for the order.
    Sets expiration timestamp on the order.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    order.expires_at = now + datetime.timedelta(hours=reservation_hours)
    order.reservation_status = "active"

    for item in items_with_quantities:
        product_id = item["product_id"]
        qty = item["quantity"]
        product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
        if not product or product.stock < qty:
            raise ValueError(f"Insufficient stock for product '{product.title if product else product_id}'. Available: {product.stock if product else 0}")
        product.stock -= qty

def cancel_and_restock_order(db: Session, order: Order) -> bool:
    """
    Restocks inventory when an order is cancelled or abandoned.
    Idempotent: will not restock if already released or expired.
    """
    if order.reservation_status in ["active", "confirmed"]:
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock += item.quantity
        order.reservation_status = "released"
        order.status = "cancelled"
        db.commit()
        return True
    return False

def confirm_order_reservation(db: Session, order: Order, new_status: str = "confirmed") -> None:
    """
    When seller/artisan confirms the order, convert the temporary reservation
    into permanent deduction, remove expiration, and set target status.
    """
    order.reservation_status = "confirmed"
    order.expires_at = None
    order.status = new_status
    db.commit()
