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
      batting_order: {
        Row: {
          created_at: string | null
          id: string
          innings_id: string
          player_id: string
          position: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          innings_id: string
          player_id: string
          position: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          innings_id?: string
          player_id?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batting_order_innings_id_fkey"
            columns: ["innings_id"]
            isOneToOne: false
            referencedRelation: "innings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batting_order_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      batting_partnerships: {
        Row: {
          created_at: string | null
          id: string
          innings_number: number
          match_id: string
          non_striker_id: string | null
          striker_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          innings_number: number
          match_id: string
          non_striker_id?: string | null
          striker_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          innings_number?: number
          match_id?: string
          non_striker_id?: string | null
          striker_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batting_partnerships_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      batting_stats: {
        Row: {
          balls_faced: number | null
          created_at: string | null
          fours: number | null
          id: string
          player_id: string
          runs: number | null
          sixes: number | null
          updated_at: string | null
        }
        Insert: {
          balls_faced?: number | null
          created_at?: string | null
          fours?: number | null
          id?: string
          player_id: string
          runs?: number | null
          sixes?: number | null
          updated_at?: string | null
        }
        Update: {
          balls_faced?: number | null
          created_at?: string | null
          fours?: number | null
          id?: string
          player_id?: string
          runs?: number | null
          sixes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batting_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      bowling_stats: {
        Row: {
          created_at: string | null
          id: string
          maidens: number | null
          overs: number | null
          player_id: string
          runs: number | null
          updated_at: string | null
          wickets: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          maidens?: number | null
          overs?: number | null
          player_id: string
          runs?: number | null
          updated_at?: string | null
          wickets?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          maidens?: number | null
          overs?: number | null
          player_id?: string
          runs?: number | null
          updated_at?: string | null
          wickets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bowling_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      innings: {
        Row: {
          created_at: string | null
          extras: number | null
          id: string
          innings_number: number
          match_id: string
          overs: number | null
          runs: number | null
          team_id: string
          updated_at: string | null
          wickets: number | null
        }
        Insert: {
          created_at?: string | null
          extras?: number | null
          id?: string
          innings_number: number
          match_id: string
          overs?: number | null
          runs?: number | null
          team_id: string
          updated_at?: string | null
          wickets?: number | null
        }
        Update: {
          created_at?: string | null
          extras?: number | null
          id?: string
          innings_number?: number
          match_id?: string
          overs?: number | null
          runs?: number | null
          team_id?: string
          updated_at?: string | null
          wickets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "innings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_batting_stats: {
        Row: {
          balls_faced: number
          created_at: string | null
          fours: number
          id: string
          innings_number: number
          is_out: boolean
          match_id: string
          player_id: string
          runs: number
          sixes: number
          updated_at: string | null
        }
        Insert: {
          balls_faced?: number
          created_at?: string | null
          fours?: number
          id?: string
          innings_number: number
          is_out?: boolean
          match_id: string
          player_id: string
          runs?: number
          sixes?: number
          updated_at?: string | null
        }
        Update: {
          balls_faced?: number
          created_at?: string | null
          fours?: number
          id?: string
          innings_number?: number
          is_out?: boolean
          match_id?: string
          player_id?: string
          runs?: number
          sixes?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string | null
          current_innings: number | null
          date: string
          id: string
          mvp_id: string | null
          status: string
          team1_id: string
          team2_id: string
          toss_choice: string | null
          toss_winner_id: string | null
          total_overs: number
          updated_at: string | null
          venue: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_innings?: number | null
          date: string
          id: string
          mvp_id?: string | null
          status: string
          team1_id: string
          team2_id: string
          toss_choice?: string | null
          toss_winner_id?: string | null
          total_overs: number
          updated_at?: string | null
          venue: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_innings?: number | null
          date?: string
          id?: string
          mvp_id?: string | null
          status?: string
          team1_id?: string
          team2_id?: string
          toss_choice?: string | null
          toss_winner_id?: string | null
          total_overs?: number
          updated_at?: string | null
          venue?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_mvp_id_fkey"
            columns: ["mvp_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team1_id_fkey"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_id_fkey"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_toss_winner_id_fkey"
            columns: ["toss_winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          id: string
          name: string
          role: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          role: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          role?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          logo: string | null
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          logo?: string | null
          name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo?: string | null
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin"],
    },
  },
} as const
