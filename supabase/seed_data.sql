-- Insert test users for development
-- Note: These users need to be created in Supabase Auth first, then their profiles will be auto-created

-- Insert profiles for different user roles
-- Admin users
INSERT INTO public.profiles (user_id, full_name, email, role) VALUES
('11111111-1111-1111-1111-111111111111', 'System Administrator', 'admin@hostel.edu', 'admin'),
('22222222-2222-2222-2222-222222222222', 'Super Admin', 'superadmin@hostel.edu', 'admin');

-- Hostel Director
INSERT INTO public.profiles (user_id, full_name, email, role) VALUES
('33333333-3333-3333-3333-333333333333', 'Dr. Rajesh Kumar', 'director@hostel.edu', 'hostel_director'),
('44444444-4444-4444-4444-444444444444', 'Prof. Priya Sharma', 'director2@hostel.edu', 'hostel_director');

-- Wardens
INSERT INTO public.profiles (user_id, full_name, email, role) VALUES
('55555555-5555-5555-5555-555555555555', 'Mr. Arun Patel', 'warden.a@hostel.edu', 'warden'),
('66666666-6666-6666-6666-666666666666', 'Ms. Meera Singh', 'warden.b@hostel.edu', 'warden'),
('77777777-7777-7777-7777-777777777777', 'Dr. Suresh Reddy', 'warden.c@hostel.edu', 'warden');

-- Deputy Wardens
INSERT INTO public.profiles (user_id, full_name, email, role) VALUES
('88888888-8888-8888-8888-888888888888', 'Mr. Vikram Gupta', 'deputy.warden1@hostel.edu', 'deputy_warden'),
('99999999-9999-9999-9999-999999999999', 'Ms. Kavitha Nair', 'deputy.warden2@hostel.edu', 'deputy_warden');

-- Assistant Wardens
INSERT INTO public.profiles (user_id, full_name, email, role) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mr. Rohit Joshi', 'assistant.warden1@hostel.edu', 'assistant_warden'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ms. Anjali Desai', 'assistant.warden2@hostel.edu', 'assistant_warden');

-- Caretakers
INSERT INTO public.profiles (user_id, full_name, email, role) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mr. Raman Kumar', 'caretaker1@hostel.edu', 'caretaker'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mr. Sunil Yadav', 'caretaker2@hostel.edu', 'caretaker'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ms. Lata Sharma', 'caretaker3@hostel.edu', 'caretaker');

-- Case Managers
INSERT INTO public.profiles (user_id, full_name, email, role) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Mr. Amit Verma', 'case.manager1@hostel.edu', 'case_manager'),
('00000000-0000-0000-0000-000000000001', 'Ms. Sunita Rao', 'case.manager2@hostel.edu', 'case_manager');

-- Investigators
INSERT INTO public.profiles (user_id, full_name, email, role) VALUES
('00000000-0000-0000-0000-000000000002', 'Officer Rajesh Singh', 'investigator1@hostel.edu', 'investigator'),
('00000000-0000-0000-0000-000000000003', 'Detective Priya Mehta', 'investigator2@hostel.edu', 'investigator');

-- Sample students data  
INSERT INTO public.students (register_number, full_name, email, phone, hostel_status, room_number, is_active) VALUES
('REG2024001', 'John Doe', 'john.doe@student.edu', '+1234567890', 'resident', 'A101', true),
('REG2024002', 'Jane Smith', 'jane.smith@student.edu', '+1234567891', 'resident', 'A102', true),
('REG2024003', 'Mike Johnson', 'mike.johnson@student.edu', '+1234567892', 'day_scholar', NULL, true),
('REG2024004', 'Sarah Williams', 'sarah.williams@student.edu', '+1234567893', 'resident', 'B201', true),
('REG2024005', 'David Brown', 'david.brown@student.edu', '+1234567894', 'former_resident', NULL, false);

-- Sample entry logs
INSERT INTO public.entry_logs (register_number, student_name, entry_type, timestamp, confidence_score, location) VALUES
('REG2024001', 'John Doe', 'entry', NOW() - INTERVAL '2 hours', 0.95, 'Main Gate'),
('REG2024002', 'Jane Smith', 'entry', NOW() - INTERVAL '1 hour', 0.92, 'Main Gate'),
('REG2024001', 'John Doe', 'exit', NOW() - INTERVAL '30 minutes', 0.94, 'Main Gate'),
('REG2024004', 'Sarah Williams', 'entry', NOW() - INTERVAL '10 minutes', 0.96, 'Main Gate');

-- Sample alerts
INSERT INTO public.alerts (image_url, timestamp, confidence_score, location, status, notes) VALUES
('https://example.com/alert1.jpg', NOW() - INTERVAL '3 hours', 0.75, 'Main Gate', 'pending', 'Unknown person detected'),
('https://example.com/alert2.jpg', NOW() - INTERVAL '1 day', 0.68, 'Side Gate', 'resolved', 'False alarm - visitor with permission'),
('https://example.com/alert3.jpg', NOW() - INTERVAL '30 minutes', 0.82, 'Main Gate', 'pending', 'Unrecognized face detected');