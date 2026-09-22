-- Verificação de número (por código), selo de conta e administração
--
-- Duas coisas distintas e independentes:
--   - phone_verified: confirma que o número de telefone é mesmo da pessoa,
--     através do código de 6 dígitos que o admin entrega manualmente.
--   - verified: o "selo" da conta (like um verificado azul), dado à mão
--     pelo admin em "Verificação de conta" — não depende do telefone.

ALTER TABLE public.profiles
  ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN verification_code TEXT;

-- Restringe o acesso direto por coluna: telefone, código de verificação,
-- estado de admin e phone_verified nunca são legíveis por um select comum,
-- mesmo pelo próprio dono da conta. Só as funções abaixo (SECURITY DEFINER)
-- lhes tocam. "verified" (o selo) continua público — é para aparecer no perfil.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, username, name, bio, avatar_url, cover_url, verified, created_at)
  ON public.profiles TO anon, authenticated;

-- Gera um código de 6 dígitos para cada conta nova.
CREATE OR REPLACE FUNCTION public.set_verification_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.verification_code := lpad(floor(random() * 1000000)::text, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_verification_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_verification_code();

-- Impede que um update comum (a pessoa a editar nome/bio/fotos) altere por
-- acidente ou de propósito o estado de admin, o selo, o telefone verificado
-- ou o código.
CREATE OR REPLACE FUNCTION public.protect_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin) THEN
    NEW.is_admin := OLD.is_admin;
    NEW.verified := OLD.verified;
    NEW.phone_verified := OLD.phone_verified;
    NEW.verification_code := OLD.verification_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_admin_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_admin_fields();

-- A própria pessoa confirma o número com o código que o admin lhe entregou.
-- O código só "expira" depois de usado com sucesso (o WHERE phone_verified = false
-- garante que um código já usado nunca mais funciona; sem limite de tempo).
CREATE OR REPLACE FUNCTION public.verify_my_account(code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched BOOLEAN;
BEGIN
  UPDATE public.profiles
  SET phone_verified = true
  WHERE id = auth.uid() AND verification_code = code AND phone_verified = false
  RETURNING true INTO matched;
  RETURN COALESCE(matched, false);
END;
$$;
GRANT EXECUTE ON FUNCTION public.verify_my_account(TEXT) TO authenticated;

-- Para a app saber se o PRÓPRIO utilizador já tem o número verificado
-- (mostra ou esconde o aviso na página de notificações).
CREATE OR REPLACE FUNCTION public.my_phone_verified()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT phone_verified FROM public.profiles WHERE id = auth.uid()), false);
$$;
GRANT EXECUTE ON FUNCTION public.my_phone_verified() TO authenticated;

-- Diz ao cliente se quem está a chamar é administrador (sem expor a coluna is_admin).
CREATE OR REPLACE FUNCTION public.am_i_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;
GRANT EXECUTE ON FUNCTION public.am_i_admin() TO authenticated;

-- Lista todas as contas com os dados de administração (telefone, código,
-- estado de verificação). Só devolve algo se quem chamou for administrador;
-- caso contrário devolve zero linhas.
CREATE OR REPLACE FUNCTION public.admin_list_accounts()
RETURNS TABLE (
  id UUID,
  username TEXT,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  phone_verified BOOLEAN,
  verified BOOLEAN,
  is_admin BOOLEAN,
  verification_code TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.name, p.phone, p.avatar_url, p.phone_verified, p.verified,
         p.is_admin, p.verification_code, p.created_at
  FROM public.profiles p
  WHERE EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.is_admin)
  ORDER BY p.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_accounts() TO authenticated;

-- Área "Verificação de número": o admin também pode marcar/desmarcar à mão.
CREATE OR REPLACE FUNCTION public.admin_set_phone_verified(target_id UUID, next BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin) THEN
    RAISE EXCEPTION 'Apenas administradores podem fazer isto.';
  END IF;
  UPDATE public.profiles SET phone_verified = next WHERE id = target_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_phone_verified(UUID, BOOLEAN) TO authenticated;

-- Área "Verificação de conta": dá ou tira o selo. Independente do telefone.
CREATE OR REPLACE FUNCTION public.admin_set_verified(target_id UUID, next BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin) THEN
    RAISE EXCEPTION 'Apenas administradores podem fazer isto.';
  END IF;
  UPDATE public.profiles SET verified = next WHERE id = target_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_verified(UUID, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_admin(target_id UUID, next BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin) THEN
    RAISE EXCEPTION 'Apenas administradores podem fazer isto.';
  END IF;
  UPDATE public.profiles SET is_admin = next WHERE id = target_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_admin(UUID, BOOLEAN) TO authenticated;

-- Gera um novo código (ex.: se a pessoa perdeu o antigo). Volta a ficar por
-- verificar até usar o código novo.
CREATE OR REPLACE FUNCTION public.admin_regenerate_code(target_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin) THEN
    RAISE EXCEPTION 'Apenas administradores podem fazer isto.';
  END IF;
  new_code := lpad(floor(random() * 1000000)::text, 6, '0');
  UPDATE public.profiles SET verification_code = new_code, phone_verified = false WHERE id = target_id;
  RETURN new_code;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_regenerate_code(UUID) TO authenticated;

-- Para tornar a primeira conta administradora, corre manualmente (uma vez):
-- UPDATE public.profiles SET is_admin = true WHERE username = 'o-teu-username';
