from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.models import BulkInquiry, User
from backend.app.schemas import BulkInquiryCreate, BulkInquiryOut
from backend.app.auth import require_role

router = APIRouter(prefix="/api/bulk-inquiries", tags=["Bulk Inquiries"])

@router.post("", response_model=BulkInquiryOut)
def submit_bulk_inquiry(inquiry_in: BulkInquiryCreate, db: Session = Depends(get_db)):
    inquiry = BulkInquiry(
        organization_name=inquiry_in.organization_name,
        contact_person=inquiry_in.contact_person,
        email=inquiry_in.email,
        phone=inquiry_in.phone,
        product_type=inquiry_in.product_type,
        estimated_quantity=inquiry_in.estimated_quantity,
        notes=inquiry_in.notes
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry

@router.get("", response_model=List[BulkInquiryOut])
def list_bulk_inquiries(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(BulkInquiry).order_by(desc(BulkInquiry.created_at)).all()
