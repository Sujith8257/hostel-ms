import { createClient } from '@supabase/supabase-js'

// Test database connection with your actual credentials
const supabaseUrl = 'https://omnmyjuqygveshjkcebo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbm15anVxeWd2ZXNoamtjZWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTk5MDcsImV4cCI6MjA3MTUzNTkwN30.4ReNDl6hPq6eZzWrVCg1kDmYxzS9xmwpFtl6s6QGLg0'

console.log('🔗 Testing Supabase Database Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n1️⃣ Testing basic connection...')
    
    // Test 1: Basic connection test
    const { data: healthData, error: healthError } = await supabase
      .from('students')
      .select('count', { count: 'exact', head: true })
    
    if (healthError) {
      console.log('❌ Connection failed:', healthError.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    console.log('📊 Students count:', healthData)
    
    // Test 2: Check if we can read data
    console.log('\n2️⃣ Testing data access...')
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .limit(3)
    
    if (studentsError) {
      console.log('❌ Data access failed:', studentsError.message)
      return false
    }
    
    console.log('✅ Data access successful!')
    console.log('📋 Found', students.length, 'students')
    
    if (students.length > 0) {
      console.log('👥 Sample student:', students[0])
    } else {
      console.log('📝 No students found in database')
    }
    
    // Test 3: Check table structure
    console.log('\n3️⃣ Testing table structure...')
    const { data: structureData, error: structureError } = await supabase
      .from('students')
      .select('id, register_number, full_name, created_at')
      .limit(1)
    
    if (structureError) {
      console.log('❌ Structure test failed:', structureError.message)
      return false
    }
    
    console.log('✅ Table structure is correct!')
    
    // Test 4: Test realtime connection
    console.log('\n4️⃣ Testing realtime connection...')
    const channel = supabase
      .channel('test-connection')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, (payload) => {
        console.log('✅ Realtime working! Received:', payload.eventType)
      })
      .subscribe()
    
    // Wait a bit then unsubscribe
    setTimeout(() => {
      channel.unsubscribe()
      console.log('✅ Realtime test completed!')
    }, 2000)
    
    return true
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    return false
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Database connection test PASSED!')
    console.log('✅ Your app should be able to connect to Supabase')
  } else {
    console.log('\n💥 Database connection test FAILED!')
    console.log('❌ Check your Supabase configuration')
  }
})
