# LINGROVE — System Architecture & Design
## Official Subtitle: Lingala Bamboo Products at CMRTC
### Tagline: Learn. Create. Sell. Grow Together.

---

## 1. System Overview

LINGROVE is an enterprise-grade full-stack web application designed for dual-mission impact:
1. **Learn Bamboo Craftsmanship**: Structured rural skill development from harvesting, cutting, slicing, splitting, weaving to industrial machinery operation at CMRTC.
2. **Sell Handcrafted Bamboo Products**: Direct artisan e-commerce marketplace connecting Lingala village craftspeople directly with conscious consumers and institutional buyers nationwide.

```
                           +----------------------------------------+
                           |           Frontend (React/Vite)        |
                           |  - Tailwind CSS + i18next (EN/TE/HI)   |
                           |  - Floating Voice & Text AI (Lingua)   |
                           |  - Bamboo Cost Calculator Modal        |
                           +-------------------+--------------------+
                                               |
                                     JSON / REST APIs
                                               |
                                               v
                           +----------------------------------------+
                           |          Backend (FastAPI)             |
                           |  - JWT Auth & Role-Based Security      |
                           |  - Transactional Inventory Engine      |
                           |  - Multilingual AI Assistant Engine    |
                           +-------------------+--------------------+
                                               |
                                   SQLAlchemy ORM (MySQL / SQLite)
                                               |
                                               v
                           +----------------------------------------+
                           |          Database Storage              |
                           |  - MySQL 8.0 DDL (schema.sql)          |
                           |  - Automatic SQLite Fallback           |
                           +----------------------------------------+
```

---

## 2. Core Architectural Layers

### A. Frontend Layer (`/frontend`)
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 with custom theme tokens:
  - Forest Green (`#24452D`)
  - Leaf Green (`#65834C`)
  - Bamboo Beige (`#F3E9D5`)
  - Warm Cream (`#FAF8F1`)
  - Harvest Amber (`#E8A64A`)
  - Dark Text (`#263328`)
- **Multilingual System**: `i18next` + `react-i18next` with real-time reactive language switching across English, Telugu (తెలుగు), and Hindi (हिन्दी).
- **Voice AI Assistant**: Browser Speech Recognition (`webkitSpeechRecognition`) + Speech Synthesis (`SpeechSynthesisUtterance`) integrated with backend NLP intent classification.
- **State Management**: React Context (`AuthContext` for persistent JWT sessions, `CartContext` for synchronized inventory & cart calculations).

### B. Backend Layer (`/backend`)
- **Framework**: FastAPI (Python 3.14+)
- **Security**: JWT authentication (`python-jose`), salted password hashing, role-based authorization guards (`customer`, `artisan`, `admin`).
- **Data Validation**: Pydantic v2 schemas for request and response models.
- **Database Engine**: SQLAlchemy with dual-driver connectivity:
  - Primary: MySQL 8.0 via `pymysql` (`mysql+pymysql://root:password@localhost:3306/lingrove`)
  - Secondary/Fallback: Local SQLite engine for instant zero-dependency execution.
- **Transactional Stock Control**: Server-side stock deduction on checkout inside isolated atomic database transactions.

---

## 3. Database Schema Overview

| Table | Purpose |
|---|---|
| `users` | Customer, artisan, and administrator accounts with password hashes and preferred languages |
| `artisan_profiles` | Village origins, specialization, recorded sales earnings, experience, verification badges |
| `categories` | Product classification (Baskets, Furniture, Kitchenware, Decor, Lamps, Storage, etc.) |
| `products` | Product listings with prices in INR, inventory stock, materials, dimensions, demo flags |
| `product_images` | Multi-image product photo galleries |
| `cart_items` | Real-time user shopping carts |
| `orders` | Transactional order headers with shipping information and demo payment boundaries |
| `order_items` | Line items with unit prices and artisan linkages |
| `learning_modules` | Step-by-step processing lessons, objectives, guides, and safety advisories |
| `learning_progress` | User completion percentages, bookmark flags, and timestamps |
| `machine_directory` | Specifications, maintenance instructions, and safety warnings for CMRTC machines |
| `reviews` | Customer product reviews, learning feedback, platform ratings with verified purchase flags |
| `user_badges` | Digital achievement badges (e.g. Master Basket Weaver, CMRTC Pioneer Artisan) |
| `bulk_inquiries` | B2B bulk order requests from institutions, NGOs, and businesses |

---

## 4. Cost Calculator Formula
The Bamboo Product Cost Calculator implements the exact rural empowerment pricing model:
$$\text{Total Cost} = \text{Raw Material} + \text{Labor} + \text{Finishing} + \text{Packaging} + \text{Transport} + \text{Other Expenses}$$

$$\text{Suggested Selling Price} = \frac{\text{Total Cost}}{1 - \frac{\text{Margin Percentage}}{100}}$$

$$\text{Estimated Net Profit} = \text{Suggested Selling Price} - \text{Total Cost}$$

Where $0 \le \text{Margin Percentage} < 100$.
