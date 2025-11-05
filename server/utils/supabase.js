import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from server directory
dotenv.config({ path: join(__dirname, "..", ".env") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Environment variables:", {
    SUPABASE_URL: supabaseUrl ? "exists" : "missing",
    SUPABASE_ANON_KEY: supabaseKey ? "exists" : "missing",
  });
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
