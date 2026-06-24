-- ==============================
-- ShopElite Seed Data
-- ==============================

-- Categories
INSERT INTO public.categories (name, slug, description, image_url, sort_order, is_active) VALUES
  ('Electronics', 'electronics', 'Gadgets and electronic devices', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop', 1, true),
  ('Clothing', 'clothing', 'Men and women fashion', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop', 2, true),
  ('Home & Living', 'home-living', 'Home decor and furniture', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 3, true),
  ('Sports', 'sports', 'Sports and fitness equipment', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop', 4, true),
  ('Books', 'books', 'Books and educational materials', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop', 5, true),
  ('Beauty', 'beauty', 'Beauty and personal care', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO public.products (name, slug, description, price, compare_price, category_id, stock_quantity, is_active, is_featured, is_new_arrival) VALUES
  (
    'Premium Wireless Headphones',
    'premium-wireless-headphones',
    'Experience crystal-clear audio with our premium noise-cancelling wireless headphones. 40-hour battery life, comfortable over-ear design, and superior sound quality.',
    2999,
    4999,
    (SELECT id FROM public.categories WHERE slug = 'electronics'),
    50, true, true, false
  ),
  (
    'Smart Watch Pro',
    'smart-watch-pro',
    'Track your fitness, receive notifications, and stay connected with our advanced smartwatch. Heart rate monitor, GPS, and 7-day battery.',
    8999,
    12999,
    (SELECT id FROM public.categories WHERE slug = 'electronics'),
    30, true, true, true
  ),
  (
    'Men''s Classic White Shirt',
    'mens-classic-white-shirt',
    'Timeless Oxford cotton shirt, perfect for both formal and casual occasions. Available in multiple sizes.',
    999,
    1499,
    (SELECT id FROM public.categories WHERE slug = 'clothing'),
    100, true, true, false
  ),
  (
    'Women''s Summer Floral Dress',
    'womens-summer-floral-dress',
    'Light and breezy floral print dress, perfect for summer days. Made from breathable cotton blend.',
    1499,
    2499,
    (SELECT id FROM public.categories WHERE slug = 'clothing'),
    75, true, false, true
  ),
  (
    'Minimalist Desk Lamp',
    'minimalist-desk-lamp',
    'Elegant LED desk lamp with adjustable brightness and color temperature. Perfect for home office setups.',
    1299,
    null,
    (SELECT id FROM public.categories WHERE slug = 'home-living'),
    60, true, true, false
  ),
  (
    'Yoga Mat Premium',
    'yoga-mat-premium',
    '6mm thick non-slip yoga mat with alignment lines. Eco-friendly TPE material, perfect for all types of yoga and fitness.',
    899,
    1299,
    (SELECT id FROM public.categories WHERE slug = 'sports'),
    80, true, false, true
  ),
  (
    'Atomic Habits',
    'atomic-habits',
    'The #1 New York Times bestseller by James Clear. An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
    499,
    699,
    (SELECT id FROM public.categories WHERE slug = 'books'),
    200, true, true, false
  ),
  (
    'Vitamin C Face Serum',
    'vitamin-c-face-serum',
    'Brightening Vitamin C serum with hyaluronic acid. Reduces dark spots, evens skin tone, and boosts radiance.',
    799,
    1199,
    (SELECT id FROM public.categories WHERE slug = 'beauty'),
    120, true, false, true
  )
ON CONFLICT (slug) DO NOTHING;

-- Product Images
INSERT INTO public.product_images (product_id, url, alt, sort_order, is_primary)
SELECT
  p.id,
  CASE p.slug
    WHEN 'premium-wireless-headphones' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop'
    WHEN 'smart-watch-pro' THEN 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'
    WHEN 'mens-classic-white-shirt' THEN 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=800&fit=crop'
    WHEN 'womens-summer-floral-dress' THEN 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=800&fit=crop'
    WHEN 'minimalist-desk-lamp' THEN 'https://images.unsplash.com/photo-1587212490067-e10e0eff53e0?w=800&h=800&fit=crop'
    WHEN 'yoga-mat-premium' THEN 'https://images.unsplash.com/photo-1601925228442-9d0bbcf7a0fb?w=800&h=800&fit=crop'
    WHEN 'atomic-habits' THEN 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop'
    WHEN 'vitamin-c-face-serum' THEN 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop'
  END AS url,
  p.name AS alt,
  0 AS sort_order,
  true AS is_primary
FROM public.products p
WHERE p.slug IN (
  'premium-wireless-headphones', 'smart-watch-pro', 'mens-classic-white-shirt',
  'womens-summer-floral-dress', 'minimalist-desk-lamp', 'yoga-mat-premium',
  'atomic-habits', 'vitamin-c-face-serum'
)
ON CONFLICT DO NOTHING;
