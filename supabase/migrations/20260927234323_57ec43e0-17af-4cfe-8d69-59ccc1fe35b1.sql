CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL CHECK (platform IN ('shopee', 'enjoei', 'doces')),
  detail text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  qty integer NOT NULL DEFAULT 1 CHECK (qty > 0),
  price numeric(14,2) NOT NULL,
  cost numeric(14,2) NOT NULL,
  profit numeric(14,2) NOT NULL,
  margin numeric(10,4) NOT NULL,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read sales" ON public.sales FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Owners create sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Owners edit sales" ON public.sales FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Owners delete sales" ON public.sales FOR DELETE TO authenticated USING (user_id = (select auth.uid()));
CREATE INDEX sales_user_date_idx ON public.sales (user_id, date DESC, created_at DESC);
CREATE OR REPLACE FUNCTION public.set_sales_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER set_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.set_sales_updated_at();