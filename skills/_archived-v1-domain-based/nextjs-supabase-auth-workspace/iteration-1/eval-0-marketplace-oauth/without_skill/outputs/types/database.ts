export type UserRole = "buyer" | "seller";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // references auth.users.id
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
