-- Insert test users for development
-- Note: These users need to be created in Supabase Auth first, then their profiles will be auto-created

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