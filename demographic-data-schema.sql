-- Create demographic data table
CREATE TABLE IF NOT EXISTS user_demographics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  race VARCHAR(50),
  age_range VARCHAR(20),
  weight_range VARCHAR(20),
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_demographics_user_id_idx ON user_demographics(user_id);

-- Create meal time data table
CREATE TABLE IF NOT EXISTS meal_time_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  time_range VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS meal_time_data_meal_id_idx ON meal_time_data(meal_id);

-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create RLS policies for admin access
CREATE POLICY "Enable read access for admins only" ON user_demographics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Enable read access for admins only" ON meal_time_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create stored procedure to ensure demographic data table exists
CREATE OR REPLACE FUNCTION create_demographic_tables_if_not_exist()
RETURNS void AS $
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_demographics') THEN
    CREATE TABLE user_demographics (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      race VARCHAR(50),
      age_range VARCHAR(20),
      weight_range VARCHAR(20),
      location VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    );
    
    CREATE INDEX user_demographics_user_id_idx ON user_demographics(user_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'meal_time_data') THEN
    CREATE TABLE meal_time_data (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
      time_range VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL
    );
    
    CREATE INDEX meal_time_data_meal_id_idx ON meal_time_data(meal_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END;
$ LANGUAGE plpgsql;
