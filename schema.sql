-- Add new columns to meal_items table
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS interpreted_display TEXT;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS weight_grams DECIMAL(10, 2);
