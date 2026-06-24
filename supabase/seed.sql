-- ============================================================
-- ShopElite Seed Data — 8 categories + 20 products
-- Run in Supabase SQL Editor
-- ============================================================

-- ── Categories ────────────────────────────────────────────────
INSERT INTO public.categories (name, slug, description, image_url, sort_order, is_active) VALUES
  ('Electronics',   'electronics',  'Gadgets and electronic devices',         'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop', 1, true),
  ('Clothing',      'clothing',     'Men and women fashion',                  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop', 2, true),
  ('Footwear',      'footwear',     'Shoes, sneakers and sandals',            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 3, true),
  ('Accessories',   'accessories',  'Bags, wallets and lifestyle accessories','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', 4, true),
  ('Home & Living', 'home-living',  'Home decor and furniture',               'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 5, true),
  ('Sports',        'sports',       'Sports and fitness equipment',           'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop', 6, true),
  ('Beauty',        'beauty',       'Beauty and personal care',               'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', 7, true),
  ('Books',         'books',        'Books and educational materials',        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- ── Products ──────────────────────────────────────────────────
INSERT INTO public.products
  (name, slug, description, price, compare_price, category_id, stock_quantity, is_active, is_featured, is_new_arrival, sku)
VALUES

-- Electronics (5)
('Premium Wireless Headphones',
 'premium-wireless-headphones',
 'Crystal-clear audio with active noise cancellation. 40-hour battery, comfortable over-ear design and built-in mic.',
 2999, 4999, (SELECT id FROM public.categories WHERE slug='electronics'), 50, true, true, false, 'ELEC-001'),

('Smart Watch Pro',
 'smart-watch-pro',
 'Track fitness, receive notifications and stay connected. Heart rate monitor, GPS and 7-day battery life.',
 8999, 12999, (SELECT id FROM public.categories WHERE slug='electronics'), 30, true, true, true, 'ELEC-002'),

('Bluetooth Speaker Mini',
 'bluetooth-speaker-mini',
 'Compact 360° sound with 12-hour playtime. Waterproof IPX5, perfect for travel and outdoor use.',
 1499, 2199, (SELECT id FROM public.categories WHERE slug='electronics'), 80, true, false, true, 'ELEC-003'),

('Laptop Stand Aluminium',
 'laptop-stand-aluminium',
 'Adjustable aluminium laptop stand for better posture and airflow. Foldable and compatible with all laptops.',
 1299, 1799, (SELECT id FROM public.categories WHERE slug='electronics'), 60, true, true, false, 'ELEC-004'),

('USB-C 7-in-1 Hub',
 'usb-c-7-in-1-hub',
 'Expand your ports with HDMI 4K, 3×USB-A, SD card, USB-C PD and 3.5mm audio. Plug and play.',
 999, 1499, (SELECT id FROM public.categories WHERE slug='electronics'), 100, true, false, true, 'ELEC-005'),

-- Clothing (4)
('Men''s Classic Oxford Shirt',
 'mens-classic-oxford-shirt',
 'Premium cotton Oxford weave shirt. Sharp for office, relaxed for weekends. Machine washable.',
 999, 1499, (SELECT id FROM public.categories WHERE slug='clothing'), 120, true, true, false, 'CLO-001'),

('Women''s Summer Floral Dress',
 'womens-summer-floral-dress',
 'Light chiffon floral print midi dress. Relaxed A-line silhouette, perfect for brunches and holidays.',
 1599, 2499, (SELECT id FROM public.categories WHERE slug='clothing'), 75, true, false, true, 'CLO-002'),

('Men''s Slim Denim Jacket',
 'mens-slim-denim-jacket',
 'Classic indigo slim-fit denim jacket. Versatile layering piece for all seasons.',
 2499, 3499, (SELECT id FROM public.categories WHERE slug='clothing'), 45, true, true, true, 'CLO-003'),

('Women''s Cotton Kurta',
 'womens-cotton-kurta',
 'Comfortable handblock-print cotton kurta with embroidered neckline. Relaxed fit for everyday wear.',
 899, 1299, (SELECT id FROM public.categories WHERE slug='clothing'), 90, true, false, true, 'CLO-004'),

-- Footwear (3)
('Running Shoes AirMax',
 'running-shoes-airmax',
 'Lightweight mesh upper with responsive cushioning sole. Ideal for daily runs and gym sessions.',
 3499, 4999, (SELECT id FROM public.categories WHERE slug='footwear'), 55, true, true, false, 'FOOT-001'),

('Casual Canvas Sneakers',
 'casual-canvas-sneakers',
 'Classic low-top canvas sneakers in multiple colours. Vulcanised rubber sole for durability.',
 1299, 1799, (SELECT id FROM public.categories WHERE slug='footwear'), 100, true, true, true, 'FOOT-002'),

('Women''s Block Heel Sandals',
 'womens-block-heel-sandals',
 'Comfortable 5cm block heel sandals with cushioned footbed. Ankle strap for secure fit.',
 1799, 2499, (SELECT id FROM public.categories WHERE slug='footwear'), 40, true, false, true, 'FOOT-003'),

-- Accessories (2)
('Genuine Leather Wallet',
 'genuine-leather-wallet',
 'Slim bifold wallet in full-grain leather. 6 card slots, ID window and cash compartment.',
 1199, 1699, (SELECT id FROM public.categories WHERE slug='accessories'), 80, true, true, false, 'ACC-001'),

('Canvas Tote Bag',
 'canvas-tote-bag',
 'Heavy-duty cotton canvas tote with interior zip pocket. Perfect for daily carry or beach days.',
 699, 999, (SELECT id FROM public.categories WHERE slug='accessories'), 110, true, false, true, 'ACC-002'),

-- Home & Living (2)
('Minimalist Desk Lamp',
 'minimalist-desk-lamp',
 'LED desk lamp with 5 colour temperatures and touch dimmer. USB charging port built in.',
 1299, null, (SELECT id FROM public.categories WHERE slug='home-living'), 60, true, true, false, 'HOME-001'),

('Ceramic Mug Set of 4',
 'ceramic-mug-set-of-4',
 'Handcrafted matte ceramic mugs in earth tones. Microwave and dishwasher safe. 350ml capacity.',
 1099, 1499, (SELECT id FROM public.categories WHERE slug='home-living'), 70, true, false, true, 'HOME-002'),

-- Sports (2)
('Yoga Mat Premium 6mm',
 'yoga-mat-premium-6mm',
 'Non-slip TPE yoga mat with alignment lines. 6mm cushioning, eco-friendly and easy to clean.',
 899, 1299, (SELECT id FROM public.categories WHERE slug='sports'), 80, true, false, true, 'SPO-001'),

('Resistance Band Set',
 'resistance-band-set',
 'Set of 5 latex resistance bands (10–50 lbs). Includes carry bag and exercise guide.',
 599, 899, (SELECT id FROM public.categories WHERE slug='sports'), 150, true, true, false, 'SPO-002'),

-- Beauty (1)
('Vitamin C Brightening Serum',
 'vitamin-c-brightening-serum',
 '15% Vitamin C with hyaluronic acid and niacinamide. Reduces dark spots and boosts radiance in 4 weeks.',
 799, 1199, (SELECT id FROM public.categories WHERE slug='beauty'), 120, true, true, true, 'BEA-001'),

-- Books (1)
('Atomic Habits',
 'atomic-habits',
 'James Clear''s #1 bestseller on building good habits and breaking bad ones. Practical, science-backed framework.',
 499, 699, (SELECT id FROM public.categories WHERE slug='books'), 200, true, true, false, 'BOOK-001')

ON CONFLICT (slug) DO NOTHING;

-- ── Product Images (primary + secondary per product) ──────────
INSERT INTO public.product_images (product_id, url, alt, sort_order, is_primary)
SELECT p.id, imgs.url, imgs.alt, imgs.sort_order, imgs.is_primary
FROM public.products p
JOIN (VALUES
  -- Electronics
  ('premium-wireless-headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop', 'Wireless Headphones', 0, true),
  ('premium-wireless-headphones', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop', 'Headphones side view', 1, false),

  ('smart-watch-pro', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop', 'Smart Watch', 0, true),
  ('smart-watch-pro', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop', 'Smart Watch on wrist', 1, false),

  ('bluetooth-speaker-mini', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop', 'Bluetooth Speaker', 0, true),
  ('bluetooth-speaker-mini', 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&h=800&fit=crop', 'Speaker outdoor', 1, false),

  ('laptop-stand-aluminium', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop', 'Laptop Stand', 0, true),
  ('laptop-stand-aluminium', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=800&fit=crop', 'Laptop Stand with laptop', 1, false),

  ('usb-c-7-in-1-hub', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&h=800&fit=crop', 'USB Hub', 0, true),
  ('usb-c-7-in-1-hub', 'https://images.unsplash.com/photo-1563770660941-10bdd8343d5e?w=800&h=800&fit=crop', 'USB Hub ports', 1, false),

  -- Clothing
  ('mens-classic-oxford-shirt', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=800&fit=crop', 'Oxford Shirt front', 0, true),
  ('mens-classic-oxford-shirt', 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&h=800&fit=crop', 'Oxford Shirt worn', 1, false),

  ('womens-summer-floral-dress', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=800&fit=crop', 'Floral Dress', 0, true),
  ('womens-summer-floral-dress', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&h=800&fit=crop', 'Floral Dress worn', 1, false),

  ('mens-slim-denim-jacket', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&h=800&fit=crop', 'Denim Jacket', 0, true),
  ('mens-slim-denim-jacket', 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&h=800&fit=crop', 'Denim Jacket worn', 1, false),

  ('womens-cotton-kurta', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=800&fit=crop', 'Cotton Kurta', 0, true),
  ('womens-cotton-kurta', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=800&fit=crop', 'Kurta detail', 1, false),

  -- Footwear
  ('running-shoes-airmax', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop', 'Running Shoes', 0, true),
  ('running-shoes-airmax', 'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=800&h=800&fit=crop', 'Running Shoes side', 1, false),

  ('casual-canvas-sneakers', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop', 'Canvas Sneakers', 0, true),
  ('casual-canvas-sneakers', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop', 'Sneakers pair', 1, false),

  ('womens-block-heel-sandals', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop', 'Block Heel Sandals', 0, true),
  ('womens-block-heel-sandals', 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&h=800&fit=crop', 'Sandals side', 1, false),

  -- Accessories
  ('genuine-leather-wallet', 'https://images.unsplash.com/photo-1627123424574-724758594913?w=800&h=800&fit=crop', 'Leather Wallet', 0, true),
  ('genuine-leather-wallet', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop', 'Wallet open', 1, false),

  ('canvas-tote-bag', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop', 'Canvas Tote', 0, true),
  ('canvas-tote-bag', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop', 'Tote worn', 1, false),

  -- Home & Living
  ('minimalist-desk-lamp', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop', 'Desk Lamp', 0, true),
  ('minimalist-desk-lamp', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', 'Lamp on desk', 1, false),

  ('ceramic-mug-set-of-4', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop', 'Ceramic Mugs', 0, true),
  ('ceramic-mug-set-of-4', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop', 'Mug close up', 1, false),

  -- Sports
  ('yoga-mat-premium-6mm', 'https://images.unsplash.com/photo-1601925228442-9d0bbcf7a0fb?w=800&h=800&fit=crop', 'Yoga Mat', 0, true),
  ('yoga-mat-premium-6mm', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=800&fit=crop', 'Yoga Mat in use', 1, false),

  ('resistance-band-set', 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=800&h=800&fit=crop', 'Resistance Bands', 0, true),
  ('resistance-band-set', 'https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?w=800&h=800&fit=crop', 'Bands in use', 1, false),

  -- Beauty
  ('vitamin-c-brightening-serum', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop', 'Vitamin C Serum', 0, true),
  ('vitamin-c-brightening-serum', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop', 'Serum texture', 1, false),

  -- Books
  ('atomic-habits', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop', 'Atomic Habits book', 0, true),
  ('atomic-habits', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=800&fit=crop', 'Book open', 1, false)

) AS imgs(slug, url, alt, sort_order, is_primary)
ON (p.slug = imgs.slug)
ON CONFLICT DO NOTHING;
