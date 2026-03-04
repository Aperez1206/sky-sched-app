

## Authentication, Invite System, and Landing Page

### Overview

There is currently no authentication in the app — `useCurrentUser` is hardcoded. This plan adds: (1) a public landing page, (2) login/signup flow, (3) admin invite system via an edge function, and (4) an "Add Member" button on the People page.

### 1. Database Changes

**`member_invites` table** — tracks pending invitations:
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| email | text | invitee email |
| full_name | text | invitee name |
| role | app_role | student/instructor/admin/dispatch |
| course_id | uuid nullable | FK → courses, for student enrollment |
| invited_by | uuid | FK → profiles (admin) |
| status | text | 'pending' / 'accepted' |
| created_at | timestamptz | default now() |

RLS: admin can read/insert/update; no public access.

**Update `handle_new_user` trigger**: Check `member_invites` by email on signup — if a matching invite exists, use its role (instead of defaulting to 'student') and mark invite as 'accepted'. If the invite includes a `course_id`, auto-create a `course_enrollments` row.

### 2. Edge Function: `invite-member`

An edge function that uses the Supabase service role to call `supabase.auth.admin.inviteUserByEmail()`. This sends the user an email with a magic link to set their password.

- Accepts: `{ email, full_name, role, course_id? }`
- Validates the caller is an admin (checks JWT + `has_role`)
- Inserts a row into `member_invites`
- Calls `admin.inviteUserByEmail(email, { data: { full_name, role } })`
- Returns success/error

### 3. Landing Page (`/landing` → becomes new `/`)

A public marketing page for the app with:
- Hero section explaining the flight school management platform
- Feature highlights (scheduling, dispatch, billing, course tracking)
- "Log In" button linking to `/login`
- Clean, professional design matching the existing card/rounded style

### 4. Auth Pages

**`/login`** — email + password login form. Redirects to `/schedule` on success.

**`/reset-password`** — password reset flow (required for invite magic links).

No public signup — users can only join via admin invite.

### 5. Auth Guard

**`AuthGuard` component** — wraps the `AppLayout` route. Uses `supabase.auth.onAuthStateChange` + `getSession`. Redirects unauthenticated users to `/login`.

**Update `useCurrentUser`** — replace hardcoded data with real auth session. Fetch profile + role from database.

### 6. Route Changes

| Route | Component | Auth |
|-------|-----------|------|
| `/` | LandingPage | Public |
| `/login` | LoginPage | Public |
| `/reset-password` | ResetPasswordPage | Public |
| `/schedule` | Index (current `/`) | Protected |
| `/dashboard` | DashboardPage | Protected |
| `/people` | PeoplePage | Protected |
| All others | Same as now | Protected |

Update `AppSidebar` — Schedule link becomes `/schedule`.

### 7. Add Member Modal on People Page

- "Add Member" button in the People page header (visible to admins)
- Dialog with fields: Full Name, Email, Role (select: student/instructor/admin/dispatch), Course (select, shown only when role=student, fetches from `courses` table)
- On submit: calls the `invite-member` edge function
- Shows success toast; refetches people list

### 8. Files to Create/Modify

| File | Action |
|------|--------|
| Migration SQL | Create `member_invites`, update trigger |
| `supabase/functions/invite-member/index.ts` | New edge function |
| `src/pages/LandingPage.tsx` | New — public marketing page |
| `src/pages/LoginPage.tsx` | New — login form |
| `src/pages/ResetPasswordPage.tsx` | New — password reset |
| `src/components/AuthGuard.tsx` | New — session guard wrapper |
| `src/components/people/AddMemberModal.tsx` | New — invite dialog |
| `src/hooks/useCurrentUser.ts` | Rewrite — real auth |
| `src/pages/PeoplePage.tsx` | Add "Add Member" button + modal |
| `src/App.tsx` | Restructure routes (public vs protected) |
| `src/components/AppSidebar.tsx` | Update Schedule link to `/schedule` |
| `src/components/AppLayout.tsx` | Wrap with AuthGuard |
| `src/components/aeroplan/Header.tsx` | Show real user name/role, add logout |

