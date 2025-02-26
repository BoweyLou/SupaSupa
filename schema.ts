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
      access_tokens: {
        Row: {
          created_at: string
          id: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      award_redemptions: {
        Row: {
          award_id: string | null
          child_id: string | null
          id: string
          redeemed_at: string | null
        }
        Insert: {
          award_id?: string | null
          child_id?: string | null
          id?: string
          redeemed_at?: string | null
        }
        Update: {
          award_id?: string | null
          child_id?: string | null
          id?: string
          redeemed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "award_redemptions_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_redemptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          allowed_children_ids: string[] | null
          awarded: boolean
          created_at: string
          description: string | null
          family_id: string | null
          id: string
          last_redeemed_at: string | null
          lockout_period: number | null
          lockout_unit: string | null
          points: number
          redemption_count: number | null
          redemption_limit: number | null
          title: string
          updated_at: string
        }
        Insert: {
          allowed_children_ids?: string[] | null
          awarded?: boolean
          created_at?: string
          description?: string | null
          family_id?: string | null
          id?: string
          last_redeemed_at?: string | null
          lockout_period?: number | null
          lockout_unit?: string | null
          points: number
          redemption_count?: number | null
          redemption_limit?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          allowed_children_ids?: string[] | null
          awarded?: boolean
          created_at?: string
          description?: string | null
          family_id?: string | null
          id?: string
          last_redeemed_at?: string | null
          lockout_period?: number | null
          lockout_unit?: string | null
          points?: number
          redemption_count?: number | null
          redemption_limit?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "awards_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["family_id"]
          },
        ]
      }
      bonus_award_instances: {
        Row: {
          assigned_child_id: string
          awarded_at: string | null
          bonus_award_id: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          assigned_child_id: string
          awarded_at?: string | null
          bonus_award_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          assigned_child_id?: string
          awarded_at?: string | null
          bonus_award_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bonus_award_instances_assigned_child_id_fkey"
            columns: ["assigned_child_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_award_instances_bonus_award_id_fkey"
            columns: ["bonus_award_id"]
            isOneToOne: false
            referencedRelation: "bonus_awards"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_awards: {
        Row: {
          assigned_child_id: string | null
          color: string | null
          created_at: string | null
          icon: string
          id: string
          points: number
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_child_id?: string | null
          color?: string | null
          created_at?: string | null
          icon: string
          id?: string
          points: number
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_child_id?: string | null
          color?: string | null
          created_at?: string | null
          icon?: string
          id?: string
          points?: number
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      claimed_awards: {
        Row: {
          award_id: string | null
          child_id: string | null
          claimed_at: string | null
          id: string
          points_deducted: number | null
        }
        Insert: {
          award_id?: string | null
          child_id?: string | null
          claimed_at?: string | null
          id?: string
          points_deducted?: number | null
        }
        Update: {
          award_id?: string | null
          child_id?: string | null
          claimed_at?: string | null
          id?: string
          points_deducted?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "claimed_awards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claimed_awards_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cli_login_sessions: {
        Row: {
          created_at: string
          device_code: string
          nonce: string | null
          public_key: string
          session_id: string
          token_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_code: string
          nonce?: string | null
          public_key: string
          session_id?: string
          token_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_code?: string
          nonce?: string | null
          public_key?: string
          session_id?: string
          token_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string
          family_id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          family_id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          family_id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          date_created: string
          id: number
          metadata: Json | null
          page: string
          vote: Database["public"]["Enums"]["feedback_vote"]
        }
        Insert: {
          date_created?: string
          id?: never
          metadata?: Json | null
          page: string
          vote: Database["public"]["Enums"]["feedback_vote"]
        }
        Update: {
          date_created?: string
          id?: never
          metadata?: Json | null
          page?: string
          vote?: Database["public"]["Enums"]["feedback_vote"]
        }
        Relationships: []
      }
      last_changed: {
        Row: {
          checksum: string
          heading: string
          id: number
          last_checked: string
          last_updated: string
          parent_page: string
        }
        Insert: {
          checksum: string
          heading: string
          id?: never
          last_checked?: string
          last_updated?: string
          parent_page: string
        }
        Update: {
          checksum?: string
          heading?: string
          id?: never
          last_checked?: string
          last_updated?: string
          parent_page?: string
        }
        Relationships: []
      }
      launch_weeks: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id: string
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
        }
        Relationships: []
      }
      meetups: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          display_info: string | null
          id: string
          is_live: boolean
          is_published: boolean
          launch_week: string
          link: string | null
          start_at: string | null
          timezone: string | null
          title: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          display_info?: string | null
          id?: string
          is_live?: boolean
          is_published?: boolean
          launch_week: string
          link?: string | null
          start_at?: string | null
          timezone?: string | null
          title?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          display_info?: string | null
          id?: string
          is_live?: boolean
          is_published?: boolean
          launch_week?: string
          link?: string | null
          start_at?: string | null
          timezone?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetups_launch_week_fkey"
            columns: ["launch_week"]
            isOneToOne: false
            referencedRelation: "launch_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      page: {
        Row: {
          checksum: string | null
          content: string | null
          fts_tokens: unknown | null
          id: number
          last_refresh: string | null
          meta: Json | null
          path: string
          source: string | null
          title_tokens: unknown | null
          type: string | null
          version: string | null
        }
        Insert: {
          checksum?: string | null
          content?: string | null
          fts_tokens?: unknown | null
          id?: number
          last_refresh?: string | null
          meta?: Json | null
          path: string
          source?: string | null
          title_tokens?: unknown | null
          type?: string | null
          version?: string | null
        }
        Update: {
          checksum?: string | null
          content?: string | null
          fts_tokens?: unknown | null
          id?: number
          last_refresh?: string | null
          meta?: Json | null
          path?: string
          source?: string | null
          title_tokens?: unknown | null
          type?: string | null
          version?: string | null
        }
        Relationships: []
      }
      page_section: {
        Row: {
          content: string | null
          embedding: string | null
          heading: string | null
          id: number
          page_id: number
          rag_ignore: boolean | null
          slug: string | null
          token_count: number | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id: number
          rag_ignore?: boolean | null
          slug?: string | null
          token_count?: number | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id?: number
          rag_ignore?: boolean | null
          slug?: string | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "page_section_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "page"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_child_id: string | null
          created_at: string
          created_by: string
          description: string | null
          frequency: string
          id: string
          next_occurrence: string | null
          reward_points: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_child_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          frequency: string
          id?: string
          next_occurrence?: string | null
          reward_points?: number
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_child_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          frequency?: string
          id?: string
          next_occurrence?: string | null
          reward_points?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assigned_child"
            columns: ["assigned_child_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_settings: {
        Row: {
          created_at: string | null
          custom_theme: Json | null
          family_id: string
          id: string
          theme_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_theme?: Json | null
          family_id: string
          id?: string
          theme_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_theme?: Json | null
          family_id?: string
          id?: string
          theme_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "theme_settings_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: true
            referencedRelation: "families"
            referencedColumns: ["family_id"]
          },
        ]
      }
      tickets: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          game_won_at: string | null
          id: string
          launch_week: string
          location: string | null
          metadata: Json | null
          name: string | null
          referred_by: string | null
          role: string | null
          shared_on_linkedin: string | null
          shared_on_twitter: string | null
          ticket_number: number
          user_id: string
          username: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          game_won_at?: string | null
          id?: string
          launch_week: string
          location?: string | null
          metadata?: Json | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          shared_on_linkedin?: string | null
          shared_on_twitter?: string | null
          ticket_number?: number
          user_id: string
          username?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          game_won_at?: string | null
          id?: string
          launch_week?: string
          location?: string | null
          metadata?: Json | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          shared_on_linkedin?: string | null
          shared_on_twitter?: string | null
          ticket_number?: number
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_launch_week_fkey"
            columns: ["launch_week"]
            isOneToOne: false
            referencedRelation: "launch_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      troubleshooting_entries: {
        Row: {
          api: Json | null
          checksum: string
          date_created: string
          date_updated: string
          errors: Json[] | null
          github_id: string
          github_url: string
          id: string
          keywords: string[] | null
          title: string
          topics: string[]
        }
        Insert: {
          api?: Json | null
          checksum: string
          date_created?: string
          date_updated?: string
          errors?: Json[] | null
          github_id: string
          github_url: string
          id?: string
          keywords?: string[] | null
          title: string
          topics: string[]
        }
        Update: {
          api?: Json | null
          checksum?: string
          date_created?: string
          date_updated?: string
          errors?: Json[] | null
          github_id?: string
          github_url?: string
          id?: string
          keywords?: string[] | null
          title?: string
          topics?: string[]
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          family_id: string | null
          id: string
          name: string
          points: number
          role: string
          updated_at: string
          user_metadata: Json | null
        }
        Insert: {
          created_at?: string
          family_id?: string | null
          id?: string
          name: string
          points?: number
          role: string
          updated_at?: string
          user_metadata?: Json | null
        }
        Update: {
          created_at?: string
          family_id?: string | null
          id?: string
          name?: string
          points?: number
          role?: string
          updated_at?: string
          user_metadata?: Json | null
        }
        Relationships: []
      }
      validation_history: {
        Row: {
          created_at: string
          id: number
          tag: string
        }
        Insert: {
          created_at?: string
          id?: never
          tag: string
        }
        Update: {
          created_at?: string
          id?: never
          tag?: string
        }
        Relationships: []
      }
    }
    Views: {
      tickets_view: {
        Row: {
          company: string | null
          created_at: string | null
          id: string | null
          launch_week: string | null
          location: string | null
          metadata: Json | null
          name: string | null
          platinum: boolean | null
          referrals: number | null
          role: string | null
          secret: boolean | null
          shared_on_linkedin: string | null
          shared_on_twitter: string | null
          ticket_number: number | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_launch_week_fkey"
            columns: ["launch_week"]
            isOneToOne: false
            referencedRelation: "launch_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      claim_award_transaction: {
        Args: {
          p_award_id: string
          p_child_id: string
          p_points: number
        }
        Returns: boolean
      }
      cleanup_last_changed_pages: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      deduct_points: {
        Args: {
          child_uuid: string
          deduction: number
        }
        Returns: {
          created_at: string
          family_id: string | null
          id: string
          name: string
          points: number
          role: string
          updated_at: string
          user_metadata: Json | null
        }[]
      }
      docs_search_embeddings: {
        Args: {
          embedding: string
          match_threshold: number
        }
        Returns: {
          id: number
          path: string
          type: string
          title: string
          subtitle: string
          description: string
          headings: string[]
          slugs: string[]
        }[]
      }
      docs_search_fts: {
        Args: {
          query: string
        }
        Returns: {
          id: number
          path: string
          type: string
          title: string
          subtitle: string
          description: string
        }[]
      }
      get_last_revalidation_for_tags: {
        Args: {
          tags: string[]
        }
        Returns: {
          tag: string
          created_at: string
        }[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ipv6_active_status: {
        Args: {
          project_ref: string
        }
        Returns: {
          pgbouncer_active: boolean
          vercel_active: boolean
        }[]
      }
      is_award_available_for_child: {
        Args: {
          p_award_id: string
          p_child_id: string
        }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      json_matches_schema: {
        Args: {
          schema: Json
          instance: Json
        }
        Returns: boolean
      }
      jsonb_matches_schema: {
        Args: {
          schema: Json
          instance: Json
        }
        Returns: boolean
      }
      jsonschema_is_valid: {
        Args: {
          schema: Json
        }
        Returns: boolean
      }
      jsonschema_validation_errors: {
        Args: {
          schema: Json
          instance: Json
        }
        Returns: string[]
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_page_sections_v2: {
        Args: {
          embedding: string
          match_threshold: number
          min_content_length: number
        }
        Returns: {
          content: string | null
          embedding: string | null
          heading: string | null
          id: number
          page_id: number
          rag_ignore: boolean | null
          slug: string | null
          token_count: number | null
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      update_last_changed_checksum: {
        Args: {
          new_parent_page: string
          new_heading: string
          new_checksum: string
          git_update_time: string
          check_time: string
        }
        Returns: string
      }
      validate_troubleshooting_errors: {
        Args: {
          errors: Json[]
        }
        Returns: boolean
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      feedback_vote: "yes" | "no"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
