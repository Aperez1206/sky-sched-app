
-- Insert demo auth users (password: 'demo1234' for all)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES
  ('d0d0d0d0-0001-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'atlee@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0002-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'gabriela@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0003-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'paul@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0004-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'erick@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0005-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'marcus@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0006-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'emily@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0007-4000-8000-000000000007', '00000000-0000-0000-0000-000000000000', 'david@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0008-4000-8000-000000000008', '00000000-0000-0000-0000-000000000000', 'sarah@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0009-4000-8000-000000000009', '00000000-0000-0000-0000-000000000000', 'maria@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('d0d0d0d0-0010-4000-8000-000000000010', '00000000-0000-0000-0000-000000000000', 'oscar@aeroplan.io', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Insert identities for each demo user
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  ('d0d0d0d0-0001-4000-8000-000000000001', 'd0d0d0d0-0001-4000-8000-000000000001', 'atlee@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0001-4000-8000-000000000001","email":"atlee@aeroplan.io"}', now(), now(), now()),
  ('d0d0d0d0-0002-4000-8000-000000000002', 'd0d0d0d0-0002-4000-8000-000000000002', 'gabriela@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0002-4000-8000-000000000002","email":"gabriela@aeroplan.io"}', now(), now(), now()),
  ('d0d0d0d0-0003-4000-8000-000000000003', 'd0d0d0d0-0003-4000-8000-000000000003', 'paul@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0003-4000-8000-000000000003","email":"paul@aeroplan.io"}', now(), now(), now()),
  ('d0d0d0d0-0004-4000-8000-000000000004', 'd0d0d0d0-0004-4000-8000-000000000004', 'erick@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0004-4000-8000-000000000004","email":"erick@aeroplan.io"}', now(), now(), now()),
  ('d0d0d0d0-0005-4000-8000-000000000005', 'd0d0d0d0-0005-4000-8000-000000000005', 'marcus@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0005-4000-8000-000000000005","email":"marcus@aeroplan.io"}', now(), now(), now()),
  ('d0d0d0d0-0006-4000-8000-000000000006', 'd0d0d0d0-0006-4000-8000-000000000006', 'emily@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0006-4000-8000-000000000006","email":"emily@aeroplan.io"}', now(), now(), now()),
  ('d0d0d0d0-0007-4000-8000-000000000007', 'd0d0d0d0-0007-4000-8000-000000000007', 'david@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0007-4000-8000-000000000007","email":"david@aeroplan.io"}', now(), now(), now()),
  ('d0d0d0d0-0008-4000-8000-000000000008', 'd0d0d0d0-0008-4000-8000-000000000008', 'sarah@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0008-4000-8000-000000000008","email":"sarah@aeroplan.io"}', now(), now(), now()),
  ('d0d0d0d0-0009-4000-8000-000000000009', 'd0d0d0d0-0009-4000-8000-000000000009', 'maria@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0009-4000-8000-000000000009","email":"maria@aeroplan.io"}', now(), now(), now()),
  ('d0d0d0d0-0010-4000-8000-000000000010', 'd0d0d0d0-0010-4000-8000-000000000010', 'oscar@aeroplan.io', 'email', '{"sub":"d0d0d0d0-0010-4000-8000-000000000010","email":"oscar@aeroplan.io"}', now(), now(), now())
ON CONFLICT DO NOTHING;

-- Profiles
INSERT INTO profiles (id, full_name, email) VALUES
  ('d0d0d0d0-0001-4000-8000-000000000001', 'Atlee Julian Eng', 'atlee@aeroplan.io'),
  ('d0d0d0d0-0002-4000-8000-000000000002', 'Gabriela Murcia', 'gabriela@aeroplan.io'),
  ('d0d0d0d0-0003-4000-8000-000000000003', 'Paul Lewis', 'paul@aeroplan.io'),
  ('d0d0d0d0-0004-4000-8000-000000000004', 'Erick Valdez Quinones', 'erick@aeroplan.io'),
  ('d0d0d0d0-0005-4000-8000-000000000005', 'Marcus Johnson', 'marcus@aeroplan.io'),
  ('d0d0d0d0-0006-4000-8000-000000000006', 'Emily Chen', 'emily@aeroplan.io'),
  ('d0d0d0d0-0007-4000-8000-000000000007', 'David Rodriguez', 'david@aeroplan.io'),
  ('d0d0d0d0-0008-4000-8000-000000000008', 'Sarah Williams', 'sarah@aeroplan.io'),
  ('d0d0d0d0-0009-4000-8000-000000000009', 'Maria Gonzalez', 'maria@aeroplan.io'),
  ('d0d0d0d0-0010-4000-8000-000000000010', 'Oscar Delgado', 'oscar@aeroplan.io')
ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO user_roles (user_id, role) VALUES
  ('d0d0d0d0-0001-4000-8000-000000000001', 'instructor'),
  ('d0d0d0d0-0002-4000-8000-000000000002', 'instructor'),
  ('d0d0d0d0-0003-4000-8000-000000000003', 'instructor'),
  ('d0d0d0d0-0004-4000-8000-000000000004', 'instructor'),
  ('d0d0d0d0-0005-4000-8000-000000000005', 'student'),
  ('d0d0d0d0-0006-4000-8000-000000000006', 'student'),
  ('d0d0d0d0-0007-4000-8000-000000000007', 'student'),
  ('d0d0d0d0-0008-4000-8000-000000000008', 'student'),
  ('d0d0d0d0-0009-4000-8000-000000000009', 'dispatch'),
  ('d0d0d0d0-0010-4000-8000-000000000010', 'dispatch')
ON CONFLICT (user_id, role) DO NOTHING;

-- Courses
INSERT INTO courses (id, name, description) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Part 141 – Private Pilot', 'FAA Part 141 Private Pilot Certificate program'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Part 141 – Instrument Rating', 'FAA Part 141 Instrument Rating program'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Part 61 Instruction', 'FAA Part 61 flight instruction')
ON CONFLICT (id) DO NOTHING;

-- Course Enrollments
INSERT INTO course_enrollments (user_id, course_id, status) VALUES
  ('61eb2847-bda2-47c1-95b0-33312a158234', 'a1b2c3d4-0001-4000-8000-000000000001', 'enrolled'),
  ('d0d0d0d0-0005-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000001', 'enrolled'),
  ('d0d0d0d0-0006-4000-8000-000000000006', 'a1b2c3d4-0001-4000-8000-000000000001', 'enrolled'),
  ('d0d0d0d0-0007-4000-8000-000000000007', 'a1b2c3d4-0002-4000-8000-000000000002', 'enrolled'),
  ('d0d0d0d0-0008-4000-8000-000000000008', 'a1b2c3d4-0003-4000-8000-000000000003', 'enrolled');

-- Flight Reservations
INSERT INTO flight_reservations (id, aircraft_tail, student_id, instructor_id, booked_by, scheduled_start, scheduled_end, flight_type_id, status, flight_area, route) VALUES
  ('b0b0b0b0-0001-4000-8000-000000000001', 'N5223R', 'd0d0d0d0-0005-4000-8000-000000000005', 'd0d0d0d0-0001-4000-8000-000000000001', '3eecc5de-430d-40aa-9772-21c29d5a294b', now()::date + interval '9 hours', now()::date + interval '11 hours', 'private', 'confirmed', 'local', 'KOPF - Practice Area - KOPF'),
  ('b0b0b0b0-0002-4000-8000-000000000002', 'N202332', 'd0d0d0d0-0006-4000-8000-000000000006', 'd0d0d0d0-0002-4000-8000-000000000002', '3eecc5de-430d-40aa-9772-21c29d5a294b', now()::date + interval '10 hours', now()::date + interval '12 hours', 'private', 'confirmed', 'local', 'KOPF - Practice Area - KOPF'),
  ('b0b0b0b0-0003-4000-8000-000000000003', 'N19679', 'd0d0d0d0-0007-4000-8000-000000000007', 'd0d0d0d0-0003-4000-8000-000000000003', '3eecc5de-430d-40aa-9772-21c29d5a294b', now()::date + interval '13 hours', now()::date + interval '15 hours', 'instrument', 'confirmed', 'xc', 'KOPF - KFLL - KOPF'),
  ('b0b0b0b0-0004-4000-8000-000000000004', 'N20472', 'd0d0d0d0-0008-4000-8000-000000000008', 'd0d0d0d0-0004-4000-8000-000000000004', '3eecc5de-430d-40aa-9772-21c29d5a294b', now()::date + interval '14 hours', now()::date + interval '16 hours', 'part61', 'pending', 'local', 'KOPF - Practice Area - KOPF'),
  ('b0b0b0b0-0005-4000-8000-000000000005', 'N138MF', 'd0d0d0d0-0005-4000-8000-000000000005', null, '3eecc5de-430d-40aa-9772-21c29d5a294b', now()::date + interval '1 day 9 hours', now()::date + interval '1 day 11 hours', 'solo', 'confirmed', 'local', 'KOPF - Practice Area - KOPF'),
  ('b0b0b0b0-0006-4000-8000-000000000006', 'N5223R', 'd0d0d0d0-0006-4000-8000-000000000006', 'd0d0d0d0-0001-4000-8000-000000000001', '3eecc5de-430d-40aa-9772-21c29d5a294b', now()::date + interval '1 day 13 hours', now()::date + interval '1 day 15 hours', 'private', 'confirmed', 'xc', 'KOPF - KPBI - KOPF'),
  ('b0b0b0b0-0007-4000-8000-000000000007', 'N194ML', 'd0d0d0d0-0007-4000-8000-000000000007', 'd0d0d0d0-0003-4000-8000-000000000003', '3eecc5de-430d-40aa-9772-21c29d5a294b', now()::date + interval '2 days 10 hours', now()::date + interval '2 days 13 hours', 'instrument', 'pending', 'xc', 'KOPF - KMIA - KFLL - KOPF'),
  ('b0b0b0b0-0008-4000-8000-000000000008', 'N6026J', null, null, '3eecc5de-430d-40aa-9772-21c29d5a294b', now()::date + interval '2 days 8 hours', now()::date + interval '2 days 10 hours', 'rental', 'confirmed', 'local', 'KOPF - Practice Area - KOPF');

-- Completed Flight Sessions
INSERT INTO flight_sessions (id, reservation_id, aircraft_tail, student_id, instructor_id, checked_out_by, checked_out_at, checked_in_at, hobbs_in, hobbs_out, tach_in, tach_out, flight_instruction, ground_instruction, status, course_id) VALUES
  ('c0c0c0c0-0001-4000-8000-000000000001', null, 'N5223R', 'd0d0d0d0-0005-4000-8000-000000000005', 'd0d0d0d0-0001-4000-8000-000000000001', '3eecc5de-430d-40aa-9772-21c29d5a294b', now() - interval '7 days', now() - interval '7 days' + interval '102 minutes', 1234.5, 1236.2, 982.3, 983.6, 1.7, 0.5, 'completed', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('c0c0c0c0-0002-4000-8000-000000000002', null, 'N202332', 'd0d0d0d0-0006-4000-8000-000000000006', 'd0d0d0d0-0002-4000-8000-000000000002', '3eecc5de-430d-40aa-9772-21c29d5a294b', now() - interval '6 days', now() - interval '6 days' + interval '90 minutes', 2100.0, 2101.5, 1650.2, 1651.4, 1.5, 0.3, 'completed', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('c0c0c0c0-0003-4000-8000-000000000003', null, 'N19679', 'd0d0d0d0-0007-4000-8000-000000000007', 'd0d0d0d0-0003-4000-8000-000000000003', '3eecc5de-430d-40aa-9772-21c29d5a294b', now() - interval '5 days', now() - interval '5 days' + interval '126 minutes', 1890.1, 1892.2, 1420.5, 1422.1, 2.1, 0, 'completed', 'a1b2c3d4-0002-4000-8000-000000000002'),
  ('c0c0c0c0-0004-4000-8000-000000000004', null, 'N5223R', 'd0d0d0d0-0005-4000-8000-000000000005', 'd0d0d0d0-0001-4000-8000-000000000001', '3eecc5de-430d-40aa-9772-21c29d5a294b', now() - interval '3 days', now() - interval '3 days' + interval '78 minutes', 1236.2, 1237.5, 983.6, 984.6, 1.3, 0, 'completed', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('c0c0c0c0-0005-4000-8000-000000000005', null, 'N20472', 'd0d0d0d0-0008-4000-8000-000000000008', 'd0d0d0d0-0004-4000-8000-000000000004', '3eecc5de-430d-40aa-9772-21c29d5a294b', now() - interval '2 days', now() - interval '2 days' + interval '108 minutes', 3050.0, 3051.8, 2200.0, 2201.4, 1.8, 1.0, 'completed', 'a1b2c3d4-0003-4000-8000-000000000003'),
  ('c0c0c0c0-0006-4000-8000-000000000006', null, 'N202332', 'd0d0d0d0-0006-4000-8000-000000000006', 'd0d0d0d0-0002-4000-8000-000000000002', '3eecc5de-430d-40aa-9772-21c29d5a294b', now() - interval '1 day', now() - interval '1 day' + interval '84 minutes', 2101.5, 2102.9, 1651.4, 1652.5, 1.4, 0, 'completed', 'a1b2c3d4-0001-4000-8000-000000000001');

-- Account Transactions
INSERT INTO account_transactions (user_id, amount, description, reference_type) VALUES
  ('d0d0d0d0-0005-4000-8000-000000000005', 2000, 'Initial deposit', 'payment'),
  ('d0d0d0d0-0005-4000-8000-000000000005', -289, 'Flight session – N5223R (1.7 hrs)', 'flight_session'),
  ('d0d0d0d0-0005-4000-8000-000000000005', -35, 'Ground instruction (0.5 hrs)', 'ground_instruction'),
  ('d0d0d0d0-0005-4000-8000-000000000005', -221, 'Flight session – N5223R (1.3 hrs)', 'flight_session'),
  ('d0d0d0d0-0006-4000-8000-000000000006', 1500, 'Initial deposit', 'payment'),
  ('d0d0d0d0-0006-4000-8000-000000000006', -255, 'Flight session – N202332 (1.5 hrs)', 'flight_session'),
  ('d0d0d0d0-0006-4000-8000-000000000006', -21, 'Ground instruction (0.3 hrs)', 'ground_instruction'),
  ('d0d0d0d0-0006-4000-8000-000000000006', -238, 'Flight session – N202332 (1.4 hrs)', 'flight_session'),
  ('d0d0d0d0-0007-4000-8000-000000000007', 2500, 'Initial deposit', 'payment'),
  ('d0d0d0d0-0007-4000-8000-000000000007', -357, 'Flight session – N19679 (2.1 hrs)', 'flight_session'),
  ('d0d0d0d0-0008-4000-8000-000000000008', 1800, 'Initial deposit', 'payment'),
  ('d0d0d0d0-0008-4000-8000-000000000008', -306, 'Flight session – N20472 (1.8 hrs)', 'flight_session'),
  ('d0d0d0d0-0008-4000-8000-000000000008', -70, 'Ground instruction (1.0 hrs)', 'ground_instruction');
