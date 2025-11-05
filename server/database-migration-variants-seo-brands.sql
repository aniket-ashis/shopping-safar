-- Migration Script: Add Variants, SEO Fields, and Brands
-- Run this in your Supabase SQL Editor if you have an existing database
-- This script adds all the new fields and tables needed for the updated system

-- Add SEO fields to products table if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_title TEXT;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_keywords TEXT;

-- Add updated_at to products if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image TEXT;

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create brands table if it doesn't exist
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  logo TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate existing category data (if products table has category column)
-- Note: This assumes you have a category TEXT column that needs to be migrated
-- Uncomment and adjust if needed:
/*
DO $$
DECLARE
    cat_name TEXT;
    cat_id UUID;
BEGIN
    FOR cat_name IN SELECT DISTINCT category FROM products WHERE category IS NOT NULL LOOP
        -- Find or create category
        SELECT id INTO cat_id FROM categories WHERE name = cat_name;
        IF cat_id IS NULL THEN
            INSERT INTO categories (name) VALUES (cat_name) RETURNING id INTO cat_id;
        END IF;
        -- Update products to use category_id
        UPDATE products SET category_id = cat_id WHERE category = cat_name;
    END LOOP;
END $$;

-- After migration, you can drop the old category column:
-- ALTER TABLE products DROP COLUMN IF EXISTS category;
*/

-- Migrate existing brand data (if products table has brand column)
-- Note: This assumes you have a brand TEXT column that needs to be migrated
-- Uncomment and adjust if needed:
/*
DO $$
DECLARE
    brand_name TEXT;
    brand_id UUID;
BEGIN
    FOR brand_name IN SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL LOOP
        -- Find or create brand
        SELECT id INTO brand_id FROM brands WHERE name = brand_name;
        IF brand_id IS NULL THEN
            INSERT INTO brands (name) VALUES (brand_name) RETURNING id INTO brand_id;
        END IF;
        -- Update products to use brand_id
        UPDATE products SET brand_id = brand_id WHERE brand = brand_name;
    END LOOP;
END $$;

-- After migration, you can drop the old brand column:
-- ALTER TABLE products DROP COLUMN IF EXISTS brand;
*/

-- Add category_id and brand_id columns to products if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- Function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at (create if not exists)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

