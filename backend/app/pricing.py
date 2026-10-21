from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models import Product, SystemSetting

DEFAULT_SHIPPING_FEE = 99.0
DEFAULT_FREE_SHIPPING_THRESHOLD = 999.0
DEFAULT_TAX_RATE = 0.05  # 5% GST for bamboo handicrafts

def get_system_setting(db: Optional[Session], key: str, default_value: Any) -> Any:
    if not db:
        return default_value
    try:
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting and setting.value is not None:
            return setting.value
    except Exception:
        pass
    return default_value

def calculate_pricing(
    items_to_process: List[Dict[str, Any]],
    delivery_type: str = "delivery",
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Centralized pricing calculator for carts and orders.
    Guarantees that frontend display, cart totals, and backend checkout calculations
    match to the exact paise.
    """
    subtotal = 0.0
    processed_items = []

    for item in items_to_process:
        product: Product = item["product"]
        quantity: int = int(item["quantity"])
        
        unit_price = product.discount_price if (product.discount_price and product.discount_price > 0) else product.price
        unit_price = round(float(unit_price), 2)
        total_price = round(unit_price * quantity, 2)
        subtotal += total_price

        processed_items.append({
            "product": product,
            "product_id": product.id,
            "artisan_id": product.artisan_id,
            "quantity": quantity,
            "unit_price": unit_price,
            "total_price": total_price
        })

    subtotal = round(subtotal, 2)

    try:
        free_threshold = float(get_system_setting(db, "free_shipping_threshold", DEFAULT_FREE_SHIPPING_THRESHOLD))
    except (ValueError, TypeError):
        free_threshold = DEFAULT_FREE_SHIPPING_THRESHOLD

    try:
        standard_shipping = float(get_system_setting(db, "shipping_fee", DEFAULT_SHIPPING_FEE))
    except (ValueError, TypeError):
        standard_shipping = DEFAULT_SHIPPING_FEE

    try:
        tax_rate = float(get_system_setting(db, "tax_rate", DEFAULT_TAX_RATE))
    except (ValueError, TypeError):
        tax_rate = DEFAULT_TAX_RATE

    is_pickup = (delivery_type.lower() == "pickup")
    
    if is_pickup or subtotal == 0 or subtotal >= free_threshold:
        shipping_fee = 0.0
    else:
        shipping_fee = standard_shipping

    shipping_fee = round(shipping_fee, 2)
    tax_amount = round(subtotal * tax_rate, 2)
    total_amount = round(subtotal + shipping_fee + tax_amount, 2)

    return {
        "items": processed_items,
        "subtotal": subtotal,
        "shipping_fee": shipping_fee,
        "tax_amount": tax_amount,
        "total": total_amount,
        "is_pickup": is_pickup,
        "free_shipping_threshold": free_threshold
    }
