/*
# Explore Matrouh — Phase 2: Core tables

Creates app_settings, categories, places, favorites, reviews, news tables.
*/

-- app_settings
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp text,
  facebook text,
  instagram text,
  email text,
  website text,
  tiktok text,
  playstore_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_app_settings" ON app_settings;
CREATE POLICY "public_read_app_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_app_settings" ON app_settings;
CREATE POLICY "admin_insert_app_settings" ON app_settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_update_app_settings" ON app_settings;
CREATE POLICY "admin_update_app_settings" ON app_settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_delete_app_settings" ON app_settings;
CREATE POLICY "admin_delete_app_settings" ON app_settings FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

INSERT INTO app_settings (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  slug text UNIQUE,
  image_url text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- places
CREATE TABLE IF NOT EXISTS places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text,
  description_ar text,
  address text,
  google_maps_url text,
  phone text,
  price_level text CHECK (price_level IN ('$', '$$', '$$$')),
  status text DEFAULT 'Open' CHECK (status IN ('Open', 'Closed', 'Seasonal')),
  image_url text,
  image_gallery_url jsonb DEFAULT '[]'::jsonb,
  whatsapp_number text,
  whatsapp_message text,
  is_featured boolean DEFAULT false,
  has_offers boolean DEFAULT false,
  rating numeric(3,1) DEFAULT 0,
  latitude numeric(10,6),
  longitude numeric(10,6),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS places_category_id_idx ON places(category_id);
CREATE INDEX IF NOT EXISTS places_is_featured_idx ON places(is_featured);
CREATE INDEX IF NOT EXISTS places_has_offers_idx ON places(has_offers);

ALTER TABLE places ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_places" ON places;
CREATE POLICY "public_read_places" ON places FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_places" ON places;
CREATE POLICY "admin_insert_places" ON places FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_update_places" ON places;
CREATE POLICY "admin_update_places" ON places FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_delete_places" ON places;
CREATE POLICY "admin_delete_places" ON places FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, place_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_place_id_idx ON favorites(place_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_favorites" ON favorites;
CREATE POLICY "owner_select_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_insert_favorites" ON favorites;
CREATE POLICY "owner_insert_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_update_favorites" ON favorites;
CREATE POLICY "owner_update_favorites" ON favorites FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_delete_favorites" ON favorites;
CREATE POLICY "owner_delete_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  user_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, place_id)
);

CREATE INDEX IF NOT EXISTS reviews_place_id_idx ON reviews(place_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_reviews" ON reviews;
CREATE POLICY "owner_insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_update_reviews" ON reviews;
CREATE POLICY "owner_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_delete_reviews" ON reviews;
CREATE POLICY "owner_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- news
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  image_url text,
  source_name text,
  source_url text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_news" ON news;
CREATE POLICY "public_read_news" ON news FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_news" ON news;
CREATE POLICY "admin_insert_news" ON news FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_update_news" ON news;
CREATE POLICY "admin_update_news" ON news FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "admin_delete_news" ON news;
CREATE POLICY "admin_delete_news" ON news FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Seed default categories
INSERT INTO categories (name, name_ar, slug, sort_order) VALUES
  ('Beaches', 'الشواطئ', 'beaches', 1),
  ('Hotels', 'الفنادق', 'hotels', 2),
  ('Cafes', 'المقاهي', 'cafes', 3),
  ('Restaurants', 'المطاعم', 'restaurants', 4),
  ('Markets', 'الأسواق', 'markets', 5),
  ('Entertainment', 'الترفيه', 'entertainment', 6),
  ('Hospitals', 'المستشفيات', 'hospitals', 7),
  ('Clinics', 'العيادات', 'clinics', 8),
  ('Pharmacies', 'الصيدليات', 'pharmacies', 9),
  ('Banks', 'البنوك', 'banks', 10),
  ('ATMs', 'ماكينات الصراف', 'atms', 11),
  ('Car Maintenance', 'صيانة السيارات', 'car-maintenance', 12),
  ('Emergencies', 'الطوارئ', 'emergencies', 13),
  ('Transportation', 'المواصلات', 'transportation', 14),
  ('Car Rental', 'تأجير السيارات', 'car-rental', 15),
  ('Supermarkets', 'السوبر ماركت', 'supermarkets', 16),
  ('Bakeries', 'المخابز', 'bakeries', 17),
  ('Government Offices', 'المكاتب الحكومية', 'government-offices', 18),
  ('Gas Stations', 'محطات الوقود', 'gas-stations', 19),
  ('Electronics Repair', 'إصلاح الإلكترونيات', 'electronics-repair', 20)
ON CONFLICT (slug) DO NOTHING;
