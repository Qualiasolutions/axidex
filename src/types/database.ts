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
      automation_rules: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          trigger_conditions: Json
          actions: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          trigger_conditions?: Json
          actions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          trigger_conditions?: Json
          actions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crm_integrations: {
        Row: {
          id: string
          user_id: string
          provider: "hubspot" | "salesforce" | "pipedrive" | "zoho" | "apollo"
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          instance_url: string | null
          portal_id: string | null
          account_id: string | null
          connected_at: string
          connected_by_email: string | null
          auto_sync_enabled: boolean
          sync_on_signal_types: string[]
          sync_on_priorities: string[]
          field_mapping: Json
          create_company: boolean
          create_contact: boolean
          create_deal: boolean
          create_note: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: "hubspot" | "salesforce" | "pipedrive" | "zoho" | "apollo"
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          instance_url?: string | null
          portal_id?: string | null
          account_id?: string | null
          connected_at?: string
          connected_by_email?: string | null
          auto_sync_enabled?: boolean
          sync_on_signal_types?: string[]
          sync_on_priorities?: string[]
          field_mapping?: Json
          create_company?: boolean
          create_contact?: boolean
          create_deal?: boolean
          create_note?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: "hubspot" | "salesforce" | "pipedrive" | "zoho" | "apollo"
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          instance_url?: string | null
          portal_id?: string | null
          account_id?: string | null
          connected_at?: string
          connected_by_email?: string | null
          auto_sync_enabled?: boolean
          sync_on_signal_types?: string[]
          sync_on_priorities?: string[]
          field_mapping?: Json
          create_company?: boolean
          create_contact?: boolean
          create_deal?: boolean
          create_note?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_sync_logs: {
        Row: {
          id: string
          integration_id: string
          signal_id: string
          user_id: string
          status: "pending" | "syncing" | "success" | "failed"
          started_at: string
          completed_at: string | null
          crm_company_id: string | null
          crm_contact_id: string | null
          crm_deal_id: string | null
          crm_note_id: string | null
          error_message: string | null
          error_code: string | null
          retry_count: number
          request_payload: Json | null
          response_payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          integration_id: string
          signal_id: string
          user_id: string
          status?: "pending" | "syncing" | "success" | "failed"
          started_at?: string
          completed_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          crm_deal_id?: string | null
          crm_note_id?: string | null
          error_message?: string | null
          error_code?: string | null
          retry_count?: number
          request_payload?: Json | null
          response_payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          integration_id?: string
          signal_id?: string
          user_id?: string
          status?: "pending" | "syncing" | "success" | "failed"
          started_at?: string
          completed_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          crm_deal_id?: string | null
          crm_note_id?: string | null
          error_message?: string | null
          error_code?: string | null
          retry_count?: number
          request_payload?: Json | null
          response_payload?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "crm_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_sync_logs_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_sync_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      generated_emails: {
        Row: {
          body: string
          created_at: string | null
          deleted_at: string | null
          id: string
          signal_id: string
          subject: string
          tone: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          signal_id: string
          subject: string
          tone: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          signal_id?: string
          subject?: string
          tone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_emails_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          notification_preferences: Json | null
          updated_at: string | null
          slack_workspace_id: string | null
          slack_workspace_name: string | null
          slack_access_token: string | null
          slack_channel_id: string | null
          slack_channel_name: string | null
          slack_enabled: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          notification_preferences?: Json | null
          updated_at?: string | null
          slack_workspace_id?: string | null
          slack_workspace_name?: string | null
          slack_access_token?: string | null
          slack_channel_id?: string | null
          slack_channel_name?: string | null
          slack_enabled?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string | null
          slack_workspace_id?: string | null
          slack_workspace_name?: string | null
          slack_access_token?: string | null
          slack_channel_id?: string | null
          slack_channel_name?: string | null
          slack_enabled?: boolean | null
        }
        Relationships: []
      }
      signals: {
        Row: {
          company_domain: string | null
          company_logo: string | null
          company_name: string
          created_at: string | null
          deleted_at: string | null
          detected_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          priority: string
          signal_type: string
          source_name: string
          source_url: string
          status: string
          summary: string
          title: string
          user_id: string
        }
        Insert: {
          company_domain?: string | null
          company_logo?: string | null
          company_name: string
          created_at?: string | null
          deleted_at?: string | null
          detected_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          priority: string
          signal_type: string
          source_name: string
          source_url: string
          status?: string
          summary: string
          title: string
          user_id: string
        }
        Update: {
          company_domain?: string | null
          company_logo?: string | null
          company_name?: string
          created_at?: string | null
          deleted_at?: string | null
          detected_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          signal_type?: string
          source_name?: string
          source_url?: string
          status?: string
          summary?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_soft_deleted_records: { Args: never; Returns: undefined }
      find_similar_signals:
        | {
            Args: {
              match_count: number
              match_threshold: number
              p_user_id: string
              query_embedding: string
            }
            Returns: {
              company_name: string
              id: string
              signal_type: string
              similarity: number
              title: string
            }[]
          }
        | {
            Args: {
              max_results?: number
              query_embedding: string
              similarity_threshold?: number
            }
            Returns: {
              id: string
              similarity: number
              title: string
            }[]
          }
      get_dashboard_stats: { Args: { p_user_id: string }; Returns: Json }
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
    Enums: {},
  },
} as const
