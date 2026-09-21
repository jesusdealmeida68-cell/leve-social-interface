import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, type Profile } from "./leve";

/** O número de telefone é a credencial; internamente vira um endereço estável. */
export function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@telefone.leve.app`;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "");
}

type AuthValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (input: {
    phone: string;
    password: string;
    username: string;
    name: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setLoading(false);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        queryClient.invalidateQueries();
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);

  const userId = session?.user.id ?? null;

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId!),
    enabled: Boolean(userId),
  });

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile: profile ?? null,
      loading,
      signIn: async (phone, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: phoneToEmail(phone),
          password,
        });
        if (error) throw new Error(translate(error.message));
      },
      signUp: async ({ phone, password, username, name }) => {
        const { error } = await supabase.auth.signUp({
          email: phoneToEmail(phone),
          password,
          options: {
            data: {
              phone: normalizePhone(phone),
              username: username.replace(/^@/, "").toLowerCase(),
              name,
            },
          },
        });
        if (error) throw new Error(translate(error.message));
      },
      signOut: async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
      },
    }),
    [session, profile, loading, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth precisa do AuthProvider.");
  return value;
}

function translate(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("invalid login")) return "Número ou palavra-passe errados.";
  if (text.includes("already registered")) return "Este número já tem conta. Entra em vez disso.";
  if (text.includes("password")) return "A palavra-passe precisa de pelo menos 6 caracteres.";
  if (text.includes("email")) return "Verifica o número de telefone.";
  return "Algo correu mal. Tenta novamente.";
}
