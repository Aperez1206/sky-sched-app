## Export all database data as CSV

Dump every table in the `public` schema to its own CSV file, then bundle them into a single zip artifact you can download.

### Tables included (25)
account_transactions, aircraft_inspections, aircraft_maintenance, announcement_reads, announcements, application_documents, applications, audit_log, course_enrollments, courses, document_types, flight_reservations, flight_sessions, inventory_parts, mechanic_time_logs, member_invites, member_subscriptions, profiles, school_documents, schools, subscription_plans, user_documents, user_roles, work_order_parts, work_orders.

### Steps
1. For each public table, run `COPY (SELECT * FROM <table>) TO STDOUT WITH CSV HEADER` via `psql` and write to `/tmp/export/<table>.csv`.
2. Zip the folder to `/mnt/documents/database_export_2026-06-08.zip`.
3. Deliver via a `presentation-artifact` link.

### Not included
- `auth.*` users (managed by backend; not directly exportable as plain CSV here — let me know if you need an email/id list and I can pull it separately)
- Storage bucket file contents (only DB metadata rows are exported; actual files in `user-documents`, `application-documents`, `school-documents` are not bundled)

Want me to also include a users list (id, email, created_at) from auth, or just the public tables?
