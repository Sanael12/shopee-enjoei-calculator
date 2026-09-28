/*
# Create expenses table for tracking gastos

1. New Tables
- `expenses`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user)
  - `name` (text, not null, default '') — name/description of the expense
  - `qty` (integer, not null, default 1, must be > 0) — quantity
  - `amount` (numeric(14,2), not null) — the expense value (always stored positive; sign is in `is_negative`)
  - `is_negative` (boolean, not null, default true) — true = expense (negative impact), false = positive/credit
  - `date` (date, not null) — when the expense occurred
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
2. Security
- Enable RLS on `expenses`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- 4 separate policies (select/insert/update/delete), scoped to `TO authenticated` with `auth.uid()` ownership checks.
3. Indexes
- `expenses_user_date_idx` on (user_id, date DESC, created_at DESC) for efficient listing.
4. Trigger
- `set_expenses_updated_at` trigger to auto-update `updated_at` on edits.
*/

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL DEFAULT '',
  qty integer NOT NULL DEFAULT 1 CHECK (qty > 0),
  amount numeric(14,2) NOT NULL,
  is_negative boolean NOT NULL DEFAULT true,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners read expenses" ON public.expenses;
CREATE POLICY "Owners read expenses" ON public.expenses FOR SELECT
  TO authenticated USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Owners create expenses" ON public.expenses;
CREATE POLICY "Owners create expenses" ON public.expenses FOR INSERT
  TO authenticated WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Owners edit expenses" ON public.expenses;
CREATE POLICY "Owners edit expenses" ON public.expenses FOR UPDATE
  TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Owners delete expenses" ON public.expenses;
CREATE POLICY "Owners delete expenses" ON public.expenses FOR DELETE
  TO authenticated USING (user_id = (select auth.uid()));

CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON public.expenses (user_id, date DESC, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;

CREATE OR REPLACE FUNCTION public.set_expenses_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_expenses_updated_at();