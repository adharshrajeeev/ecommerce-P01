# ShopElite — Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Your `.env.local` already has the Supabase URL and keys. No changes needed.

## 3. Set Up Database

Go to your Supabase project → SQL Editor → New Query, then paste and run the contents of:

1. `supabase/schema.sql` — Creates all tables, RLS policies, and the auth trigger
2. `supabase/seed.sql` — Inserts sample categories, products, and images

## 4. Create Admin User

After running the schema:
1. Sign up through the app at `/auth/signup`
2. Go to Supabase → Table Editor → `users` table
3. Find your user and change `role` from `customer` to `admin`

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Customer-facing pages
│   │   ├── page.tsx      # Home page
│   │   ├── products/     # Product listing & detail
│   │   ├── wishlist/     # Wishlist
│   │   ├── checkout/     # Checkout
│   │   └── dashboard/    # User dashboard
│   ├── admin/            # Admin panel
│   └── auth/             # Auth pages
├── components/
│   ├── ui/               # Shadcn/UI base components
│   ├── layout/           # Navbar, Footer, CartSheet
│   └── product/          # ProductCard, ProductGrid
├── features/
│   └── home/             # Home page feature components
├── services/             # Supabase data access layer
├── hooks/                # React Query hooks
├── store/                # Zustand stores
├── types/                # TypeScript types
└── lib/
    ├── supabase/         # Supabase client setup
    └── utils.ts          # Utility functions
```

## Key Features Built

### Customer
- Home page with hero, categories, featured & new arrivals
- Product catalog with search, filter by category, sort by price/latest
- Product detail with image gallery, stock status, related products
- Wishlist (add/remove)
- Shopping cart (sheet drawer, add/update/remove)
- Checkout with address form + Cash on Delivery
- User dashboard (profile, order history, order detail)

### Admin Panel (`/admin`)
- Dashboard with stats (orders, products, users, revenue)
- Product management (create, edit, delete, image upload)
- Category management (create, edit, delete)
- Order management (view all, update status)
- User management (view, enable/disable)

### Technical
- Dark mode support
- Skeleton loading states
- Empty states
- Toast notifications
- Mobile-first responsive design
- Row Level Security on all Supabase tables
- Auth middleware protecting dashboard, checkout, and admin routes
