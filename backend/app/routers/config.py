import re
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from backend.app.config import settings
from backend.app.schemas import BusinessConfigOut
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, SystemSetting
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/config", tags=["Configuration"])

def normalize_whatsapp_number(raw_num: str) -> str:
    """
    Normalizes a given telephone number to international WhatsApp format for India.
    Strips non-digit characters, prepends '91' if 10 digits are supplied.
    """
    digits = re.sub(r"\D", "", raw_num or "")
    if len(digits) == 10:
        return f"91{digits}"
    elif len(digits) == 12 and digits.startswith("91"):
        return digits
    elif len(digits) == 11 and digits.startswith("0"):
        return f"91{digits[1:]}"
    elif digits:
        return digits
    return "919059076675"

def format_display_phone(norm_num: str) -> str:
    if len(norm_num) == 12 and norm_num.startswith("91"):
        return f"+91 {norm_num[2:7]} {norm_num[7:]}"
    return f"+{norm_num}"

class WhatsAppUpdateRequest(BaseModel):
    whatsapp_number: str = Field(..., min_length=10, max_length=20)

@router.get("/business", response_model=BusinessConfigOut)
def get_business_config(db: Session = Depends(get_db)):
    """
    Public configuration endpoint providing official business contact details and WhatsApp destination.
    Persistently fetches the active business WhatsApp number from database settings or deployment env.
    """
    active_num = settings.WHATSAPP_NUMBER
    try:
        db_setting = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_number").first()
        if db_setting and db_setting.value:
            active_num = db_setting.value
    except Exception:
        pass

    norm_num = normalize_whatsapp_number(active_num)
    return {
        "whatsapp_number": norm_num,
        "whatsapp_formatted": format_display_phone(norm_num),
        "business_name": "Lingrove",
        "subtitle": "Lingala Bamboo Products at CMRTC",
        "tagline": "Learn. Create. Sell. Grow Together.",
        "pickup_address": "Lingala Village Artisan Workshop & CMRTC Bamboo Design Centre, Kandlakoya, Hyderabad, Telangana 501401",
        "support_phone": format_display_phone(norm_num),
        "support_email": "contact@lingrove.org"
    }

@router.put("/whatsapp", response_model=BusinessConfigOut)
def update_whatsapp_number(
    req: WhatsAppUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin-only configuration update for official business WhatsApp destination.
    Stores the setting persistently in the database across restarts and redeployments.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators may change the business WhatsApp destination."
        )

    norm_num = normalize_whatsapp_number(req.whatsapp_number)
    if len(norm_num) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format."
        )

    # Persist in database
    db_setting = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_number").first()
    if db_setting:
        db_setting.value = norm_num
    else:
        db_setting = SystemSetting(
            key="whatsapp_number",
            value=norm_num,
            description="Central business WhatsApp contact number"
        )
        db.add(db_setting)
    db.commit()

    # Update in-memory settings
    settings.WHATSAPP_NUMBER = norm_num

    return get_business_config(db=db)
