-- Migration: Add old_price column to products table
-- Run this in Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price DECIMAL(10,2) DEFAULT NULL;
