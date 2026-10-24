// Generated from the database schema (supabase gen types typescript). Do not
// edit by hand: run `npm run db:types` after every migration.

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          input_hash: string
          job_type: string
          model: string | null
          output: Json | null
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          input_hash: string
          job_type: string
          model?: string | null
          output?: Json | null
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          input_hash?: string
          job_type?: string
          model?: string | null
          output?: Json | null
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      assistant_usage: {
        Row: {
          created_at: string
          question_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          question_count?: number
          updated_at?: string
          usage_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          question_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          created_at: string
          details: Json
          entity: string
          entity_id: string
          id: string
          reason: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: string
          created_at?: string
          details?: Json
          entity: string
          entity_id: string
          id?: string
          reason?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          code: string
          created_at: string
          description_en: string | null
          description_id: string | null
          id: string
          name_en: string
          name_id: string
          rule_key: string
        }
        Insert: {
          code: string
          created_at?: string
          description_en?: string | null
          description_id?: string | null
          id?: string
          name_en: string
          name_id: string
          rule_key: string
        }
        Update: {
          code?: string
          created_at?: string
          description_en?: string | null
          description_id?: string | null
          id?: string
          name_en?: string
          name_id?: string
          rule_key?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ceremonies: {
        Row: {
          body_en: string | null
          body_id: string | null
          created_at: string
          created_by: string | null
          id: string
          name_en: string | null
          name_id: string
          region_id: string | null
          review_status: string
          slug: string
          summary_en: string | null
          summary_id: string | null
          timing_en: string | null
          timing_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body_en?: string | null
          body_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name_en?: string | null
          name_id: string
          region_id?: string | null
          review_status?: string
          slug: string
          summary_en?: string | null
          summary_id?: string | null
          timing_en?: string | null
          timing_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body_en?: string | null
          body_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name_en?: string | null
          name_id?: string
          region_id?: string | null
          review_status?: string
          slug?: string
          summary_en?: string | null
          summary_id?: string | null
          timing_en?: string | null
          timing_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ceremonies_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_media: {
        Row: {
          alt_en: string
          alt_id: string
          content_id: string
          content_type: string
          created_at: string
          created_by: string | null
          credit: string
          id: string
          kind: string
          licence: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_en: string
          alt_id: string
          content_id: string
          content_type: string
          created_at?: string
          created_by?: string | null
          credit: string
          id?: string
          kind?: string
          licence: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_en?: string
          alt_id?: string
          content_id?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          credit?: string
          id?: string
          kind?: string
          licence?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      content_sources: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          source_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          source_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      costumes: {
        Row: {
          anchor_points: Json
          created_at: string
          created_by: string | null
          id: string
          info_en: string | null
          info_id: string | null
          layers: Json
          name_en: string | null
          name_id: string
          reference_image_url: string | null
          region_id: string | null
          review_status: string
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          anchor_points?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          info_en?: string | null
          info_id?: string | null
          layers?: Json
          name_en?: string | null
          name_id: string
          reference_image_url?: string | null
          region_id?: string | null
          review_status?: string
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          anchor_points?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          info_en?: string | null
          info_id?: string | null
          layers?: Json
          name_en?: string | null
          name_id?: string
          reference_image_url?: string | null
          region_id?: string | null
          review_status?: string
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "costumes_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nickname_set: boolean
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          nickname_set?: boolean
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          nickname_set?: boolean
          username?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          name_en: string | null
          name_id: string
          position: number
          recipe_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          name_en?: string | null
          name_id: string
          position: number
          recipe_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          name_en?: string | null
          name_id?: string
          position?: number
          recipe_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          step_no: number
          text_en: string | null
          text_id: string | null
          timer_seconds: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          step_no: number
          text_en?: string | null
          text_id?: string | null
          timer_seconds?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          step_no?: number
          text_en?: string | null
          text_id?: string | null
          timer_seconds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          created_by: string | null
          dietary_tags: string[]
          halal_status: string
          id: string
          minutes: number | null
          name_en: string | null
          name_id: string
          region_id: string | null
          review_status: string
          servings: number | null
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dietary_tags?: string[]
          halal_status?: string
          id?: string
          minutes?: number | null
          name_en?: string | null
          name_id: string
          region_id?: string | null
          review_status?: string
          servings?: number | null
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dietary_tags?: string[]
          halal_status?: string
          id?: string
          minutes?: number | null
          name_en?: string | null
          name_id?: string
          region_id?: string | null
          review_status?: string
          servings?: number | null
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name_en: string | null
          name_id: string
          province_codes: string[]
          review_status: string
          slug: string
          sort_order: number
          summary_en: string | null
          summary_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name_en?: string | null
          name_id: string
          province_codes?: string[]
          review_status?: string
          slug: string
          sort_order?: number
          summary_en?: string | null
          summary_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name_en?: string | null
          name_id?: string
          province_codes?: string[]
          review_status?: string
          slug?: string
          sort_order?: number
          summary_en?: string | null
          summary_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string
          created_by: string | null
          credit: string | null
          id: string
          license: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credit?: string | null
          id?: string
          license?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credit?: string | null
          id?: string
          license?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          region_id: string | null
          review_status: string
          slug: string
          summary_en: string | null
          summary_id: string | null
          title_en: string | null
          title_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          region_id?: string | null
          review_status?: string
          slug: string
          summary_en?: string | null
          summary_id?: string | null
          title_en?: string | null
          title_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          region_id?: string | null
          review_status?: string
          slug?: string
          summary_en?: string | null
          summary_id?: string | null
          title_en?: string | null
          title_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      story_requests: {
        Row: {
          created_at: string
          id: string
          note: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      story_chapters: {
        Row: {
          audio_description_en: string | null
          audio_description_id: string | null
          audio_hash: string | null
          audio_url: string | null
          chapter_no: number
          created_at: string
          created_by: string | null
          id: string
          image_alt_en: string | null
          image_alt_id: string | null
          image_url: string | null
          review_status: string
          story_id: string
          text_en: string | null
          text_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audio_description_en?: string | null
          audio_description_id?: string | null
          audio_hash?: string | null
          audio_url?: string | null
          chapter_no: number
          created_at?: string
          created_by?: string | null
          id?: string
          image_alt_en?: string | null
          image_alt_id?: string | null
          image_url?: string | null
          review_status?: string
          story_id: string
          text_en?: string | null
          text_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audio_description_en?: string | null
          audio_description_id?: string | null
          audio_hash?: string | null
          audio_url?: string | null
          chapter_no?: number
          created_at?: string
          created_by?: string | null
          id?: string
          image_alt_en?: string | null
          image_alt_id?: string | null
          image_url?: string | null
          review_status?: string
          story_id?: string
          text_en?: string | null
          text_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_chapters_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          created_at: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string
          id: string
          last_chapter_no: number
          story_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_chapter_no?: number
          story_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_chapter_no?: number
          story_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assistant_quota: {
        Args: never
        Returns: {
          daily_limit: number
          remaining: number
          used: number
        }[]
      }
      consume_assistant_question: {
        Args: never
        Returns: {
          allowed: boolean
          daily_limit: number
          remaining: number
        }[]
      }
      review_content: {
        Args: {
          p_action: string
          p_entity: string
          p_id: string
          p_reason?: string
        }
        Returns: string
      }
      story_requests_list: {
        Args: { p_limit?: number }
        Returns: {
          created_at: string
          id: string
          nickname: string
          note: string
          status: string
          title: string
        }[]
      }
      search_content: {
        Args: { p_limit?: number; p_locale?: string; p_query: string }
        Returns: {
          content_type: string
          id: string
          rank: number
          region_name: string
          region_slug: string
          slug: string
          summary: string
          title: string
        }[]
      }
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
