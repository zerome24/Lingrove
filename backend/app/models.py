import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="customer")  # "customer", "artisan", "admin"
    preferred_language = Column(String(10), default="en")  # "en", "te", "hi"
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    artisan_profile = relationship("ArtisanProfile", back_populates="user", uselist=False)
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    learning_progresses = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")

class ArtisanProfile(Base):
    __tablename__ = "artisan_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    artisan_name = Column(String(255), nullable=False)
    village = Column(String(255), nullable=False)
    region = Column(String(255), default="Telangana")
    bio = Column(Text, nullable=True)
    craft_specialization = Column(String(255), default="Bamboo Baskets & Handicrafts")
    experience_years = Column(Integer, default=5)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    total_earnings = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="artisan_profile")
    products = relationship("Product", back_populates="artisan")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)
    stock = Column(Integer, default=10, nullable=False)
    subcategory = Column(String(100), nullable=True)
    is_published = Column(Boolean, default=True, index=True)
    is_draft = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    is_seasonal = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True, index=True)
    rating = Column(Float, default=4.8)
    review_count = Column(Integer, default=0)
    dimensions = Column(String(100), nullable=True)
    weight = Column(String(50), nullable=True)
    materials = Column(String(255), default="100% Natural Lingala Bamboo")
    craftsmanship_details = Column(Text, nullable=True)
    customization_options = Column(Text, nullable=True)
    min_order_quantity = Column(Integer, default=1, nullable=False)
    estimated_prep_time = Column(String(100), default="Ready to ship", nullable=True)
    delivery_pickup_info = Column(String(255), default="Standard courier or CMRTC workshop pickup", nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    artisan = relationship("ArtisanProfile", back_populates="products")
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)

    product = relationship("Product", back_populates="images")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")

class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    access_token = Column(String(64), unique=True, index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(255), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    total_amount = Column(Float, nullable=False)
    shipping_fee = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    status = Column(String(50), default="awaiting_confirmation")  # awaiting_confirmation, confirmed, processing, shipped, delivered, cancelled, expired
    reservation_status = Column(String(50), default="active")  # active, confirmed, released, expired
    expires_at = Column(DateTime, nullable=True)
    shipping_name = Column(String(255), nullable=True)
    shipping_phone = Column(String(50), nullable=True)
    shipping_address = Column(Text, nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_state = Column(String(100), nullable=True)
    shipping_pincode = Column(String(20), nullable=True)
    delivery_type = Column(String(50), default="delivery")  # delivery, pickup
    order_source = Column(String(50), default="whatsapp")  # whatsapp, web
    payment_method = Column(String(50), default="whatsapp")  # whatsapp, cod
    payment_status = Column(String(50), default="not_yet_confirmed")  # not_yet_confirmed, payment_pending, payment_received, payment_failed, refunded
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id"), nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class LearningModule(Base):
    __tablename__ = "learning_modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # Cutting, Slicing, Splitting, Weaving, etc.
    difficulty = Column(String(50), default="beginner")  # beginner, intermediate, advanced
    estimated_duration = Column(String(50), default="25 mins")
    thumbnail_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    is_demo = Column(Boolean, default=False)
    summary = Column(Text, nullable=False)
    learning_objectives = Column(Text, nullable=False)  # JSON or newline-separated
    steps_content = Column(Text, nullable=False)  # JSON or markdown step by step
    safety_precautions = Column(Text, nullable=False)
    downloadable_guide_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    progresses = relationship("LearningProgress", back_populates="module", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="module")

class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("learning_modules.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    progress_percentage = Column(Integer, default=0)
    bookmarked = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="learning_progresses")
    module = relationship("LearningModule", back_populates="progresses")

class MachineDirectory(Base):
    __tablename__ = "machine_directory"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=False)
    main_components = Column(Text, nullable=False)
    maintenance_info = Column(Text, nullable=False)
    safety_precautions = Column(Text, nullable=False)
    indicative_price = Column(String(100), nullable=True)
    supplier_info = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    module_id = Column(Integer, ForeignKey("learning_modules.id"), nullable=True)
    review_type = Column(String(50), default="product")  # product, learning, platform
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    is_verified_purchase = Column(Boolean, default=False)
    is_moderated = Column(Boolean, default=True)  # True = approved/visible
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
    module = relationship("LearningModule", back_populates="reviews")

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_name = Column(String(100), nullable=False)
    badge_description = Column(String(255), nullable=False)
    badge_icon = Column(String(50), default="Award")
    earned_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="badges")

class BulkInquiry(Base):
    __tablename__ = "bulk_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    organization_name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    product_type = Column(String(255), nullable=False)
    estimated_quantity = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="new")  # new, contacted, closed
    created_at = Column(DateTime, default=utc_now)
