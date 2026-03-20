

## Seed Demo Data for Testing

### What we'll insert

Since profiles doesn't have a foreign key constraint to auth.users (based on the schema), we can insert demo profiles directly. The two real users (Adrian Perez - admin, Andrian Abel - student) will be supplemented with demo people.

### Data to seed

**1. Courses** (3 rows)
- Part 141 – Private Pilot
- Part 141 – Instrument Rating  
- Part 61 Instruction

**2. Demo Profiles + Roles** (10 new people)
- 4 Instructors: Atlee Julian Eng, Gabriela Murcia, Paul Lewis, Erick Valdez Quinones
- 4 Students: Marcus Johnson, Emily Chen, David Rodriguez, Sarah Williams
- 1 Dispatcher: Maria Gonzalez
- 1 Maintenance: Oscar Delgado (dispatch role)

**3. Course Enrollments** (5 rows)
- Andrian Abel → Private Pilot (enrolled)
- Marcus Johnson → Private Pilot (enrolled)
- Emily Chen → Private Pilot (enrolled)
- David Rodriguez → Instrument Rating (enrolled)
- Sarah Williams → Part 61 (enrolled)

**4. Flight Reservations** (8 rows)
- Mix of today and upcoming days, various aircraft/instructor/student combos, some confirmed, some pending
- Different flight types (private, instrument, part61, solo, rental)

**5. Completed Flight Sessions** (6 rows)
- Past sessions with hobbs/tach data filled in, linked to instructors and students
- Realistic hobbs values (e.g., 1234.5 → 1236.2) and tach values
- Flight instruction and ground instruction hours populated

**6. Account Transactions** (12 rows)
- Payments added (credits) for students: $2000, $1500, etc.
- Flight charges (debits) for completed sessions
- Ground instruction charges
- Gives students realistic balances

### Implementation

Use the insert tool to run all INSERT statements across the tables. Generate deterministic UUIDs for the demo profiles so we can reference them in other tables.

### Files to modify

None — this is data-only, inserted via the database insert tool.

