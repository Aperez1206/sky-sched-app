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

export interface Room {
  name: string;
  label: string;
}

export interface ScheduleColumn {
  id: string;
  title: string;
  subtitle: string;
  type: 'aircraft' | 'instructor' | 'room';
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
  roomName?: string;
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

export const ROOMS: Room[] = [
  { name: '204 - Conference', label: 'Conference Room' },
  { name: '206', label: 'Classroom' },
  { name: 'Google Meet', label: 'Virtual' },
  { name: 'MDAD Office', label: 'Office' },
];

export function aircraftToColumns(aircraft: Aircraft[]): ScheduleColumn[] {
  return aircraft.map(ac => ({ id: ac.tailNumber, title: ac.tailNumber, subtitle: ac.model, type: 'aircraft' as const }));
}

export function instructorsToColumns(instructors: Instructor[]): ScheduleColumn[] {
  return instructors.map(i => ({ id: i.name, title: i.name, subtitle: i.certs, type: 'instructor' as const }));
}

export function roomsToColumns(rooms: Room[]): ScheduleColumn[] {
  return rooms.map(r => ({ id: r.name, title: r.name, subtitle: r.label, type: 'room' as const }));
}

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

export const SAMPLE_BOOKINGS: Booking[] = [];

export function getFlightType(id: string): FlightType {
  return FLIGHT_TYPES.find(f => f.id === id) || FLIGHT_TYPES[0];
}

export const HOUR_HEIGHT = 72;
export const COL_WIDTH = 160;
export const HOURS = Array.from({ length: 24 }, (_, i) => i);
