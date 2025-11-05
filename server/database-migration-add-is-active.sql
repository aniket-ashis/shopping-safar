-- Migration: Add is_active fields to products and product_variants tables
-- Run this script in your Supabase SQL Editor if you have an existing database
-- If you're setting up a new database, use database-setup.sql which already includes these columns

-- Add is_active column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to product_variants table
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update all existing products and variants to be active by default
UPDATE products 
SET is_active = TRUE 
WHERE is_active IS NULL;

UPDATE product_variants 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);

