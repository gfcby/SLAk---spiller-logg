import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Mangler VITE_SUPABASE_URL eller VITE_SUPABASE_ANON_KEY. Sjekk .env-filen din (se .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
