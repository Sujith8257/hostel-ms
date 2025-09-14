// This script requires the service role key to bypass RLS policies
// Run this with: node add-sample-data-with-service-key.js

import { createClient } from '@supabase/supabase-js'

// You need to get the service role key from Supabase Dashboard > Settings > API
const supabaseUrl = 'https://omnmyjuqygveshjkcebo.supabase.co'
const serviceRoleKey = 'YOUR_SERVICE_ROLE_KEY_HERE' // Replace with actual service role key

if (serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.log('Please replace YOUR_SERVICE_ROLE_KEY_HERE with the actual service role key from Supabase Dashboard > Settings > API')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addSampleData() {
  console.log('Adding sample student data...')
  
  const sampleStudents = [
    {
      register_number: 'REG2024001',
      full_name: 'John Doe',
      email: 'john.doe@student.edu',
      phone: '+1234567890',
      hostel_status: 'resident',
      room_number: 'A101',
      is_active: true
    },
    {
      register_number: 'REG2024002',
      full_name: 'Jane Smith',
      email: 'jane.smith@student.edu',
      phone: '+1234567891',
      hostel_status: 'resident',
      room_number: 'A102',
      is_active: true
    },
    {
      register_number: 'REG2024003',
      full_name: 'Mike Johnson',
      email: 'mike.johnson@student.edu',
      phone: '+1234567892',
      hostel_status: 'day_scholar',
      room_number: null,
      is_active: true
    },
    {
      register_number: 'REG2024004',
      full_name: 'Sarah Williams',
      email: 'sarah.williams@student.edu',
      phone: '+1234567893',
      hostel_status: 'resident',
      room_number: 'B201',
      is_active: true
    },
    {
      register_number: 'REG2024005',
      full_name: 'David Brown',
      email: 'david.brown@student.edu',
      phone: '+1234567894',
      hostel_status: 'former_resident',
      room_number: null,
      is_active: false
    }
  ]

  try {
    const { data, error } = await supabase
      .from('students')
      .insert(sampleStudents)
      .select()

    if (error) {
      console.error('Error inserting data:', error)
    } else {
      console.log('Successfully inserted', data.length, 'students')
      console.log('Sample data:', data)
    }
  } catch (err) {
    console.error('General error:', err)
  }
}

addSampleData()
