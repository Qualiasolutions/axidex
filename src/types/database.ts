export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          company_name: string | null
          notification_preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      signals: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_domain: string | null
          company_logo: string | null
          signal_type: 'hiring' | 'funding' | 'expansion' | 'partnership' | 'product_launch' | 'leadership_change'
          title: string
          summary: string
          source_url: string
          source_name: string
          priority: 'high' | 'medium' | 'low'
          status: 'new' | 'reviewed' | 'contacted' | 'converted' | 'dismissed'
          detected_at: string
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_domain?: string | null
          company_logo?: string | null
          signal_type: 'hiring' | 'funding' | 'expansion' | 'partnership' | 'product_launch' | 'leadership_change'
          title: string
          summary: string
          source_url: string
          source_name: string
          priority: 'high' | 'medium' | 'low'
          status?: 'new' | 'reviewed' | 'contacted' | 'converted' | 'dismissed'
          detected_at?: string
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          company_domain?: string | null
          company_logo?: string | null
          signal_type?: 'hiring' | 'funding' | 'expansion' | 'partnership' | 'product_launch' | 'leadership_change'
          title?: string
          summary?: string
          source_url?: string
          source_name?: string
          priority?: 'high' | 'medium' | 'low'
          status?: 'new' | 'reviewed' | 'contacted' | 'converted' | 'dismissed'
          detected_at?: string
          created_at?: string
          metadata?: Json
        }
      }
      generated_emails: {
        Row: {
          id: string
          signal_id: string
          user_id: string
          subject: string
          body: string
          tone: 'professional' | 'casual' | 'enthusiastic'
          created_at: string
        }
        Insert: {
          id?: string
          signal_id: string
          user_id: string
          subject: string
          body: string
          tone: 'professional' | 'casual' | 'enthusiastic'
          created_at?: string
        }
        Update: {
          id?: string
          signal_id?: string
          user_id?: string
          subject?: string
          body?: string
          tone?: 'professional' | 'casual' | 'enthusiastic'
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
