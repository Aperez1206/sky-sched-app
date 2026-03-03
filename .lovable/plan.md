

## Role-Based Authentication & User Management System

### Overview

Add full authentication, role-based access control, and user management to the flight scheduling app. This touches database schema, RLS policies, auth flows, and UI across most pages.

### Step 1: Database Schema (Migrations)

Create three tables and a role enum:

```sql
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'dispatch', 'instructor', 'student');

-- Enrollment status enum
CREATE TYPE public.enrollment_status AS ENUM ('unenrolled', 'enrolled', 'graduated');

-- Schools table (stores school codes for student sign-up)
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  school_id uuid REFERENCES public.schools(id),
  enrollment_status enrollment_status DEFAULT 'unenrolled',
  primary_instructor_id uuid REFERENCES public.profiles(id),
  secondary_instructor_id uuid REFERENCES public.profiles(id),
  course_id text, -- placeholder for future courses table
  created_at timestamptz DEFAULT now()
);

-- User roles table (separate per security guidelines)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Flight reservations table
CREATE TABLE public.flight_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booked_by uuid REFERENCES public.profiles(id) NOT NULL,
  student_id uuid REFERENCES public.profiles(id),
  instructor_id uuid REFERENCES public.profiles(id),
  aircraft_tail text,
  flight_type_id text,
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  flight_area text DEFAULT 'local',
  route text,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'cancelled')),
  created_at timestamptz DEFAULT now()
);
```

**Trigger**: Auto-create profile row on sign-up, auto-assign role from metadata:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Security definer function** for role checks (avoids RLS recursion):

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**Seed a default school**:
```sql
INSERT INTO public.schools (name, code) VALUES ('AeroPlan Flight Academy', 'AERO2025');
```

### Step 2: RLS Policies

- **profiles**: Authenticated users can read all profiles. Users can update their own. Admins can update any.
- **user_roles**: Readable by authenticated. Only admins can insert/update/delete (via `has_role`).
- **schools**: Readable by anyone (needed for sign-up validation). Only admins can modify.
- **flight_reservations**: Authenticated can read all. Insert allowed for authenticated. Update allowed for own bookings or admin/dispatch/instructor roles. Delete by admin only.

### Step 3: Auth Pages

Create three new pages/components:

| File | Purpose |
|------|---------|
| `src/pages/AuthPage.tsx` | Login + Sign Up tabs. Sign-up includes full name, email, password, role selector. If "student" role selected, show School Code input and validate against `schools` table before proceeding. Passes role + full_name as user metadata on `signUp()`. |
| `src/pages/ResetPasswordPage.tsx` | Password reset form (for completeness) |
| `src/hooks/useAuth.ts` | Auth context provider: session state, current user profile + role, loading state. Wraps `onAuthStateChange` + `getSession`. Fetches profile + role from DB. |
| `src/components/AuthGuard.tsx` | Wraps `AppLayout`. If no session, redirect to `/auth`. If loading, show spinner. |

### Step 4: Route Protection & Role Gating

Update `App.tsx`:
- Add `/auth` route (public, renders `AuthPage`)
- Wrap `AppLayout` route with `AuthGuard`
- People page: only render if role is `admin` or `dispatch` (otherwise redirect to `/`)
- Hide People nav item in `AppSidebar.tsx` for `instructor` and `student` roles

### Step 5: People Page Overhaul

Replace hardcoded data with DB queries:

- **Students tab**: Query profiles joined with user_roles where role = 'student'. Show enrollment status, assigned instructors.
- **Instructors tab**: Query profiles where role = 'instructor'.
- **Admin features**: Role dropdown on each user row (admin only). "Enroll" button on unenrolled students.
- **Enrollment Modal**: Course dropdown (placeholder), Primary Instructor dropdown (from instructor profiles), Secondary Instructor (optional), "Add Documents" placeholder section. On submit: update profile's enrollment_status, primary/secondary instructor, course_id.

### Step 6: Booking Authorization Logic

Update `BookingModal` and booking flow:
- When admin/dispatch/instructor creates a booking: `status = 'authorized'`
- When student creates a booking: `status = 'pending'`
- Show "Awaiting Authorization" badge on pending bookings in the Timeline
- `PendingModal`: admin/dispatch/instructor can approve (set to `authorized`) or deny

### Step 7: useCurrentUser Replacement

Replace the hardcoded `useCurrentUser` hook with the real `useAuth` hook that returns the authenticated user's profile and role from the database.

### Files Summary

| Action | File |
|--------|------|
| Create (migration) | 3 tables, 2 enums, 1 trigger, 1 function, RLS policies, seed data |
| Create | `src/hooks/useAuth.ts` |
| Create | `src/components/AuthGuard.tsx` |
| Create | `src/pages/AuthPage.tsx` |
| Create | `src/components/people/EnrollmentModal.tsx` |
| Modify | `src/App.tsx` -- add auth route, wrap layout with guard |
| Modify | `src/components/AppSidebar.tsx` -- hide People for non-admin/dispatch, add logout |
| Modify | `src/hooks/useCurrentUser.ts` -- use real auth data |
| Modify | `src/pages/PeoplePage.tsx` -- fetch from DB, add role dropdown + enroll button |
| Modify | `src/components/aeroplan/BookingModal.tsx` -- auto-authorize logic |
| Modify | `src/pages/Index.tsx` -- use real user role for booking status |

