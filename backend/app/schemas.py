from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "customer"
    preferred_language: str = "en"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Artisan Schemas ---
class ArtisanProfileBase(BaseModel):
    artisan_name: str
    village: str
    region: str = "Telangana"
    bio: Optional[str] = None
    craft_specialization: str = "Bamboo Baskets & Handicrafts"
    experience_years: int = 5
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class ArtisanProfileCreate(ArtisanProfileBase):
    pass

class ArtisanProfileUpdate(BaseModel):
    artisan_name: Optional[str] = None
    village: Optional[str] = None
    region: Optional[str] = None
    bio: Optional[str] = None
    craft_specialization: Optional[str] = None
    experience_years: Optional[int] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class ArtisanProfileOut(ArtisanProfileBase):
    id: int
    user_id: int
    total_earnings: float
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryOut(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- Product Schemas ---
class ProductImageOut(BaseModel):
    id: int
    image_url: str
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    title: str
    description: str
    price: float = Field(..., gt=0)
    discount_price: Optional[float] = None
    stock: int = Field(..., ge=0)
    category_id: int
    sku: Optional[str] = None
    subcategory: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    materials: Optional[str] = "100% Natural Lingala Bamboo"
    craftsmanship_details: Optional[str] = None
    customization_options: Optional[str] = None
    min_order_quantity: int = 1
    estimated_prep_time: Optional[str] = "Ready to ship"
    delivery_pickup_info: Optional[str] = "Standard courier or CMRTC workshop pickup"
    is_published: bool = True
    is_draft: bool = False
    is_demo: bool = False
    is_featured: bool = False
    is_seasonal: bool = False
    is_active: bool = True

class ProductCreate(ProductBase):
    image_urls: Optional[List[str]] = []

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    sku: Optional[str] = None
    subcategory: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    materials: Optional[str] = None
    craftsmanship_details: Optional[str] = None
    customization_options: Optional[str] = None
    min_order_quantity: Optional[int] = None
    estimated_prep_time: Optional[str] = None
    delivery_pickup_info: Optional[str] = None
    is_published: Optional[bool] = None
    is_draft: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_seasonal: Optional[bool] = None
    is_active: Optional[bool] = None
    image_urls: Optional[List[str]] = None

class ProductOut(ProductBase):
    id: int
    artisan_id: int
    rating: float
    review_count: int
    created_at: datetime
    images: List[ProductImageOut] = []
    artisan: Optional[ArtisanProfileOut] = None
    category: Optional[CategoryOut] = None

    model_config = ConfigDict(from_attributes=True)

# --- Cart Schemas ---
class CartItemInput(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartMergeRequest(BaseModel):
    items: List[CartItemInput]

class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductOut

    model_config = ConfigDict(from_attributes=True)

class CartSummaryOut(BaseModel):
    items: List[CartItemOut]
    subtotal: float
    shipping_fee: float
    tax_amount: float = 0.0
    total: float

# --- Wishlist Schemas ---
class WishlistItemOut(BaseModel):
    id: int
    product_id: int
    product: ProductOut

    model_config = ConfigDict(from_attributes=True)

# --- Order Schemas ---
class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total_price: float
    product: Optional[ProductOut] = None

    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    shipping_name: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_pincode: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_type: str = "delivery"  # "delivery" or "pickup"
    payment_method: str = "whatsapp"  # "whatsapp", "cod"
    notes: Optional[str] = None
    guest_items: Optional[List[CartItemInput]] = None

class OrderStatusUpdate(BaseModel):
    status: str

class OrderOut(BaseModel):
    id: int
    order_number: str
    access_token: Optional[str] = None
    user_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    total_amount: float
    shipping_fee: float
    tax_amount: float
    status: str
    reservation_status: Optional[str] = "active"
    expires_at: Optional[datetime] = None
    shipping_name: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_pincode: Optional[str] = None
    delivery_type: Optional[str] = "delivery"
    order_source: Optional[str] = "whatsapp"
    payment_method: str
    payment_status: str
    notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = []

    model_config = ConfigDict(from_attributes=True)

# --- Business & Contact Config Schemas ---
class BusinessConfigOut(BaseModel):
    whatsapp_number: str
    whatsapp_formatted: str
    business_name: str
    subtitle: str
    tagline: str
    pickup_address: str
    support_phone: str
    support_email: str

# --- Learning Schemas ---
class LearningModuleBase(BaseModel):
    title: str
    category: str
    difficulty: str = "beginner"
    estimated_duration: str = "25 mins"
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    is_demo: bool = False
    summary: str
    learning_objectives: str
    steps_content: str
    safety_precautions: str
    downloadable_guide_url: Optional[str] = None

class LearningModuleOut(LearningModuleBase):
    id: int
    created_at: datetime
    user_progress: Optional["LearningProgressOut"] = None

    model_config = ConfigDict(from_attributes=True)

class LearningProgressUpdate(BaseModel):
    is_completed: Optional[bool] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    bookmarked: Optional[bool] = None

class LearningProgressOut(BaseModel):
    id: int
    module_id: int
    is_completed: bool
    progress_percentage: int
    bookmarked: bool
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- YouTube Video Schemas ---
class YouTubeVideoItem(BaseModel):
    video_id: str
    title: str
    channel_title: str
    description: str
    thumbnail_url: str
    published_at: Optional[str] = None
    watch_url: str
    embed_url: str
    is_live_api: bool = False

# --- Machine Directory Schemas ---
class MachineDirectoryOut(BaseModel):
    id: int
    name: str
    purpose: str
    main_components: str
    maintenance_info: str
    safety_precautions: str
    indicative_price: Optional[str] = None
    supplier_info: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Review Schemas ---
class ReviewCreate(BaseModel):
    product_id: Optional[int] = None
    module_id: Optional[int] = None
    review_type: str = "product"  # product, learning, platform
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3)

class ReviewOut(BaseModel):
    id: int
    user_id: int
    product_id: Optional[int] = None
    module_id: Optional[int] = None
    review_type: str
    rating: int
    comment: str
    is_verified_purchase: bool
    is_moderated: bool
    created_at: datetime
    user_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Badge Schemas ---
class UserBadgeOut(BaseModel):
    id: int
    badge_name: str
    badge_description: str
    badge_icon: str
    earned_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Calculator Schemas ---
class CostCalculatorInput(BaseModel):
    material_cost: float = Field(..., ge=0)
    labor_cost: float = Field(..., ge=0)
    finishing_cost: float = Field(0.0, ge=0)
    packaging_cost: float = Field(0.0, ge=0)
    transport_cost: float = Field(0.0, ge=0)
    other_expenses: float = Field(0.0, ge=0)
    desired_margin_percentage: float = Field(..., ge=0, lt=100)

class CostCalculatorResult(BaseModel):
    total_cost: float
    desired_margin_percentage: float
    suggested_selling_price: float
    estimated_profit: float
    disclaimer: str

# --- Bulk Inquiry Schemas ---
class BulkInquiryCreate(BaseModel):
    organization_name: str
    contact_person: str
    email: EmailStr
    phone: str
    product_type: str
    estimated_quantity: int = Field(..., gt=0)
    notes: Optional[str] = None

class BulkInquiryOut(BulkInquiryCreate):
    id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- AI Assistant Schemas ---
class AssistantMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class AssistantChatRequest(BaseModel):
    message: str
    language: str = "en"  # en, te, hi
    detected_language: Optional[str] = None
    current_path: Optional[str] = None
    conversation_history: Optional[List[AssistantMessage]] = []

class AssistantChatResponse(BaseModel):
    reply: str
    language: str
    action: Optional[str] = None  # e.g. "NAVIGATE", "CHANGE_LANG", "OPEN_CALCULATOR", "OPEN_BULK"
    action_data: Optional[str] = None
    suggested_chips: Optional[List[str]] = []
