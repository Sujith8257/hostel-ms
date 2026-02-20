# Security Agent: Table + Email Setup

## 1. Why the `security_incidents` table is empty

The table is filled only when you **run the migration in Supabase** and the app uses the **same Supabase project**.

### Step 1: Create the table in Supabase

1. Open your **Supabase project** → **SQL Editor**.
2. Copy the contents of **`migrations/001_security_incidents.sql`** (or the SQL below).
3. Click **Run**.

```sql
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  gate_id TEXT NOT NULL,
  image_path TEXT DEFAULT '',
  confidence_score DOUBLE PRECISION,
  severity TEXT NOT NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.security_incidents IS 'Security agent: log of unauthorized entry attempts and severity';
```

### Step 2: Use the same Supabase project in the app

Your **`face_recognition/.env`** must point to this project:

- `SUPABASE_URL` = your project URL (e.g. `https://xxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` = the **service_role** key (not the anon key)

After this, trigger an **unauthorized** attempt (face not recognized). You should see in the terminal:

- `[security.logger] Incident logged: gate_id=..., severity=...`

If you see `[security.logger] log_incident FAILED: ...` instead, the message will tell you what went wrong (e.g. table does not exist, or RLS blocking).

---

## 2. How to send alert emails to admin

Email is sent only when **all** of these are set.

### In `face_recognition/.env` add:

```env
# Who receives security alerts
ADMIN_EMAIL=your-admin@example.com

# SMTP (use your email provider’s SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

- **Gmail**: Use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password.  
  `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`.
- **Outlook / Microsoft 365**: Usually `SMTP_HOST=smtp.office365.com`, `SMTP_PORT=587`, and your Microsoft account.
- **Other**: Use your provider’s SMTP host and port.

If `ADMIN_EMAIL` or `SMTP_HOST` is missing, the app will log something like:

- `[security.notifier] ADMIN_EMAIL not set; skip email`
- `[security.notifier] SMTP_HOST or admin email not set; skip send`

and **no email will be sent**, but incidents will still be **logged to the database** (once the table exists).

### Optional

- `SMTP_FROM` – Sender address (defaults to `SMTP_USER` if not set).

---

## Quick checklist

| Item | Where | What to do |
|------|--------|------------|
| Table exists | Supabase → SQL Editor | Run `migrations/001_security_incidents.sql` |
| Same project | `face_recognition/.env` | Correct `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |
| Admin email | `face_recognition/.env` | Set `ADMIN_EMAIL` |
| SMTP | `face_recognition/.env` | Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` |

After changing `.env`, restart the app (`python app.py`).

---

## 3. Attendance "marked_by does not exist in profiles table"

When face recognition logs attendance, `marked_by` must be a **profile id** (staff/admin in `profiles`), not a student id.

- **Automatic**: The app uses the **first profile** in `profiles` as the "system" marker. Ensure at least one row exists in `profiles` (e.g. your admin or warden account).
- **Optional**: Set in `face_recognition/.env`:
  ```env
  ATTENDANCE_SYSTEM_PROFILE_ID=<uuid-of-any-profile-row>
  ```
  Use the **id** of a profile from the Supabase `profiles` table (Table Editor → profiles → copy `id`).
