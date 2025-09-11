#!/usr/bin/env node
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'backend', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Supabase admin client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getStudentStats() {
  console.log('Fetching student statistics...\n');

  try {
    // Total students
    const { count: totalStudents, error: totalError } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Active students
    const { count: activeStudents, error: activeError } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) throw activeError;

    // Students by hostel status
    const { data: statusData, error: statusError } = await supabaseAdmin
      .from('students')
      .select('hostel_status')
      .eq('is_active', true);

    if (statusError) throw statusError;

    const statusCounts = statusData.reduce((acc, student) => {
      acc[student.hostel_status] = (acc[student.hostel_status] || 0) + 1;
      return acc;
    }, {});

    // Students with assigned rooms
    const { count: assignedRooms, error: roomError } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true })
      .not('room_number', 'is', null)
      .eq('is_active', true);

    if (roomError) throw roomError;

    // Students with email
    const { count: withEmail, error: emailError } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null)
      .eq('is_active', true);

    if (emailError) throw emailError;

    // Students by building assignment
    const { data: buildingData, error: buildingError } = await supabaseAdmin
      .from('students')
      .select('building_id')
      .eq('is_active', true)
      .not('building_id', 'is', null);

    if (buildingError) throw buildingError;

    const buildingCounts = buildingData.reduce((acc, student) => {
      acc[student.building_id] = (acc[student.building_id] || 0) + 1;
      return acc;
    }, {});

    // Display statistics
    console.log('=== STUDENT DATABASE STATISTICS ===\n');
    console.log(`📊 Total Students: ${totalStudents}`);
    console.log(`✅ Active Students: ${activeStudents}`);
    console.log(`🚫 Inactive Students: ${totalStudents - activeStudents}`);
    console.log(`📧 Students with Email: ${withEmail}`);
    console.log(`🏠 Students with Room Assignment: ${assignedRooms || 0}`);
    console.log(`🏢 Students with Building Assignment: ${Object.values(buildingCounts).reduce((a, b) => a + b, 0)}`);
    
    console.log('\n=== HOSTEL STATUS BREAKDOWN ===');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status.toUpperCase()}: ${count}`);
    });

    if (Object.keys(buildingCounts).length > 0) {
      console.log('\n=== BUILDING ASSIGNMENTS ===');
      Object.entries(buildingCounts).forEach(([buildingId, count]) => {
        console.log(`Building ${buildingId}: ${count} students`);
      });
    }

    console.log('\n=== RECENT ADDITIONS ===');
    const { data: recentStudents, error: recentError } = await supabaseAdmin
      .from('students')
      .select('register_number, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    recentStudents.forEach(student => {
      const date = new Date(student.created_at).toLocaleDateString();
      console.log(`${student.register_number} - ${student.full_name} (Added: ${date})`);
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
}

// Run the stats
getStudentStats()
  .then(() => {
    console.log('\nStatistics completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Statistics failed:', error);
    process.exit(1);
  });