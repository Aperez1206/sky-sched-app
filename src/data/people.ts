import { INSTRUCTORS } from './aeroplan';

export interface StaffMember {
  name: string;
  role: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface StudentRecord {
  name: string;
  enrolledCourse: string;
  assignedInstructor: string;
  progress: number; // 0–100
  status: 'active' | 'on-hold' | 'graduated';
}

export interface InstructorRecord {
  name: string;
  certs: string;
  studentsAssigned: number;
  status: 'active' | 'on-leave';
}

export const STAFF: StaffMember[] = [
  { name: 'Adrian Perez', role: 'Chief Administrator', email: 'adrian@aeroplan.io', status: 'active' },
  { name: 'Maria Gonzalez', role: 'Dispatcher', email: 'maria@aeroplan.io', status: 'active' },
  { name: 'Kevin Bryant', role: 'Dispatcher', email: 'kevin@aeroplan.io', status: 'active' },
  { name: 'Linda Tran', role: 'Administrative Assistant', email: 'linda@aeroplan.io', status: 'active' },
  { name: 'Oscar Delgado', role: 'Maintenance Manager', email: 'oscar@aeroplan.io', status: 'active' },
  { name: 'Rachel Nguyen', role: 'Safety Officer', email: 'rachel@aeroplan.io', status: 'inactive' },
];

export const INSTRUCTOR_RECORDS: InstructorRecord[] = INSTRUCTORS.map((inst, i) => ({
  name: inst.name,
  certs: inst.certs,
  studentsAssigned: [3, 2, 4, 1, 3, 2, 2, 1][i] ?? 0,
  status: i === 5 ? 'on-leave' as const : 'active' as const,
}));

export const STUDENT_RECORDS: StudentRecord[] = [
  { name: 'Marcus Johnson', enrolledCourse: 'Part 141 – Private Pilot', assignedInstructor: 'Atlee Julian Eng', progress: 72, status: 'active' },
  { name: 'Emily Chen', enrolledCourse: 'Part 141 – Private Pilot', assignedInstructor: 'Gabriela Murcia', progress: 45, status: 'active' },
  { name: 'David Rodriguez', enrolledCourse: 'Part 141 – Instrument Rating', assignedInstructor: 'Paul Lewis', progress: 88, status: 'active' },
  { name: 'Sarah Williams', enrolledCourse: 'Part 141 – Private Pilot', assignedInstructor: 'Atlee Julian Eng', progress: 30, status: 'active' },
  { name: 'James Park', enrolledCourse: 'Part 61 Instruction', assignedInstructor: 'Erick Valdez Quinones', progress: 60, status: 'active' },
  { name: 'Sofia Ramirez', enrolledCourse: 'Part 141 – Instrument Rating', assignedInstructor: 'Mauricio Reina', progress: 15, status: 'on-hold' },
  { name: 'Tyler Brooks', enrolledCourse: 'Part 141 – Private Pilot', assignedInstructor: 'Carlos Romero', progress: 95, status: 'active' },
  { name: 'Natasha Ivanova', enrolledCourse: 'Part 61 Instruction', assignedInstructor: 'Fabian Murgo', progress: 100, status: 'graduated' },
];
