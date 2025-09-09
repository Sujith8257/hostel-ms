-- Seed Users for Hostel Management System
-- This file creates authentication users and their corresponding profiles

-- First, insert into auth.users (this is the Supabase Auth table)
-- Note: In production, users should be created through the normal signup process
-- These are for development/testing purposes only

-- Admin Users
INSERT INTO auth.users (
  id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@hostel.edu',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "System Administrator"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'superadmin@hostel.edu',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Super Admin"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Hostel Directors
INSERT INTO auth.users (
  id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES 
(
  '33333333-3333-3333-3333-333333333333',
  'authenticated',
  'authenticated',
  'director@hostel.edu',
  crypt('director123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Dr. Rajesh Kumar"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  '44444444-4444-4444-4444-444444444444',
  'authenticated',
  'authenticated',
  'director2@hostel.edu',
  crypt('director123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Prof. Priya Sharma"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Wardens
INSERT INTO auth.users (
  id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES 
(
  '55555555-5555-5555-5555-555555555555',
  'authenticated',
  'authenticated',
  'warden.a@hostel.edu',
  crypt('warden123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Mr. Arun Patel"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  '66666666-6666-6666-6666-666666666666',
  'authenticated',
  'authenticated',
  'warden.b@hostel.edu',
  crypt('warden123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Ms. Meera Singh"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  '77777777-7777-7777-7777-777777777777',
  'authenticated',
  'authenticated',
  'warden.c@hostel.edu',
  crypt('warden123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Dr. Suresh Reddy"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Deputy Wardens
INSERT INTO auth.users (
  id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES 
(
  '88888888-8888-8888-8888-888888888888',
  'authenticated',
  'authenticated',
  'deputy.warden1@hostel.edu',
  crypt('deputy123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Mr. Vikram Gupta"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  '99999999-9999-9999-9999-999999999999',
  'authenticated',
  'authenticated',
  'deputy.warden2@hostel.edu',
  crypt('deputy123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Ms. Kavitha Nair"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Assistant Wardens
INSERT INTO auth.users (
  id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES 
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'authenticated',
  'authenticated',
  'assistant.warden1@hostel.edu',
  crypt('assistant123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Mr. Rohit Joshi"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'authenticated',
  'authenticated',
  'assistant.warden2@hostel.edu',
  crypt('assistant123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Ms. Anjali Desai"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Caretakers
INSERT INTO auth.users (
  id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES 
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'authenticated',
  'authenticated',
  'caretaker1@hostel.edu',
  crypt('caretaker123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Mr. Raman Kumar"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'authenticated',
  'authenticated',
  'caretaker2@hostel.edu',
  crypt('caretaker123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Mr. Sunil Yadav"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'authenticated',
  'authenticated',
  'caretaker3@hostel.edu',
  crypt('caretaker123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Ms. Lata Sharma"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Case Managers
INSERT INTO auth.users (
  id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES 
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'authenticated',
  'authenticated',
  'case.manager1@hostel.edu',
  crypt('case123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Mr. Amit Verma"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'case.manager2@hostel.edu',
  crypt('case123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Ms. Sunita Rao"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Investigators
INSERT INTO auth.users (
  id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES 
(
  '00000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'investigator1@hostel.edu',
  crypt('investigator123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Officer Rajesh Singh"}',
  '{"provider": "email", "providers": ["email"]}'
),
(
  '00000000-0000-0000-0000-000000000003',
  'authenticated',
  'authenticated',
  'investigator2@hostel.edu',
  crypt('investigator123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Detective Priya Mehta"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Insert corresponding profiles
-- These will be automatically created by the database trigger, but we can also insert them manually

INSERT INTO public.profiles (user_id, full_name, email, role) VALUES
-- Admin users
('11111111-1111-1111-1111-111111111111', 'System Administrator', 'admin@hostel.edu', 'admin'),
('22222222-2222-2222-2222-222222222222', 'Super Admin', 'superadmin@hostel.edu', 'admin'),

-- Hostel Directors
('33333333-3333-3333-3333-333333333333', 'Dr. Rajesh Kumar', 'director@hostel.edu', 'hostel_director'),
('44444444-4444-4444-4444-444444444444', 'Prof. Priya Sharma', 'director2@hostel.edu', 'hostel_director'),

-- Wardens
('55555555-5555-5555-5555-555555555555', 'Mr. Arun Patel', 'warden.a@hostel.edu', 'warden'),
('66666666-6666-6666-6666-666666666666', 'Ms. Meera Singh', 'warden.b@hostel.edu', 'warden'),
('77777777-7777-7777-7777-777777777777', 'Dr. Suresh Reddy', 'warden.c@hostel.edu', 'warden'),

-- Deputy Wardens
('88888888-8888-8888-8888-888888888888', 'Mr. Vikram Gupta', 'deputy.warden1@hostel.edu', 'deputy_warden'),
('99999999-9999-9999-9999-999999999999', 'Ms. Kavitha Nair', 'deputy.warden2@hostel.edu', 'deputy_warden'),

-- Assistant Wardens
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mr. Rohit Joshi', 'assistant.warden1@hostel.edu', 'assistant_warden'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ms. Anjali Desai', 'assistant.warden2@hostel.edu', 'assistant_warden'),

-- Caretakers
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mr. Raman Kumar', 'caretaker1@hostel.edu', 'caretaker'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mr. Sunil Yadav', 'caretaker2@hostel.edu', 'caretaker'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ms. Lata Sharma', 'caretaker3@hostel.edu', 'caretaker'),

-- Case Managers
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Mr. Amit Verma', 'case.manager1@hostel.edu', 'case_manager'),
('00000000-0000-0000-0000-000000000001', 'Ms. Sunita Rao', 'case.manager2@hostel.edu', 'case_manager'),

-- Investigators
('00000000-0000-0000-0000-000000000002', 'Officer Rajesh Singh', 'investigator1@hostel.edu', 'investigator'),
('00000000-0000-0000-0000-000000000003', 'Detective Priya Mehta', 'investigator2@hostel.edu', 'investigator')

ON CONFLICT (user_id) DO NOTHING;