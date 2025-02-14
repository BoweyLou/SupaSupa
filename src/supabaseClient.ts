import * as supabaseJS from '@supabase/supabase-js';

// Initialize Supabase client with URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = supabaseJS.createClient(supabaseUrl, supabaseAnonKey); 