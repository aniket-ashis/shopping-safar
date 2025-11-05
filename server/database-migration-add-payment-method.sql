-- Migration: Add payment_method column to orders table
-- Run this script in your Supabase SQL Editor if you have an existing database
-- If you're setting up a new database, use database-setup.sql which already includes this column

-- Add payment_method column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash_on_delivery';

-- Update existing orders to have default payment method
UPDATE orders 
SET payment_method = 'cash_on_delivery' 
WHERE payment_method IS NULL;

