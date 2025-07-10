-- Create ICR Calculator table
CREATE TABLE IF NOT EXISTS icr_calculator (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_daily_insulin DECIMAL,
  initial_icr DECIMAL,
  target_bg DECIMAL DEFAULT 140,
  isf DECIMAL,
  day1_data JSONB,
  day2_data JSONB,
  day3_data JSONB,
  day4_data JSONB,
  day5_data JSONB,
  final_icr DECIMAL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Basal Calculator table
CREATE TABLE IF NOT EXISTS basal_calculator (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_daily_insulin TEXT,
  estimated_basal TEXT,
  current_basal_dose DECIMAL,
  test_type TEXT CHECK (test_type IN ('overnight', 'daytime')),
  symptoms_data JSONB,
  urine_glucose TEXT CHECK (urine_glucose IN ('high', 'normal', 'low')),
  urine_ketones TEXT CHECK (urine_ketones IN ('present', 'absent')),
  notes TEXT,
  adjustment_history JSONB DEFAULT '[]'::jsonb,
  recommended_adjustment INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE icr_calculator ENABLE ROW LEVEL SECURITY;
ALTER TABLE basal_calculator ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ICR Calculator
CREATE POLICY "Users can view their own ICR calculator data" ON icr_calculator
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ICR calculator data" ON icr_calculator
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ICR calculator data" ON icr_calculator
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ICR calculator data" ON icr_calculator
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for Basal Calculator
CREATE POLICY "Users can view their own basal calculator data" ON basal_calculator
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own basal calculator data" ON basal_calculator
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own basal calculator data" ON basal_calculator
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own basal calculator data" ON basal_calculator
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_icr_calculator_user_id ON icr_calculator(user_id);
CREATE INDEX IF NOT EXISTS idx_basal_calculator_user_id ON basal_calculator(user_id);
