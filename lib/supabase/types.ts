export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Build-safe baseline. Replace it with generated Supabase types after applying
 * the migration and reviewing the generated schema contract.
 */
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_household_workspace: {
        Args: {
          p_name: string;
          p_slug: string;
          p_timezone?: string;
          p_base_currency?: string;
        };
        Returns: string;
      };
      accept_household_invitation: {
        Args: { p_token: string };
        Returns: string;
      };
    };
    Enums: Record<string, string>;
    CompositeTypes: Record<string, never>;
  };
};
