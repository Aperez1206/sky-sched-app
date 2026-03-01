export interface Aircraft {
  tailNumber: string;
  model: string;
  status: 'flying' | 'ground' | 'maintenance' | 'refueling';
  lastAirport: string;
}

export interface Instructor {
  name: string;
  certs: string;
}

export interface FlightType {
  id: string;
  label: string;
  cssVar: string;
  color: string;
}

export interface Booking {
  id: string;
  flightTypeId: string;
  aircraftTail: string;
  instructorName: string;
  studentName: string;
  startDate: Date;
  endDate: Date;
  flightArea: 'local' | 'xc';
  route: string;
  status: 'confirmed' | 'pending';
  bookedBy: 'admin' | 'instructor' | 'student';
}

export const AIRCRAFT: Aircraft[] = [
  { tailNumber: 'N5223R', model: 'Cessna 172', status: 'ground', lastAirport: 'KOPF' },
  { tailNumber: 'N202332', model: 'Cessna 172', status: 'flying', lastAirport: 'KOPF' },
  { tailNumber: 'N19679', model: 'Cessna 172', status: 'ground', lastAirport: 'KOPF' },
  { tailNumber: 'N4609Q', model: 'Cessna 172', status: 'maintenance', lastAirport: 'KOPF' },
  { tailNumber: 'N20472', model: 'Cessna 172', status: 'ground', lastAirport: 'KOPF' },
  { tailNumber: 'N6854H', model: 'Cessna 172', status: 'refueling', lastAirport: 'KOPF' },
  { tailNumber: 'N138MF', model: 'Cirrus SR22', status: 'ground', lastAirport: 'KOPF' },
  { tailNumber: 'N194ML', model: 'Piper Aztec', status: 'ground', lastAirport: 'KFLL' },
  { tailNumber: 'N6026J', model: 'Cessna 162', status: 'ground', lastAirport: 'KOPF' },
];

export const INSTRUCTORS: Instructor[] = [
  { name: 'Atlee Julian Eng', certs: 'CFI / CFII / MEI' },
  { name: 'Gabriela Murcia', certs: 'CFI / CFII' },
  { name: 'Paul Lewis', certs: 'CFI / CFII' },
  { name: 'Erick Valdez Quinones', certs: 'CFI / CFII' },
  { name: 'Mauricio Reina', certs: 'CFI / CFII / MEI' },
  { name: 'Carlos Martin', certs: 'CFI / CFII / MEI' },
  { name: 'Carlos Romero', certs: 'CFI / CFII / MEI' },
  { name: 'Fabian Murgo', certs: 'CFI / CFII / MEI' },
];

export const FLIGHT_TYPES: FlightType[] = [
  { id: 'private', label: 'Part 141 – Private Pilot', cssVar: '--flight-private', color: '#0ea5e9' },
  { id: 'instrument', label: 'Part 141 – Instrument Rating', cssVar: '--flight-instrument', color: '#8b5cf6' },
  { id: 'part61', label: 'Part 61 Instruction', cssVar: '--flight-part61', color: '#f97316' },
  { id: 'solo', label: 'Solo', cssVar: '--flight-solo', color: '#10b981' },
  { id: 'rental', label: 'Time Building / Rental', cssVar: '--flight-rental', color: '#f59e0b' },
];

export const STUDENTS = [
  { name: 'Marcus Johnson', type: 'student' as const },
  { name: 'Emily Chen', type: 'student' as const },
  { name: 'David Rodriguez', type: 'student' as const },
  { name: 'Sarah Williams', type: 'student' as const },
  { name: 'James Park', type: 'student' as const },
  { name: 'Michael Torres', type: 'renter' as const },
  { name: 'Lisa Anderson', type: 'renter' as const },
  { name: 'Robert Kim', type: 'renter' as const },
];

function todayAt(h: number, m: number): Date {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 'b1', flightTypeId: 'private', aircraftTail: 'N5223R',
    instructorName: 'Atlee Julian Eng', studentName: 'Marcus Johnson',
    startDate: todayAt(8, 0), endDate: todayAt(10, 0),
    flightArea: 'local', route: 'KOPF — Practice Area — KOPF',
    status: 'confirmed', bookedBy: 'admin',
  },
  {
    id: 'b2', flightTypeId: 'instrument', aircraftTail: 'N19679',
    instructorName: 'Gabriela Murcia', studentName: 'Emily Chen',
    startDate: todayAt(9, 0), endDate: todayAt(11, 30),
    flightArea: 'xc', route: 'KOPF — KFLL — KPBI — KOPF',
    status: 'confirmed', bookedBy: 'instructor',
  },
  {
    id: 'b3', flightTypeId: 'part61', aircraftTail: 'N202332',
    instructorName: 'Paul Lewis', studentName: 'David Rodriguez',
    startDate: todayAt(7, 0), endDate: todayAt(9, 0),
    flightArea: 'local', route: 'KOPF — Practice Area — KOPF',
    status: 'confirmed', bookedBy: 'admin',
  },
  {
    id: 'b4', flightTypeId: 'solo', aircraftTail: 'N20472',
    instructorName: 'No instructor', studentName: 'Sarah Williams',
    startDate: todayAt(10, 0), endDate: todayAt(12, 0),
    flightArea: 'local', route: 'KOPF — Practice Area — KOPF',
    status: 'confirmed', bookedBy: 'instructor',
  },
  {
    id: 'b5', flightTypeId: 'rental', aircraftTail: 'N138MF',
    instructorName: 'No instructor', studentName: 'Michael Torres',
    startDate: todayAt(11, 0), endDate: todayAt(14, 0),
    flightArea: 'xc', route: 'KOPF — KMTH — KOPF',
    status: 'confirmed', bookedBy: 'admin',
  },
  {
    id: 'b6', flightTypeId: 'private', aircraftTail: 'N6026J',
    instructorName: 'Erick Valdez Quinones', studentName: 'James Park',
    startDate: todayAt(13, 0), endDate: todayAt(15, 0),
    flightArea: 'local', route: 'KOPF — Practice Area — KOPF',
    status: 'confirmed', bookedBy: 'admin',
  },
  {
    id: 'b7', flightTypeId: 'instrument', aircraftTail: 'N5223R',
    instructorName: 'Mauricio Reina', studentName: 'Emily Chen',
    startDate: todayAt(14, 0), endDate: todayAt(16, 30),
    flightArea: 'xc', route: 'KOPF — KTMB — KHWO — KOPF',
    status: 'confirmed', bookedBy: 'instructor',
  },
  {
    id: 'b8', flightTypeId: 'part61', aircraftTail: 'N6854H',
    instructorName: 'Carlos Martin', studentName: 'Robert Kim',
    startDate: todayAt(15, 0), endDate: todayAt(17, 0),
    flightArea: 'local', route: 'KOPF — Practice Area — KOPF',
    status: 'confirmed', bookedBy: 'admin',
  },
  // Pending student bookings
  {
    id: 'b9', flightTypeId: 'private', aircraftTail: 'N20472',
    instructorName: 'Fabian Murgo', studentName: 'Marcus Johnson',
    startDate: todayAt(16, 0), endDate: todayAt(18, 0),
    flightArea: 'local', route: 'KOPF — Practice Area — KOPF',
    status: 'pending', bookedBy: 'student',
  },
  {
    id: 'b10', flightTypeId: 'instrument', aircraftTail: 'N19679',
    instructorName: 'Carlos Romero', studentName: 'David Rodriguez',
    startDate: todayAt(17, 0), endDate: todayAt(19, 0),
    flightArea: 'xc', route: 'KOPF — KFLL — KOPF',
    status: 'pending', bookedBy: 'student',
  },
];

export function getFlightType(id: string): FlightType {
  return FLIGHT_TYPES.find(f => f.id === id) || FLIGHT_TYPES[0];
}

export const HOUR_HEIGHT = 72;
export const COL_WIDTH = 160;
export const HOURS = Array.from({ length: 24 }, (_, i) => i);
