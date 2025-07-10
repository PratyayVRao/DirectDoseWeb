-- Create table for ICR calculator data
CREATE TABLE IF NOT EXISTS icr_calculator (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS icr_calculator_user_id_idx ON icr_calculator(user_id);
