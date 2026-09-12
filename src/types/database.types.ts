export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      emission_assessments: {
        Row: {
          co2e_per_unit: number
          created_at: string
          data_label: string | null
          detailed_sources: Json
          id: string
          process_data_id: string | null
          sources: Json
          total_co2e_tonnes: number
          user_id: string
        }
        Insert: {
          co2e_per_unit?: number
          created_at?: string
          data_label?: string | null
          detailed_sources?: Json
          id?: string
          process_data_id?: string | null
          sources?: Json
          total_co2e_tonnes?: number
          user_id: string
        }
        Update: {
          co2e_per_unit?: number
          created_at?: string
          data_label?: string | null
          detailed_sources?: Json
          id?: string
          process_data_id?: string | null
          sources?: Json
          total_co2e_tonnes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emission_assessments_process_data_id_fkey"
            columns: ["process_data_id"]
            isOneToOne: false
            referencedRelation: "process_data"
            referencedColumns: ["id"]
          },
        ]
      }
      emission_factors: {
        Row: {
          category: string
          created_at: string
          factor: number
          id: string
          name: string
          region: string
          source: string | null
          unit: string
        }
        Insert: {
          category: string
          created_at?: string
          factor: number
          id?: string
          name: string
          region?: string
          source?: string | null
          unit: string
        }
        Update: {
          category?: string
          created_at?: string
          factor?: number
          id?: string
          name?: string
          region?: string
          source?: string | null
          unit?: string
        }
        Relationships: []
      }
      industry_profiles: {
        Row: {
          company_name: string
          created_at: string
          employees: number
          id: string
          industry_type: string
          location: string
          operating_days_month: number
          operating_hours_day: number
          production_capacity: number
          production_type: string | null
          production_unit: string
          size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          employees?: number
          id?: string
          industry_type?: string
          location?: string
          operating_days_month?: number
          operating_hours_day?: number
          production_capacity?: number
          production_type?: string | null
          production_unit?: string
          size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          employees?: number
          id?: string
          industry_type?: string
          location?: string
          operating_days_month?: number
          operating_hours_day?: number
          production_capacity?: number
          production_type?: string | null
          production_unit?: string
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      process_data: {
        Row: {
          created_at: string
          energy: Json
          id: string
          industry: string | null
          materials: Json
          production: Json
          updated_at: string
          user_id: string
          waste: Json
        }
        Insert: {
          created_at?: string
          energy?: Json
          id?: string
          industry?: string | null
          materials?: Json
          production?: Json
          updated_at?: string
          user_id: string
          waste?: Json
        }
        Update: {
          created_at?: string
          energy?: Json
          id?: string
          industry?: string | null
          materials?: Json
          production?: Json
          updated_at?: string
          user_id?: string
          waste?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          industry_role: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          industry_role?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          industry_role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          annual_saving_inr: number
          assessment_id: string | null
          category: string
          circularity_score: number
          cost_range_max_inr: number
          cost_range_min_inr: number
          created_at: string
          description: string | null
          estimated_co2_reduction_pct: number
          estimated_co2_reduction_tonnes: number
          feasibility_score: number
          icon: string | null
          id: string
          name: string
          payback_years: number
          rec_id: string | null
          score: number
          status: string
          updated_at: string
          user_id: string
          why: string | null
        }
        Insert: {
          annual_saving_inr?: number
          assessment_id?: string | null
          category?: string
          circularity_score?: number
          cost_range_max_inr?: number
          cost_range_min_inr?: number
          created_at?: string
          description?: string | null
          estimated_co2_reduction_pct?: number
          estimated_co2_reduction_tonnes?: number
          feasibility_score?: number
          icon?: string | null
          id?: string
          name: string
          payback_years?: number
          rec_id?: string | null
          score?: number
          status?: string
          updated_at?: string
          user_id: string
          why?: string | null
        }
        Update: {
          annual_saving_inr?: number
          assessment_id?: string | null
          category?: string
          circularity_score?: number
          cost_range_max_inr?: number
          cost_range_min_inr?: number
          created_at?: string
          description?: string | null
          estimated_co2_reduction_pct?: number
          estimated_co2_reduction_tonnes?: number
          feasibility_score?: number
          icon?: string | null
          id?: string
          name?: string
          payback_years?: number
          rec_id?: string | null
          score?: number
          status?: string
          updated_at?: string
          user_id?: string
          why?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "emission_assessments"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
