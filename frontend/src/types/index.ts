export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  role: 'customer' | 'artisan' | 'admin'
  preferred_language: 'en' | 'te' | 'hi'
  avatar_url?: string
  created_at: string
}

export interface ArtisanProfile {
  id: number
  user_id: number
  artisan_name: string
  village: string
  region: string
  bio?: string
  craft_specialization: string
  experience_years: number
  phone?: string
  avatar_url?: string
  total_earnings: number
  is_verified: boolean
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
}

export interface ProductImage {
  id: number
  image_url: string
  is_primary: boolean
}

export interface Product {
  id: number
  sku?: string
  artisan_id: number
  category_id: number
  title: string
  description: string
  price: number
  discount_price?: number
  stock: number
  subcategory?: string
  dimensions?: string
  weight?: string
  materials: string
  craftsmanship_details?: string
  customization_options?: string
  min_order_quantity?: number
  estimated_prep_time?: string
  delivery_pickup_info?: string
  is_published: boolean
  is_draft: boolean
  is_demo: boolean
  is_featured?: boolean
  is_seasonal?: boolean
  is_active?: boolean
  rating: number
  review_count: number
  created_at: string
  images: ProductImage[]
  artisan?: ArtisanProfile
  category?: Category
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  product: Product
}

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  shipping_fee: number
  tax_amount?: number
  total: number
}

export interface OrderItem {
  id: number
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  product?: Product
}

export interface Order {
  id: number
  order_number: string
  access_token?: string
  user_id?: number
  customer_name?: string
  customer_phone?: string
  total_amount: number
  shipping_fee: number
  tax_amount: number
  status: string
  reservation_status?: string
  expires_at?: string
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_state?: string
  shipping_pincode?: string
  delivery_type?: 'delivery' | 'pickup'
  order_source?: string
  payment_method: string
  payment_status: string
  notes?: string
  created_at: string
  items: OrderItem[]
}

export interface BusinessConfig {
  whatsapp_number: string
  whatsapp_formatted: string
  business_name: string
  subtitle: string
  tagline: string
  pickup_address: string
  support_phone: string
  support_email: string
}

export interface LearningProgress {
  id: number
  module_id: number
  is_completed: boolean
  progress_percentage: number
  bookmarked: boolean
  completed_at?: string
}

export interface LearningModule {
  id: number
  title: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration: string
  thumbnail_url?: string
  video_url?: string
  is_demo: boolean
  summary: string
  learning_objectives: string
  steps_content: string
  safety_precautions: string
  downloadable_guide_url?: string
  created_at: string
  user_progress?: LearningProgress
}

export interface MachineDirectoryItem {
  id: number
  name: string
  purpose: string
  main_components: string
  maintenance_info: string
  safety_precautions: string
  indicative_price?: string
  supplier_info?: string
  image_url?: string
  created_at: string
}

export interface Review {
  id: number
  user_id: number
  product_id?: number
  module_id?: number
  review_type: 'product' | 'learning' | 'platform'
  rating: number
  comment: string
  is_verified_purchase: boolean
  is_moderated: boolean
  created_at: string
  user_name?: string
}

export interface UserBadge {
  id: number
  badge_name: string
  badge_description: string
  badge_icon: string
  earned_at: string
}
