#!/usr/bin/env node
import fs from 'fs';
import { parse } from 'csv-parse';
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
  throw new Error('Missing Supabase environment variables. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in backend/.env');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function importStudents() {
  console.log('Starting student data import...');
  
  const csvFilePath = path.join(__dirname, '..', 'students.csv');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('CSV file not found:', csvFilePath);
    process.exit(1);
  }

  const students = [];
  const errors = [];

  // Read and parse CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(parse({ 
        delimiter: ',',
        columns: true, // Use first line as column headers
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        try {
          // Clean and validate data
          const student = {
            register_number: row['Reg.No.']?.trim(),
            full_name: row['Name of the Student']?.trim(),
            email: row['Email ID']?.trim(),
            hostel_status: 'resident', // Default status
            is_active: true
          };

          // Validate required fields
          if (!student.register_number || !student.full_name) {
            errors.push({
              row: row['S.No.'],
              error: 'Missing required fields (register_number or full_name)',
              data: row
            });
            return;
          }

          // Validate email format if provided
          if (student.email && !isValidEmail(student.email)) {
            errors.push({
              row: row['S.No.'],
              error: 'Invalid email format',
              data: row
            });
            return;
          }

          // Clean register number (remove any spaces or special characters if needed)
          student.register_number = student.register_number.replace(/\s+/g, '');

          students.push(student);
        } catch (error) {
          errors.push({
            row: row['S.No.'],
            error: error.message,
            data: row
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Parsed ${students.length} students from CSV`);
  
  if (errors.length > 0) {
    console.log(`Found ${errors.length} errors:`);
    errors.forEach(err => {
      console.log(`Row ${err.row}: ${err.error}`);
    });
  }

  if (students.length === 0) {
    console.log('No valid students to import');
    return;
  }

  // Insert students in batches to avoid overwhelming the database
  const batchSize = 50;
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    
    console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(students.length / batchSize)} (${batch.length} students)`);
    
    try {
      const { data, error } = await supabaseAdmin
        .from('students')
        .insert(batch)
        .select();

      if (error) {
        console.error('Batch insert error:', error);
        failureCount += batch.length;
        
        // Try inserting individually to identify specific failures
        for (const student of batch) {
          try {
            const { error: individualError } = await supabaseAdmin
              .from('students')
              .insert([student]);
            
            if (individualError) {
              console.error(`Failed to insert student ${student.register_number}: ${individualError.message}`);
              failureCount++;
            } else {
              successCount++;
            }
          } catch (err) {
            console.error(`Exception inserting student ${student.register_number}:`, err);
            failureCount++;
          }
        }
      } else {
        successCount += batch.length;
        console.log(`Successfully inserted ${batch.length} students`);
      }
    } catch (error) {
      console.error('Batch processing error:', error);
      failureCount += batch.length;
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total students processed: ${students.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Failed imports: ${failureCount}`);
  console.log(`CSV parsing errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\nCSV Parsing Errors:');
    errors.forEach(err => {
      console.log(`Row ${err.row}: ${err.error}`);
    });
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Run the import
importStudents()
  .then(() => {
    console.log('Import process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import process failed:', error);
    process.exit(1);
  });