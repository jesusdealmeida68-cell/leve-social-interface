CREATE OR REPLACE FUNCTION public.my_verified()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT verified FROM public.profiles WHERE id = auth.uid()), false);
$$;
GRANT EXECUTE ON FUNCTION public.my_verified() TO authenticated;

DROP POLICY IF EXISTS "Cria as proprias publicacoes" ON public.posts;
CREATE POLICY "Cria as proprias publicacoes"
  ON public.posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.my_phone_verified());

CREATE TABLE public.paid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'video',
  status TEXT NOT NULL DEFAULT 'published',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  media_url TEXT,
  media_type TEXT,
  sales INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.paid_items TO authenticated;
GRANT SELECT ON public.paid_items TO anon;
GRANT ALL ON public.paid_items TO service_role;

ALTER TABLE public.paid_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conteudos publicados visiveis" ON public.paid_items
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Ve os proprios conteudos" ON public.paid_items
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Cria conteudo pago com selo" ON public.paid_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id AND public.my_verified());
CREATE POLICY "Edita os proprios conteudos" ON public.paid_items
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Apaga os proprios conteudos" ON public.paid_items
  FOR DELETE TO authenticated USING (auth.uid() = seller_id);

CREATE INDEX paid_items_seller_idx ON public.paid_items (seller_id, created_at DESC);

CREATE TABLE public.paid_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.paid_items(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, buyer_id)
);

GRANT SELECT, INSERT ON public.paid_purchases TO authenticated;
GRANT ALL ON public.paid_purchases TO service_role;

ALTER TABLE public.paid_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ve as proprias compras" ON public.paid_purchases
  FOR SELECT TO authenticated USING (
    auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM public.paid_items i WHERE i.id = item_id AND i.seller_id = auth.uid())
  );
CREATE POLICY "Compra em nome proprio" ON public.paid_purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

CREATE OR REPLACE FUNCTION public.bump_sales()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.paid_items SET sales = sales + 1 WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_purchase_created
AFTER INSERT ON public.paid_purchases
FOR EACH ROW EXECUTE FUNCTION public.bump_sales();