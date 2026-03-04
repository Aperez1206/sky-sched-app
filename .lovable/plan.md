

## Account Dashboard & Course Tracking

### Overview

Transform the PersonDetailPage into a rich dashboard with balance, transactions, reservations, sessions, courses, and documents. Add a "Dashboard" nav item for the logged-in user's own view. The same dashboard layout is used when an admin clicks a person in the People tab.

### Database Changes (4 new tables, 1 storage bucket)

**1. `courses`** — catalog of available courses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | e.g. "Part 141 – Private Pilot" |
| description | text | nullable |
| created_at | timestamptz | default now() |

RLS: authenticated can read, admin can manage.

**2. `course_enrollments`** — links users to courses with status
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| course_id | uuid FK → courses | |
| status | text | 'enrolled' or 'graduated' |
| enrolled_at | timestamptz | default now() |
| graduated_at | timestamptz | nullable |

RLS: authenticated can read all, admin can insert/update/delete.

**3. `account_transactions`** — ledger for balance tracking
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| amount | numeric | positive = credit, negative = charge |
| description | text | e.g. "Flight session – N12345" or "Funds added" |
| reference_type | text | nullable, e.g. 'flight_session', 'ground_instruction', 'payment' |
| reference_id | uuid | nullable, FK to session or payment |
| created_at | timestamptz | default now() |

RLS: users can read their own, admin/dispatch can read all and insert.

**4. `user_documents`** — metadata for admin-uploaded documents
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| name | text | display name |
| file_path | text | storage path |
| uploaded_by | uuid FK → profiles | admin who uploaded |
| created_at | timestamptz | default now() |

RLS: users can read their own, admin can manage all.

**Storage bucket:** `user-documents` (private, admin can upload, users can read their own).

**Update `flight_sessions`:** Add `course_id` column (uuid, nullable, FK → courses) to associate sessions with a course for the dropdown filter.

### Navigation

Add a **"Dashboard"** item to the sidebar (icon: `LayoutDashboard`), route `/dashboard`. This shows the logged-in user's own dashboard. The People tab detail view (`/people/:personId`) uses the same dashboard component but for the selected person (with admin-only features like uploading docs, managing enrollment).

### Dashboard Layout (PersonDetailPage redesign)

Header with person name/role, then a grid/tile layout:

**Row 1 — Summary Cards:**
- **Balance** card: shows current balance (sum of account_transactions), with "Add Funds" button (placeholder for Stripe integration later)
- **Recent Transactions** card: last 5 transactions with amount, description, date

**Row 2 — Tabs section** (replaces current simple tabs):
- **Reservations** tab: upcoming flight_reservations for this person (as student or instructor), showing date, aircraft, flight type, status
- **Sessions** tab: completed flight_sessions (existing table). Add a course filter dropdown at the top — queries by `course_id` on flight_sessions. Shows hobbs/tach/instruction data with Dual Given vs Dual Received logic
- **Courses** tab: list of course_enrollments for this person with course name and status badge (enrolled/graduated). Admin sees manage buttons
- **Documents** tab: list of user_documents with download links. Admin sees an upload button; regular users cannot upload

### Files to create/modify

| File | Change |
|------|--------|
| Migration SQL | Create `courses`, `course_enrollments`, `account_transactions`, `user_documents` tables; add `course_id` to `flight_sessions`; storage bucket; RLS policies |
| `src/components/AppSidebar.tsx` | Add "Dashboard" nav item |
| `src/App.tsx` | Add `/dashboard` route |
| `src/pages/DashboardPage.tsx` | New — logged-in user's dashboard (reuses dashboard component) |
| `src/pages/PersonDetailPage.tsx` | Full redesign — balance card, transactions, tabbed reservations/sessions/courses/documents |
| `src/hooks/useAccountData.ts` | New — hooks for balance, transactions, enrollments, documents |
| `src/components/dashboard/BalanceCard.tsx` | Balance display + add funds button |
| `src/components/dashboard/TransactionsCard.tsx` | Recent transactions list |
| `src/components/dashboard/SessionsTab.tsx` | Sessions table with course filter dropdown |
| `src/components/dashboard/CoursesTab.tsx` | Course enrollments list |
| `src/components/dashboard/DocumentsTab.tsx` | Documents list with admin upload |
| `src/components/dashboard/ReservationsTab.tsx` | Future reservations list |

