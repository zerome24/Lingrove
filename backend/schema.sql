-- =======================================================
-- LINGROVE — Lingala Bamboo Products at CMRTC
-- MySQL Database DDL Initialization Script
-- =======================================================

CREATE DATABASE IF NOT EXISTS `lingrove` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lingrove`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `role` VARCHAR(50) DEFAULT 'customer',
    `preferred_language` VARCHAR(10) DEFAULT 'en',
    `avatar_url` VARCHAR(500) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Artisan Profiles Table
CREATE TABLE IF NOT EXISTS `artisan_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `artisan_name` VARCHAR(255) NOT NULL,
    `village` VARCHAR(255) NOT NULL,
    `region` VARCHAR(255) DEFAULT 'Telangana',
    `bio` TEXT NULL,
    `craft_specialization` VARCHAR(255) DEFAULT 'Bamboo Baskets & Handicrafts',
    `experience_years` INT DEFAULT 5,
    `phone` VARCHAR(50) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `total_earnings` DOUBLE DEFAULT 0.0,
    `is_verified` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `artisan_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `stock` INT NOT NULL DEFAULT 10,
    `is_published` BOOLEAN DEFAULT TRUE,
    `is_draft` BOOLEAN DEFAULT FALSE,
    `is_demo` BOOLEAN DEFAULT FALSE,
    `rating` DOUBLE DEFAULT 4.8,
    `review_count` INT DEFAULT 0,
    `dimensions` VARCHAR(100) NULL,
    `materials` VARCHAR(255) DEFAULT '100% Natural Lingala Bamboo',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`artisan_id`) REFERENCES `artisan_profiles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
    INDEX `idx_products_category` (`category_id`),
    INDEX `idx_products_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Images Table
CREATE TABLE IF NOT EXISTS `product_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `is_primary` BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart Items Table
CREATE TABLE IF NOT EXISTS `cart_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wishlist Table
CREATE TABLE IF NOT EXISTS `wishlist_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `user_id` INT NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `shipping_fee` DOUBLE DEFAULT 0.0,
    `tax_amount` DOUBLE DEFAULT 0.0,
    `status` VARCHAR(50) DEFAULT 'confirmed',
    `shipping_name` VARCHAR(255) NOT NULL,
    `shipping_phone` VARCHAR(50) NOT NULL,
    `shipping_address` TEXT NOT NULL,
    `shipping_city` VARCHAR(100) NOT NULL,
    `shipping_state` VARCHAR(100) NOT NULL,
    `shipping_pincode` VARCHAR(20) NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT 'demo_upi',
    `payment_status` VARCHAR(50) DEFAULT 'completed',
    `notes` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_orders_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `artisan_id` INT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `total_price` DOUBLE NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`artisan_id`) REFERENCES `artisan_profiles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Learning Modules Table
CREATE TABLE IF NOT EXISTS `learning_modules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `difficulty` VARCHAR(50) DEFAULT 'beginner',
    `estimated_duration` VARCHAR(50) DEFAULT '25 mins',
    `thumbnail_url` VARCHAR(500) NULL,
    `video_url` VARCHAR(500) NULL,
    `is_demo` BOOLEAN DEFAULT FALSE,
    `summary` TEXT NOT NULL,
    `learning_objectives` TEXT NOT NULL,
    `steps_content` TEXT NOT NULL,
    `safety_precautions` TEXT NOT NULL,
    `downloadable_guide_url` VARCHAR(500) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Learning Progress Table
CREATE TABLE IF NOT EXISTS `learning_progress` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `module_id` INT NOT NULL,
    `is_completed` BOOLEAN DEFAULT FALSE,
    `progress_percentage` INT DEFAULT 0,
    `bookmarked` BOOLEAN DEFAULT FALSE,
    `completed_at` DATETIME NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`module_id`) REFERENCES `learning_modules`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uniq_user_module` (`user_id`, `module_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Machine Directory Table
CREATE TABLE IF NOT EXISTS `machine_directory` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `purpose` TEXT NOT NULL,
    `main_components` TEXT NOT NULL,
    `maintenance_info` TEXT NOT NULL,
    `safety_precautions` TEXT NOT NULL,
    `indicative_price` VARCHAR(100) NULL,
    `supplier_info` VARCHAR(255) NULL,
    `image_url` VARCHAR(500) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `product_id` INT NULL,
    `module_id` INT NULL,
    `review_type` VARCHAR(50) DEFAULT 'product',
    `rating` INT NOT NULL,
    `comment` TEXT NOT NULL,
    `is_verified_purchase` BOOLEAN DEFAULT FALSE,
    `is_moderated` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`module_id`) REFERENCES `learning_modules`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Badges Table
CREATE TABLE IF NOT EXISTS `user_badges` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `badge_name` VARCHAR(100) NOT NULL,
    `badge_description` VARCHAR(255) NOT NULL,
    `badge_icon` VARCHAR(50) DEFAULT 'Award',
    `earned_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bulk Inquiries Table
CREATE TABLE IF NOT EXISTS `bulk_inquiries` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_name` VARCHAR(255) NOT NULL,
    `contact_person` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `product_type` VARCHAR(255) NOT NULL,
    `estimated_quantity` INT NOT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(50) DEFAULT 'new',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
