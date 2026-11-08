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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_questions: {
        Row: {
          id: number
          option_a: string
          option_b: string
          question: string
        }
        Insert: {
          id: number
          option_a: string
          option_b: string
          question: string
        }
        Update: {
          id?: number
          option_a?: string
          option_b?: string
          question?: string
        }
        Relationships: []
      }
      balance_votes: {
        Row: {
          choice: string
          created_at: string
          question_id: number
          user_id: string
        }
        Insert: {
          choice: string
          created_at?: string
          question_id: number
          user_id: string
        }
        Update: {
          choice?: string
          created_at?: string
          question_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_votes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "balance_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banned_words: {
        Row: {
          created_at: string
          severity: number
          word: string
        }
        Insert: {
          created_at?: string
          severity?: number
          word: string
        }
        Update: {
          created_at?: string
          severity?: number
          word?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_dept: string | null
          blocked_id: string
          blocked_name: string | null
          blocker_id: string
          created_at: string
          room_id: string | null
        }
        Insert: {
          blocked_dept?: string | null
          blocked_id: string
          blocked_name?: string | null
          blocker_id: string
          created_at?: string
          room_id?: string | null
        }
        Update: {
          blocked_dept?: string | null
          blocked_id?: string
          blocked_name?: string | null
          blocker_id?: string
          created_at?: string
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "my_matches"
            referencedColumns: ["room_id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          close_reason: string | null
          closed_at: string | null
          created_at: string
          id: string
          match_id: string
        }
        Insert: {
          close_reason?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          match_id: string
        }
        Update: {
          close_reason?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          match_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "my_matches"
            referencedColumns: ["match_id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          from_team_id: string
          id: string
          plan_date: string | null
          plan_place: string | null
          plan_time: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          to_team_id: string
        }
        Insert: {
          created_at?: string
          from_team_id: string
          id?: string
          plan_date?: string | null
          plan_place?: string | null
          plan_time?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          to_team_id: string
        }
        Update: {
          created_at?: string
          from_team_id?: string
          id?: string
          plan_date?: string | null
          plan_place?: string | null
          plan_time?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          to_team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_from_team_id_fkey"
            columns: ["from_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_to_team_id_fkey"
            columns: ["to_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          filter_note: string | null
          id: string
          is_filtered: boolean
          kind: Database["public"]["Enums"]["message_kind"]
          proposal_result: string | null
          room_id: string
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          filter_note?: string | null
          id?: string
          is_filtered?: boolean
          kind?: Database["public"]["Enums"]["message_kind"]
          proposal_result?: string | null
          room_id: string
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          filter_note?: string | null
          id?: string
          is_filtered?: boolean
          kind?: Database["public"]["Enums"]["message_kind"]
          proposal_result?: string | null
          room_id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "my_matches"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_mutes: {
        Row: {
          created_at: string
          kind: Database["public"]["Enums"]["notification_kind"]
          user_id: string
        }
        Insert: {
          created_at?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          user_id: string
        }
        Update: {
          created_at?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_mutes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          match_id: string | null
          read_at: string | null
          room_id: string | null
          team_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          match_id?: string | null
          read_at?: string | null
          room_id?: string | null
          team_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          match_id?: string | null
          read_at?: string | null
          room_id?: string | null
          team_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "my_matches"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "notifications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "my_matches"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "notifications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_idx: number
          bio: string | null
          birth_year: number | null
          campus: Database["public"]["Enums"]["campus_t"]
          created_at: string
          deleted_at: string | null
          dept: string
          email: string
          email_verified_at: string | null
          gender: Database["public"]["Enums"]["gender_t"]
          id: string
          login_id: string
          mbti: string | null
          name: string
          nickname: string | null
          status: Database["public"]["Enums"]["account_status"]
          strike_count: number
          suspended_until: string | null
          updated_at: string
        }
        Insert: {
          avatar_idx?: number
          bio?: string | null
          birth_year?: number | null
          campus: Database["public"]["Enums"]["campus_t"]
          created_at?: string
          deleted_at?: string | null
          dept: string
          email: string
          email_verified_at?: string | null
          gender: Database["public"]["Enums"]["gender_t"]
          id: string
          login_id: string
          mbti?: string | null
          name: string
          nickname?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          strike_count?: number
          suspended_until?: string | null
          updated_at?: string
        }
        Update: {
          avatar_idx?: number
          bio?: string | null
          birth_year?: number | null
          campus?: Database["public"]["Enums"]["campus_t"]
          created_at?: string
          deleted_at?: string | null
          dept?: string
          email?: string
          email_verified_at?: string | null
          gender?: Database["public"]["Enums"]["gender_t"]
          id?: string
          login_id?: string
          mbti?: string | null
          name?: string
          nickname?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          strike_count?: number
          suspended_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          last_seen_at: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          last_seen_at?: string
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          last_seen_at?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          action_taken: string | null
          created_at: string
          detail: string | null
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
          target_user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
          target_user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "my_matches"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "reports_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          is_owner: boolean
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          is_owner?: boolean
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          is_owner?: boolean
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          avg_age: number | null
          campus: Database["public"]["Enums"]["campus_t"]
          capacity: number
          content: string
          created_at: string
          dept: string
          filled_count: number
          gender: Database["public"]["Enums"]["gender_t"]
          id: string
          invite_code: string | null
          owner_id: string
          status: Database["public"]["Enums"]["team_status"]
          tags: string[]
          title: string
        }
        Insert: {
          avg_age?: number | null
          campus: Database["public"]["Enums"]["campus_t"]
          capacity: number
          content: string
          created_at?: string
          dept: string
          filled_count?: number
          gender: Database["public"]["Enums"]["gender_t"]
          id?: string
          invite_code?: string | null
          owner_id: string
          status?: Database["public"]["Enums"]["team_status"]
          tags?: string[]
          title: string
        }
        Update: {
          avg_age?: number | null
          campus?: Database["public"]["Enums"]["campus_t"]
          capacity?: number
          content?: string
          created_at?: string
          dept?: string
          filled_count?: number
          gender?: Database["public"]["Enums"]["gender_t"]
          id?: string
          invite_code?: string | null
          owner_id?: string
          status?: Database["public"]["Enums"]["team_status"]
          tags?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      my_matches: {
        Row: {
          closed_at: string | null
          match_id: string | null
          my_team_id: string | null
          partner_team_count: number | null
          partner_team_dept: string | null
          partner_team_id: string | null
          partner_team_name: string | null
          plan_date: string | null
          plan_place: string | null
          plan_time: string | null
          room_id: string | null
          started_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      balance_game_today: {
        Args: never
        Returns: Database["public"]["CompositeTypes"]["balance_game_result"][]
        SetofOptions: {
          from: "*"
          to: "balance_game_result"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      balance_today_id: { Args: never; Returns: number }
      broadcast_notice: {
        Args: { p_body: string; p_title: string }
        Returns: number
      }
      check_login_id_available: {
        Args: { p_login_id: string }
        Returns: boolean
      }
      delete_push_token: { Args: { p_token: string }; Returns: undefined }
      gen_invite_code: { Args: never; Returns: string }
      is_account_active: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_blocked_with: { Args: { p_user_id: string }; Returns: boolean }
      is_blocked_with_team: { Args: { p_team_id: string }; Returns: boolean }
      is_listed_team: { Args: { p_team_id: string }; Returns: boolean }
      is_match_counterpart_team: {
        Args: { p_team_id: string }
        Returns: boolean
      }
      is_matched_with_team: { Args: { p_team_id: string }; Returns: boolean }
      is_room_open: { Args: { p_room_id: string }; Returns: boolean }
      is_room_participant: { Args: { p_room_id: string }; Returns: boolean }
      is_team_member: { Args: { p_team_id: string }; Returns: boolean }
      is_team_owner: { Args: { p_team_id: string }; Returns: boolean }
      join_team_by_code: { Args: { p_code: string }; Returns: string }
      korean_age: { Args: { p_birth_year: number }; Returns: number }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_notification_read: { Args: { p_id: string }; Returns: undefined }
      notification_enabled: {
        Args: {
          p_kind: Database["public"]["Enums"]["notification_kind"]
          p_user_id: string
        }
        Returns: boolean
      }
      notify_team: {
        Args: {
          p_body: string
          p_except_user?: string
          p_kind: Database["public"]["Enums"]["notification_kind"]
          p_match_id?: string
          p_room_id?: string
          p_team_id: string
          p_title: string
        }
        Returns: undefined
      }
      notify_user: {
        Args: {
          p_body: string
          p_kind: Database["public"]["Enums"]["notification_kind"]
          p_match_id?: string
          p_room_id?: string
          p_team_id?: string
          p_title: string
          p_user_id: string
        }
        Returns: undefined
      }
      post_exit_proposal: { Args: { p_room_id: string }; Returns: string }
      post_system_message: {
        Args: { p_room_id: string; p_text: string }
        Returns: string
      }
      purge_old_notifications: { Args: never; Returns: number }
      resolve_exit_proposal: {
        Args: { p_message_id: string; p_result: string }
        Returns: undefined
      }
      save_push_token: {
        Args: { p_platform: string; p_token: string }
        Returns: undefined
      }
      send_chat_message: {
        Args: {
          p_content: string
          p_filter_note?: string
          p_is_filtered?: boolean
          p_message_id?: string
          p_room_id: string
          p_sender_id: string
        }
        Returns: {
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          filter_note: string | null
          id: string
          is_filtered: boolean
          kind: Database["public"]["Enums"]["message_kind"]
          proposal_result: string | null
          room_id: string
          sender_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_match_plan: {
        Args: {
          p_date: string
          p_match_id: string
          p_place: string
          p_time: string
        }
        Returns: undefined
      }
      set_notification_mutes: {
        Args: {
          p_kinds: Database["public"]["Enums"]["notification_kind"][]
          p_muted: boolean
        }
        Returns: undefined
      }
      tags_are_bounded: { Args: { p_tags: string[] }; Returns: boolean }
      vote_balance_game: {
        Args: { p_choice: string; p_question_id: number }
        Returns: Database["public"]["CompositeTypes"]["balance_game_result"][]
        SetofOptions: {
          from: "*"
          to: "balance_game_result"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      account_status: "active" | "warned" | "suspended" | "deleted"
      campus_t: "죽전" | "천안"
      gender_t: "M" | "F"
      match_status: "WAITING" | "ACCEPTED" | "REJECTED"
      message_kind: "user" | "system" | "proposal"
      notification_kind:
        | "MATCH_REQUEST"
        | "MATCH_ACCEPTED"
        | "MATCH_REJECTED"
        | "MATCH_CANCELED"
        | "TEAM_JOINED"
        | "TEAM_READY"
        | "PLAN_SET"
        | "NOTICE"
      report_reason: "ABUSE" | "SEXUAL" | "SPAM" | "FRAUD" | "NO_SHOW" | "ETC"
      report_status: "pending" | "resolved" | "dismissed"
      report_target: "USER" | "ROOM"
      team_status: "RECRUITING" | "READY" | "ACTIVE" | "MATCHED"
    }
    CompositeTypes: {
      balance_game_result: {
        question_id: number | null
        question: string | null
        option_a: string | null
        option_b: string | null
        votes_a: number | null
        votes_b: number | null
        my_choice: string | null
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["active", "warned", "suspended", "deleted"],
      campus_t: ["죽전", "천안"],
      gender_t: ["M", "F"],
      match_status: ["WAITING", "ACCEPTED", "REJECTED"],
      message_kind: ["user", "system", "proposal"],
      notification_kind: [
        "MATCH_REQUEST",
        "MATCH_ACCEPTED",
        "MATCH_REJECTED",
        "MATCH_CANCELED",
        "TEAM_JOINED",
        "TEAM_READY",
        "PLAN_SET",
        "NOTICE",
      ],
      report_reason: ["ABUSE", "SEXUAL", "SPAM", "FRAUD", "NO_SHOW", "ETC"],
      report_status: ["pending", "resolved", "dismissed"],
      report_target: ["USER", "ROOM"],
      team_status: ["RECRUITING", "READY", "ACTIVE", "MATCHED"],
    },
  },
} as const
