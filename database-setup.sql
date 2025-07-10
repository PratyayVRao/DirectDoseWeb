-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  username TEXT,
  insulin_carb_ratio NUMERIC DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create meals table if it doesn't exist
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  total_carbs NUMERIC NOT NULL,
  total_calories NUMERIC NOT NULL,
  total_insulin NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create meal_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  carbs NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  insulin NUMERIC NOT NULL,
  interpreted_display TEXT,
  weight_grams NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create ICR calculator table if it doesn't exist
CREATE TABLE IF NOT EXISTS icr_calculator (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create Basal calculator table if it doesn't exist
CREATE TABLE IF NOT EXISTS basal_calculator (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON meals(user_id);
CREATE INDEX IF NOT EXISTS meal_items_meal_id_idx ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS icr_calculator_user_id_idx ON icr_calculator(user_id);
CREATE INDEX IF NOT EXISTS basal_calculator_user_id_idx ON basal_calculator(user_id);

-- Create stored procedure to ensure ICR calculator table exists
CREATE OR REPLACE FUNCTION create_icr_calculator_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'icr_calculator') THEN
    CREATE TABLE icr_calculator (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    );
    
    CREATE INDEX icr_calculator_user_id_idx ON icr_calculator(user_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure to ensure Basal calculator table exists
CREATE OR REPLACE FUNCTION create_basal_calculator_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'basal_calculator') THEN
    CREATE TABLE basal_calculator (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    );
    
    CREATE INDEX basal_calculator_user_id_idx ON basal_calculator(user_id);
  END IF;
END;
$$ LANGUAGE plpgsql;
