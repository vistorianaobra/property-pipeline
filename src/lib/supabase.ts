import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  "https://vgnyggewpjiiwngfrcib.supabase.co";

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  "sb_publishable_2jSN71y2TG34GVvg4AZNaQ_iN_2TZk6";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
