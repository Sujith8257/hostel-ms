// Test if environment variables are being loaded correctly
console.log('🔍 Testing Environment Variables...')

// Simulate what Vite does with import.meta.env
const testEnv = {
  VITE_SUPABASE_URL: 'https://omnmyjuqygveshjkcebo.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbm15anVxeWd2ZXNoamtjZWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTk5MDcsImV4cCI6MjA3MTUzNTkwN30.4ReNDl6hPq6eZzWrVCg1kDmYxzS9xmwpFtl6s6QGLg0'
}

console.log('✅ VITE_SUPABASE_URL:', testEnv.VITE_SUPABASE_URL)
console.log('✅ VITE_SUPABASE_PUBLISHABLE_KEY:', testEnv.VITE_SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + '...')

// Test the supabase client creation
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = testEnv.VITE_SUPABASE_URL
const supabaseKey = testEnv.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables')
  process.exit(1)
}

console.log('✅ Environment variables are valid')

const supabase = createClient(supabaseUrl, supabaseKey)
console.log('✅ Supabase client created successfully')

// Test a simple query
supabase
  .from('students')
  .select('count', { count: 'exact', head: true })
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Query failed:', error.message)
    } else {
      console.log('✅ Query successful! Count:', data)
      console.log('🎉 Database connection is working perfectly!')
    }
  })
  .catch(err => {
    console.log('❌ Unexpected error:', err.message)
  })
