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
      automation_rules: {
        Row: {
          actions: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_conditions: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_conditions?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_conditions?: Json
          updated_at?: string | null
          user_id?: string
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
      crm_integrations: {
        Row: {
          access_token: string
          account_id: string | null
          auto_sync_enabled: boolean | null
          connected_at: string | null
          connected_by_email: string | null
          create_company: boolean | null
          create_contact: boolean | null
          create_deal: boolean | null
          create_note: boolean | null
          created_at: string | null
          field_mapping: Json | null
          id: string
          instance_url: string | null
          portal_id: string | null
          provider: Database["public"]["Enums"]["crm_provider"]
          refresh_token: string | null
          sync_on_priorities: string[] | null
          sync_on_signal_types: string[] | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          account_id?: string | null
          auto_sync_enabled?: boolean | null
          connected_at?: string | null
          connected_by_email?: string | null
          create_company?: boolean | null
          create_contact?: boolean | null
          create_deal?: boolean | null
          create_note?: boolean | null
          created_at?: string | null
          field_mapping?: Json | null
          id?: string
          instance_url?: string | null
          portal_id?: string | null
          provider: Database["public"]["Enums"]["crm_provider"]
          refresh_token?: string | null
          sync_on_priorities?: string[] | null
          sync_on_signal_types?: string[] | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string | null
          auto_sync_enabled?: boolean | null
          connected_at?: string | null
          connected_by_email?: string | null
          create_company?: boolean | null
          create_contact?: boolean | null
          create_deal?: boolean | null
          create_note?: boolean | null
          created_at?: string | null
          field_mapping?: Json | null
          id?: string
          instance_url?: string | null
          portal_id?: string | null
          provider?: Database["public"]["Enums"]["crm_provider"]
          refresh_token?: string | null
          sync_on_priorities?: string[] | null
          sync_on_signal_types?: string[] | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          crm_company_id: string | null
          crm_contact_id: string | null
          crm_deal_id: string | null
          crm_note_id: string | null
          error_code: string | null
          error_message: string | null
          id: string
          integration_id: string
          request_payload: Json | null
          response_payload: Json | null
          retry_count: number | null
          signal_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["crm_sync_status"] | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          crm_deal_id?: string | null
          crm_note_id?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          integration_id: string
          request_payload?: Json | null
          response_payload?: Json | null
          retry_count?: number | null
          signal_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["crm_sync_status"] | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          crm_deal_id?: string | null
          crm_note_id?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          retry_count?: number | null
          signal_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["crm_sync_status"] | null
          user_id?: string
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
          },
        ]
      }
      generated_emails: {
        Row: {
          body: string
          created_at: string | null
          deleted_at: string | null
          id: string
          signal_id: string
          status: string | null
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
          status?: string | null
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
          status?: string | null
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
          slack_access_token: string | null
          slack_channel_id: string | null
          slack_channel_name: string | null
          slack_enabled: boolean | null
          slack_workspace_id: string | null
          slack_workspace_name: string | null
          updated_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_period_end: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          notification_preferences?: Json | null
          slack_access_token?: string | null
          slack_channel_id?: string | null
          slack_channel_name?: string | null
          slack_enabled?: boolean | null
          slack_workspace_id?: string | null
          slack_workspace_name?: string | null
          updated_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_period_end?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          slack_access_token?: string | null
          slack_channel_id?: string | null
          slack_channel_name?: string | null
          slack_enabled?: boolean | null
          slack_workspace_id?: string | null
          slack_workspace_name?: string | null
          updated_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_period_end?: string | null
        }
        Relationships: []
      }
      scrape_runs: {
        Row: {
          ai_enriched_count: number | null
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          error_message: string | null
          estimated_duration_seconds: number | null
          id: string
          progress: Json | null
          signals_by_source: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["scrape_status"] | null
          total_signals: number | null
          user_id: string | null
        }
        Insert: {
          ai_enriched_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          estimated_duration_seconds?: number | null
          id?: string
          progress?: Json | null
          signals_by_source?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["scrape_status"] | null
          total_signals?: number | null
          user_id?: string | null
        }
        Update: {
          ai_enriched_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          estimated_duration_seconds?: number | null
          id?: string
          progress?: Json | null
          signals_by_source?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["scrape_status"] | null
          total_signals?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrape_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scraper_config: {
        Row: {
          auto_scrape_enabled: boolean | null
          created_at: string | null
          id: string
          scrape_interval_minutes: number | null
          signal_keywords: string[] | null
          source_company_newsrooms: boolean | null
          source_indeed: boolean | null
          source_linkedin: boolean | null
          source_techcrunch: boolean | null
          target_companies: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_scrape_enabled?: boolean | null
          created_at?: string | null
          id?: string
          scrape_interval_minutes?: number | null
          signal_keywords?: string[] | null
          source_company_newsrooms?: boolean | null
          source_indeed?: boolean | null
          source_linkedin?: boolean | null
          source_techcrunch?: boolean | null
          target_companies?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_scrape_enabled?: boolean | null
          created_at?: string | null
          id?: string
          scrape_interval_minutes?: number | null
          signal_keywords?: string[] | null
          source_company_newsrooms?: boolean | null
          source_indeed?: boolean | null
          source_linkedin?: boolean | null
          source_techcrunch?: boolean | null
          target_companies?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraper_config_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          tier: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          tier: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          status?: string
          tier?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      get_active_scraper_configs: {
        Args: never
        Returns: {
          signal_keywords: string[]
          sources: Json
          target_companies: string[]
          user_id: string
        }[]
      }
      get_dashboard_stats: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      crm_provider:
        | "hubspot"
        | "salesforce"
        | "pipedrive"
        | "zoho"
        | "apollo"
        | "attio"
      crm_sync_status: "pending" | "syncing" | "success" | "failed"
      scrape_status: "pending" | "running" | "completed" | "failed"
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
      crm_provider: [
        "hubspot",
        "salesforce",
        "pipedrive",
        "zoho",
        "apollo",
        "attio",
      ],
      crm_sync_status: ["pending", "syncing", "success", "failed"],
      scrape_status: ["pending", "running", "completed", "failed"],
    },
  },
} as const
