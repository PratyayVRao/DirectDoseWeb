-- Create ICR calculator table to store user progress
CREATE TABLE IF NOT EXISTS icr_calculator (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 1,
    day1_data JSONB DEFAULT NULL,
    day2_data JSONB DEFAULT NULL,
    day3_data JSONB DEFAULT NULL,
    day4_data JSONB DEFAULT NULL,
    day5_data JSONB DEFAULT NULL,
    initial_calculations JSONB DEFAULT NULL,
    final_icr DECIMAL DEFAULT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Basal calculator table to store user progress
CREATE TABLE IF NOT EXISTS basal_calculator (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 1,
    current_basal_dose DECIMAL DEFAULT NULL,
    target_range_min INTEGER DEFAULT NULL,
    target_range_max INTEGER DEFAULT NULL,
    fasting_test_data JSONB DEFAULT NULL,
    dawn_phenomenon_data JSONB DEFAULT NULL,
    overnight_test_data JSONB DEFAULT NULL,
    adjustment_history JSONB DEFAULT '[]'::jsonb,
    recommended_dose DECIMAL DEFAULT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add basal_insulin column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS basal_insulin DECIMAL DEFAULT NULL;

-- Add RLS policies for ICR calculator
ALTER TABLE icr_calculator ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ICR calculator data" ON icr_calculator
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ICR calculator data" ON icr_calculator
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ICR calculator data" ON icr_calculator
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ICR calculator data" ON icr_calculator
    FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for Basal calculator
ALTER TABLE basal_calculator ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own basal calculator data" ON basal_calculator
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own basal calculator data" ON basal_calculator
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own basal calculator data" ON basal_calculator
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own basal calculator data" ON basal_calculator
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS icr_calculator_user_id_idx ON icr_calculator(user_id);
CREATE INDEX IF NOT EXISTS basal_calculator_user_id_idx ON basal_calculator(user_id);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_icr_calculator_updated_at 
    BEFORE UPDATE ON icr_calculator 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_basal_calculator_updated_at 
    BEFORE UPDATE ON basal_calculator 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
