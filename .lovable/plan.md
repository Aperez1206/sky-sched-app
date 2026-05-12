## Admin Tab for School Staff

A new `/admin` route gated to Admin + Dispatch roles, with sub-sections for the full school operations workflow.

### Navigation

- Add **Admin** entry to `AppSidebar` (icon: `Shield`), visible only to admin/dispatch.
- New `/admin` route in `App.tsx` rendering `AdminPage` with tabbed layout.

### Sub-tabs

1. **Admissions** — full pipeline
2. **Subscriptions** — plan management (payment-stub)
3. **Documents** — school library + per-member compliance
4. **Announcements** — broadcast posts
5. **Audit Log** — admin action history
6. **Settings** — school info, branding, defaults

---

### 1. Admissions (full pipeline)

Workflow: `new` → `under_review` → `accepted` / `rejected` → `invited` (auto-creates member_invite).

- **Public application form** at `/apply` (no auth) — collects name, email, phone, course interest, notes, file uploads (transcripts, ID, medical).
- **Admin inbox** — list of applications with status filters, detail drawer showing answers + uploaded docs, status transitions, internal notes.
- **Accept action** auto-creates a `member_invites` row using existing invite system, links applicant → eventual user.

**New tables:**
- `applications` (full_name, email, phone, course_interest, status, notes, internal_notes, reviewed_by, reviewed_at)
- `application_documents` (application_id, name, file_path)
- New storage bucket `application-documents` (private, admin-readable)

### 2. Subscriptions (stub)

Plans like "Hangar Access $200/mo", "Sim Bay $50/mo".

- Admin defines plans (name, price, interval, description).
- Assign plan to a member → creates subscription row with status `active` / `past_due` / `cancelled` and renewal date.
- "Send payment link" button present but disabled with tooltip "Payments coming soon" — wired to a placeholder handler.
- Member dashboard gets a small "My Subscriptions" card showing active plans.

**New tables:**
- `subscription_plans` (name, description, price, interval, active)
- `member_subscriptions` (user_id, plan_id, status, started_at, current_period_end, cancelled_at)

### 3. Documents (both)

Two panes inside the Documents tab:

**a. School Library** — shared docs visible to all authenticated users.
- Categories (handbook, SOP, form, policy, other).
- Optional expiration date with status badge (valid / expiring soon / expired).
- Upload, download, replace, delete (admin only).

**b. Compliance Tracker** — per-member required documents.
- Define document types (Medical Cert, Pilot License, Insurance, Photo ID, etc.) with default validity periods.
- Per-member matrix: who's missing what, who's expiring within 30/60/90 days.
- Click cell → upload/replace doc for that member (reuses existing `user_documents` bucket).
- Compliance summary card on member detail page.

**New tables:**
- `school_documents` (name, category, file_path, expires_at, uploaded_by)
- `document_types` (name, description, default_validity_days, required)
- `user_documents` — extend with `document_type_id`, `expires_at`, `issued_at` columns
- New storage bucket `school-documents` (private, all authenticated read)

### 4. Announcements

- Admin creates posts (title, body, audience: all / students / instructors / dispatch, pinned, expires_at).
- Shown as a card on Dashboard for relevant audience.
- Mark-as-read tracked per user.

**New tables:**
- `announcements` (title, body, audience, pinned, expires_at, created_by)
- `announcement_reads` (announcement_id, user_id, read_at)

### 5. Audit Log

- Captures: invite sent, role changed, application status change, document uploaded/deleted, subscription created, plan edited, announcement posted, settings changed.
- Read-only filterable table (actor, action, target, timestamp, metadata JSON).
- Populated via DB triggers on the relevant tables (cleanest, no app-code coupling).

**New table:**
- `audit_log` (actor_id, action, entity_type, entity_id, metadata jsonb, created_at)

### 6. School Settings

- School info: name, address, phone, logo (upload).
- Branding: primary brand color (stored, not yet wired into theme).
- Defaults: default course for new admissions, default instructor rate, default ground rate.
- Reuses existing `schools` table — extend with `address`, `phone`, `logo_url`, `brand_color`, `default_course_id`, `default_instructor_rate`, `default_ground_rate`.

---

### RLS pattern (all new tables)

- Admin + Dispatch: full management access via `has_role`.
- Authenticated read on `announcements`, `school_documents`, `subscription_plans`.
- Owner read on `member_subscriptions` (own row) + admin/dispatch read all.
- `applications` insert allowed for anon (public form); read/update admin-only.
- `audit_log` insert via triggers only (no direct client writes), admin read.

### File structure

```text
src/pages/
  AdminPage.tsx              (tabbed shell)
  ApplyPage.tsx              (public application form)
src/components/admin/
  AdmissionsTab.tsx
  ApplicationDetailDrawer.tsx
  SubscriptionsTab.tsx
  PlanFormDialog.tsx
  AssignPlanDialog.tsx
  DocumentsTab.tsx
    SchoolLibraryPane.tsx
    ComplianceTrackerPane.tsx
  AnnouncementsTab.tsx
  AuditLogTab.tsx
  SettingsTab.tsx
src/components/dashboard/
  AnnouncementsCard.tsx      (new, shown on DashboardPage)
  MySubscriptionsCard.tsx    (new)
src/hooks/
  useAdminGuard.ts           (redirects non-admin/dispatch)
  useApplications.ts
  useSubscriptions.ts
  useSchoolDocuments.ts
  useComplianceMatrix.ts
  useAnnouncements.ts
  useAuditLog.ts
  useSchoolSettings.ts
```

### Order of implementation

1. Migrations: all new tables, columns, buckets, RLS, audit triggers.
2. Admin shell + sidebar entry + route guard.
3. Documents tab (highest immediate value).
4. Admissions tab + public `/apply` page.
5. Announcements + dashboard card.
6. Subscriptions (stubbed payment).
7. Settings.
8. Audit log viewer.

### Notes

- Public signup stays disabled — admissions accept = generates invite, preserving invite-only rule.
- Payment integration is intentionally deferred; stub buttons make Stripe/Paddle wiring a one-file change later.
- All UI follows existing light-mode design system, Lucide icons, no emojis.
