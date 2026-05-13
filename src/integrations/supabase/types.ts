export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aircraft_inspections: {
        Row: {
          aircraft_tail: string
          created_at: string
          due_date: string | null
          due_hobbs: number | null
          id: string
          inspection_type: string
          interval_hours: number | null
          interval_months: number | null
          last_completed_date: string | null
          last_completed_hobbs: number | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          aircraft_tail: string
          created_at?: string
          due_date?: string | null
          due_hobbs?: number | null
          id?: string
          inspection_type: string
          interval_hours?: number | null
          interval_months?: number | null
          last_completed_date?: string | null
          last_completed_hobbs?: number | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          aircraft_tail?: string
          created_at?: string
          due_date?: string | null
          due_hobbs?: number | null
          id?: string
          inspection_type?: string
          interval_hours?: number | null
          interval_months?: number | null
          last_completed_date?: string | null
          last_completed_hobbs?: number | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      aircraft_maintenance: {
        Row: {
          aircraft_tail: string
          airworthy_status: string
          created_at: string
          current_hobbs: number | null
          current_tach: number | null
          id: string
          next_inspection_date: string | null
          next_inspection_hobbs: number | null
          notes: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aircraft_tail: string
          airworthy_status?: string
          created_at?: string
          current_hobbs?: number | null
          current_tach?: number | null
          id?: string
          next_inspection_date?: string | null
          next_inspection_hobbs?: number | null
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aircraft_tail?: string
          airworthy_status?: string
          created_at?: string
          current_hobbs?: number | null
          current_tach?: number | null
          id?: string
          next_inspection_date?: string | null
          next_inspection_hobbs?: number | null
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          pinned: boolean
          title: string
        }
        Insert: {
          audience?: string
          body: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          pinned?: boolean
          title: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          pinned?: boolean
          title?: string
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          file_path: string
          id: string
          name: string
        }
        Insert: {
          application_id: string
          created_at?: string
          file_path: string
          id?: string
          name: string
        }
        Update: {
          application_id?: string
          created_at?: string
          file_path?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          course_interest: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          internal_notes: string | null
          notes: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          course_interest?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          course_interest?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string | null
          graduated_at: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          graduated_at?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          graduated_at?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      document_types: {
        Row: {
          created_at: string
          default_validity_days: number | null
          description: string | null
          id: string
          name: string
          required: boolean
        }
        Insert: {
          created_at?: string
          default_validity_days?: number | null
          description?: string | null
          id?: string
          name: string
          required?: boolean
        }
        Update: {
          created_at?: string
          default_validity_days?: number | null
          description?: string | null
          id?: string
          name?: string
          required?: boolean
        }
        Relationships: []
      }
      flight_reservations: {
        Row: {
          aircraft_tail: string | null
          booked_by: string
          checkout_status: string | null
          created_at: string | null
          flight_area: string | null
          flight_type_id: string | null
          id: string
          instructor_id: string | null
          notes: string | null
          route: string | null
          scheduled_end: string
          scheduled_start: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          aircraft_tail?: string | null
          booked_by: string
          checkout_status?: string | null
          created_at?: string | null
          flight_area?: string | null
          flight_type_id?: string | null
          id?: string
          instructor_id?: string | null
          notes?: string | null
          route?: string | null
          scheduled_end: string
          scheduled_start: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          aircraft_tail?: string | null
          booked_by?: string
          checkout_status?: string | null
          created_at?: string | null
          flight_area?: string | null
          flight_type_id?: string | null
          id?: string
          instructor_id?: string | null
          notes?: string | null
          route?: string | null
          scheduled_end?: string
          scheduled_start?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_reservations_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_reservations_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_reservations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_sessions: {
        Row: {
          aircraft_tail: string
          checked_in_at: string | null
          checked_out_at: string
          checked_out_by: string
          course_id: string | null
          created_at: string | null
          flight_instruction: number | null
          ground_instruction: number | null
          hobbs_in: number | null
          hobbs_out: number | null
          id: string
          instructor_id: string | null
          reservation_id: string | null
          status: string
          student_id: string | null
          tach_in: number | null
          tach_out: number | null
        }
        Insert: {
          aircraft_tail: string
          checked_in_at?: string | null
          checked_out_at?: string
          checked_out_by: string
          course_id?: string | null
          created_at?: string | null
          flight_instruction?: number | null
          ground_instruction?: number | null
          hobbs_in?: number | null
          hobbs_out?: number | null
          id?: string
          instructor_id?: string | null
          reservation_id?: string | null
          status?: string
          student_id?: string | null
          tach_in?: number | null
          tach_out?: number | null
        }
        Update: {
          aircraft_tail?: string
          checked_in_at?: string | null
          checked_out_at?: string
          checked_out_by?: string
          course_id?: string | null
          created_at?: string | null
          flight_instruction?: number | null
          ground_instruction?: number | null
          hobbs_in?: number | null
          hobbs_out?: number | null
          id?: string
          instructor_id?: string | null
          reservation_id?: string | null
          status?: string
          student_id?: string | null
          tach_in?: number | null
          tach_out?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_sessions_checked_out_by_fkey"
            columns: ["checked_out_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_sessions_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "flight_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_parts: {
        Row: {
          condition: string
          created_at: string
          description: string
          expires_at: string | null
          id: string
          location: string | null
          min_quantity: number
          part_number: string
          quantity: number
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          condition?: string
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          location?: string | null
          min_quantity?: number
          part_number: string
          quantity?: number
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          condition?: string
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          location?: string | null
          min_quantity?: number
          part_number?: string
          quantity?: number
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      mechanic_time_logs: {
        Row: {
          clock_in: string
          clock_out: string | null
          created_at: string
          id: string
          notes: string | null
          task_label: string | null
          user_id: string
          work_order_id: string | null
        }
        Insert: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          task_label?: string | null
          user_id: string
          work_order_id?: string | null
        }
        Update: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          task_label?: string | null
          user_id?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mechanic_time_logs_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      member_invites: {
        Row: {
          course_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_invites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      member_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          id: string
          plan_id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          course_id: string | null
          created_at: string | null
          email: string
          enrollment_status:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          full_name: string
          id: string
          primary_instructor_id: string | null
          school_id: string | null
          secondary_instructor_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          email: string
          enrollment_status?:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          full_name: string
          id: string
          primary_instructor_id?: string | null
          school_id?: string | null
          secondary_instructor_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          email?: string
          enrollment_status?:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          full_name?: string
          id?: string
          primary_instructor_id?: string | null
          school_id?: string | null
          secondary_instructor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_primary_instructor_id_fkey"
            columns: ["primary_instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_secondary_instructor_id_fkey"
            columns: ["secondary_instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_documents: {
        Row: {
          category: string
          created_at: string
          expires_at: string | null
          file_path: string
          id: string
          name: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          expires_at?: string | null
          file_path: string
          id?: string
          name: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          expires_at?: string | null
          file_path?: string
          id?: string
          name?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          brand_color: string | null
          code: string
          created_at: string | null
          default_course_id: string | null
          default_ground_rate: number | null
          default_instructor_rate: number | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          brand_color?: string | null
          code: string
          created_at?: string | null
          default_course_id?: string | null
          default_ground_rate?: number | null
          default_instructor_rate?: number | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          brand_color?: string | null
          code?: string
          created_at?: string | null
          default_course_id?: string | null
          default_ground_rate?: number | null
          default_instructor_rate?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          interval: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          interval?: string
          name: string
          price?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          interval?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string | null
          document_type_id: string | null
          expires_at: string | null
          file_path: string
          id: string
          issued_at: string | null
          name: string
          uploaded_by: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type_id?: string | null
          expires_at?: string | null
          file_path: string
          id?: string
          issued_at?: string | null
          name: string
          uploaded_by: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type_id?: string | null
          expires_at?: string | null
          file_path?: string
          id?: string
          issued_at?: string | null
          name?: string
          uploaded_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_order_parts: {
        Row: {
          action: string
          description: string | null
          id: string
          meter_hobbs: number | null
          meter_tach: number | null
          part_number: string
          performed_at: string
          performed_by: string | null
          serial_number: string | null
          work_order_id: string
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          meter_hobbs?: number | null
          meter_tach?: number | null
          part_number: string
          performed_at?: string
          performed_by?: string | null
          serial_number?: string | null
          work_order_id: string
        }
        Update: {
          action?: string
          description?: string | null
          id?: string
          meter_hobbs?: number | null
          meter_tach?: number | null
          part_number?: string
          performed_at?: string
          performed_by?: string | null
          serial_number?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_parts_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          aircraft_tail: string
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          description: string | null
          hobbs_at_close: number | null
          hobbs_at_open: number | null
          id: string
          opened_at: string
          opened_by: string | null
          status: string
          title: string
          updated_at: string
          wo_number: string
        }
        Insert: {
          aircraft_tail: string
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          hobbs_at_close?: number | null
          hobbs_at_open?: number | null
          id?: string
          opened_at?: string
          opened_by?: string | null
          status?: string
          title: string
          updated_at?: string
          wo_number: string
        }
        Update: {
          aircraft_tail?: string
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          hobbs_at_close?: number | null
          hobbs_at_open?: number | null
          id?: string
          opened_at?: string
          opened_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          wo_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_last_times: {
        Args: { _aircraft_tail: string }
        Returns: {
          hobbs_out: number
          tach_out: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "dispatch" | "instructor" | "student" | "maintenance"
      enrollment_status: "unenrolled" | "enrolled" | "graduated"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "dispatch", "instructor", "student", "maintenance"],
      enrollment_status: ["unenrolled", "enrolled", "graduated"],
    },
  },
} as const
