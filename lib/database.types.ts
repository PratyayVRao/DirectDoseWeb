export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string
          insulin_carb_ratio: number
          created_at: string
          updated_at: string
          is_admin?: boolean
        }
        Insert: {
          id: string
          username?: string | null
          email: string
          insulin_carb_ratio?: number
          created_at: string
          updated_at: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          username?: string | null
          email?: string
          insulin_carb_ratio?: number
          created_at?: string
          updated_at?: string
          is_admin?: boolean
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          meal_name: string
          total_carbs: number
          total_calories: number
          total_insulin: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_name: string
          total_carbs: number
          total_calories: number
          total_insulin: number
          created_at: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_name?: string
          total_carbs?: number
          total_calories?: number
          total_insulin?: number
          created_at?: string
        }
      }
      meal_items: {
        Row: {
          id: string
          meal_id: string
          food_name: string
          carbs: number
          calories: number
          insulin: number
          interpreted_display?: string
          weight_grams?: number
          created_at: string
        }
        Insert: {
          id?: string
          meal_id: string
          food_name: string
          carbs: number
          calories: number
          insulin: number
          interpreted_display?: string
          weight_grams?: number
          created_at: string
        }
        Update: {
          id?: string
          meal_id?: string
          food_name?: string
          carbs?: number
          calories?: number
          insulin?: number
          interpreted_display?: string
          weight_grams?: number
          created_at?: string
        }
      }
      icr_calculator: {
        Row: {
          id: string
          user_id: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: Json
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      basal_calculator: {
        Row: {
          id: string
          user_id: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: Json
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_demographics: {
        Row: {
          id: string
          user_id: string
          race: string | null
          age_range: string | null
          weight_range: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          race?: string | null
          age_range?: string | null
          weight_range?: string | null
          location?: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          user_id?: string
          race?: string | null
          age_range?: string | null
          weight_range?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meal_time_data: {
        Row: {
          id: string
          meal_id: string
          time_range: string | null
          created_at: string
        }
        Insert: {
          id?: string
          meal_id: string
          time_range?: string | null
          created_at: string
        }
        Update: {
          id?: string
          meal_id?: string
          time_range?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
