import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://iflyiggpbnkivkxzdoca.supabase.co";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbHlpZ2dwYm5raXZreHpkb2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTk1NjUsImV4cCI6MjEwNDc5NTU2NX0.Uh5Fy21tp2aexlWqJul5vtML-jKTN8PMEbdRqSGIZTA";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith("http") &&
  !SUPABASE_URL.includes("your-project"),
);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

