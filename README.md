# MUKIFOOD PRODUCTS – Online Ordering Platform

An authentic, modern e-commerce and delivery platform built for **MUKIFOOD PRODUCTS**, a family-run traditional food business based in Tamil Nadu, India.

---

## 🌾 Overview

MUKIFOOD PRODUCTS specializes in traditional, unrefined natural foods starting with **Nattu Sakarai** (traditional country sugarcane & palm jaggery), expanding to palm candy, cold-pressed oils, millets, snacks, and traditional health mixes.

The platform provides a bilingual (English & Tamil), mobile-first ordering experience for customers with seamless guest checkout (no mandatory login), while providing the business owners with a full-fledged management back-office and delivery workflow.

---

## ✨ Key Features

### 🛍️ Customer Storefront (`/`, `/products`, `/cart`, `/checkout`)
- **Bilingual Experience**: Instant one-click toggle between **English** and **தமிழ் (Tamil)**.
- **Hero & Storytelling**: Authentic brand heritage showcasing traditional wood-fire processing, farmer sourcing, and grandmother recipes.
- **Dynamic Catalog**: Multiple weight variants (500g, 1kg, 2kg, 5kg bulk) with dynamic pricing and stock status.
- **Guest-Friendly Checkout**: Fast ordering with phone number, recipient details, and delivery instructions.
- **Gifting Support**: Send directly to relatives or friends with custom gift messages.
- **Delivery Pincode Checker**: Live serviceability check and automated free-delivery calculation for orders above ₹500.
- **Payment Modes**: Cash on Delivery (COD) and Direct UPI QR / Intent payments.
- **Live Order Tracking (`/track`)**: Customers can look up their real-time order status and timeline using their Order ID and Phone Number.
- **Wholesale & Bulk Enquiries (`/wholesale`)**: Direct inquiry form for festival orders, retail distribution, and bulk packaging.
- **PWA Ready**: Progressive Web App manifest enabled for installability on Android & iOS mobile devices.

### 🛡️ Admin Management Suite (`/admin`)
- **Live Dashboard (`/admin`)**: Revenue metrics, order velocity, active customers, pending action alerts.
- **Order Pipeline (`/admin/orders`)**: Complete status management (`placed` → `confirmed` → `packed` → `shipped` → `out_for_delivery` → `delivered` → `cancelled`).
- **Catalog Management (`/admin/products`)**: Add new products, configure Tamil/English titles, descriptions, and weight variants with zero code changes.
- **Customer CRM (`/admin/customers`)**: View customer order frequency, lifetime spend, and contact details.
- **Coupon Engine (`/admin/coupons`)**: Create percentage and flat discounts, set minimum cart requirements, usage limits, and validity.
- **Wholesale Leads (`/admin/enquiries`)**: Review and manage bulk enquiry requests.
- **Store Settings (`/admin/settings`)**: Configure UPI IDs, store contact numbers, free shipping thresholds, and business details.

### 🚚 Delivery Partner Portal (`/delivery`)
- **Mobile-First Delivery App**: Optimized for delivery staff on motorbikes and trucks.
- **Assigned Deliveries**: One-click customer phone dialer and detailed address breakdown.
- **OTP Delivery Verification**: 4-digit customer delivery OTP verification to safely close orders and collect COD.

---

## 🔑 Demo Access Credentials

| Role | Portal URL | Login Email / ID | Password |
|---|---|---|---|
| **Store Admin** | `/admin/login` | `admin@mukifood.com` | `MukiFood@2024` |
| **Delivery Staff** | `/delivery` | `delivery@mukifood.com` | `delivery123` |
| **Customer** | `/` | *Guest Checkout (Phone number)* | *No password required* |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom earthy palette (Jaggery Amber, Sugarcane Green, Organic Cream)
- **Database & ORM**: SQLite + Prisma ORM (seamlessly swappable with PostgreSQL)
- **State Management**: React Context (Cart, Language Preferences, Toast Notifications)
- **Typography**: Google Fonts (*Outfit* + *Noto Sans Tamil*)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup & Seeding
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```

The application is now live at:
- **Customer Store**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Delivery Portal**: [http://localhost:3000/delivery](http://localhost:3000/delivery)

---

## 📋 Architectural Assumptions & Decisions

1. **Database & Storage**: SQLite is configured for zero-setup local execution with Prisma schema prepared for PostgreSQL production deployment.
2. **Zero-Friction Checkout**: In accordance with Indian rural and tier-2/3 consumer behavior, checkout does not require upfront password registration; phone number verification serves as the customer identifier.
3. **Delivery OTP**: For high reliability on COD orders, orders generate a delivery verification code that must be entered by the delivery agent to prevent delivery disputes.
4. **Localization**: English and Tamil strings are maintained via a lightweight client-side internationalization system that preserves state across page navigation without route prefix clutter.
