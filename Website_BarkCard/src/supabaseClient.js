import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tkayqwssbnhiddterycx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYXlxd3NzYm5oaWRkdGVyeWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTM1MzEsImV4cCI6MjA5MTkyOTUzMX0.wOVtvFccYhZPQdfETBFEvF_WM9XVj5rE-YxklJ6scD0';

let supabaseInstance = null;

const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

export const supabase = getSupabase();
