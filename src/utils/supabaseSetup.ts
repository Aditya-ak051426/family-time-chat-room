
import { createClient } from '@supabase/supabase-js';

export const setupSupabaseTable = async () => {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  // This will help users understand what table structure they need
  console.log(`
    To set up your Supabase database, create a table called 'messages' with these columns:
    
    CREATE TABLE messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      username TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    Enable Row Level Security (RLS) and create a policy to allow all operations:
    
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Allow all operations" ON messages
    FOR ALL USING (true);
  `);
  
  return supabase;
};
