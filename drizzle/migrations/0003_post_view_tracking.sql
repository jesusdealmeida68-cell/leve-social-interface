-- Contagem de visualizações por publicação, no máximo uma vez a cada 12 horas
-- por pessoa (ou por aparelho, se não tiver sessão iniciada).
--
-- A coluna posts.views já existe desde a 0000. Falta:
--   - uma tabela que lembre a última vez que cada "viewer_key" viu cada
--     publicação, para não contar duas vezes dentro da janela de 12h;
--   - uma função que o cliente chama quando abre a publicação, que decide
--     se conta ou não, e devolve o total atualizado.
--
-- "viewer_key" é o id da conta quando há sessão, ou um id aleatório guardado
-- no aparelho quando não há (ver getViewerKey() em src/lib/leve.ts).

CREATE TABLE IF NOT EXISTS public.post_views (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_key TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, viewer_key)
);

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- Ninguém lê ou escreve esta tabela diretamente: só através da função abaixo.
REVOKE ALL ON public.post_views FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.register_post_view(p_post_id UUID, p_viewer_key TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last TIMESTAMPTZ;
  v_views INTEGER;
BEGIN
  IF p_viewer_key IS NULL OR length(trim(p_viewer_key)) = 0 THEN
    SELECT views INTO v_views FROM public.posts WHERE id = p_post_id;
    RETURN v_views;
  END IF;

  SELECT viewed_at INTO v_last
  FROM public.post_views
  WHERE post_id = p_post_id AND viewer_key = p_viewer_key;

  IF v_last IS NOT NULL AND now() - v_last < INTERVAL '12 hours' THEN
    SELECT views INTO v_views FROM public.posts WHERE id = p_post_id;
    RETURN v_views;
  END IF;

  INSERT INTO public.post_views (post_id, viewer_key, viewed_at)
  VALUES (p_post_id, p_viewer_key, now())
  ON CONFLICT (post_id, viewer_key) DO UPDATE SET viewed_at = now();

  UPDATE public.posts SET views = views + 1 WHERE id = p_post_id
  RETURNING views INTO v_views;

  RETURN v_views;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_post_view(UUID, TEXT) TO anon, authenticated;
