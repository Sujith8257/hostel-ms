import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('🔧 [SUPABASE INIT] Initializing Supabase client...');
console.log('🔧 [SUPABASE INIT] Environment check:', {
  urlExists: !!supabaseUrl,
  urlLength: supabaseUrl?.length || 0,
  keyExists: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length || 0,
  urlPrefix: supabaseUrl?.substring(0, 20) || 'N/A',
  keyPrefix: supabaseAnonKey?.substring(0, 20) || 'N/A'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [SUPABASE INIT] Missing environment variables');
  throw new Error('Missing Supabase environment variables')
}

console.log('✅ [SUPABASE INIT] Creating Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'hostel-ms@1.0.0'
    }
  }
})

console.log('✅ [SUPABASE INIT] Client created successfully');
console.log('🔧 [SUPABASE INIT] Client config:', {
  url: supabaseUrl,
  keyPresent: !!supabaseAnonKey
});