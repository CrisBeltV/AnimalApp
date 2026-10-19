import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { cloudEnabled, supabase } from './supabase';

// Quien eligió "Seguir sin cuenta" usa la app solo en su teléfono.
const SKIP_KEY = 'animaapp:sin-cuenta';

type Result = { error?: string; needsConfirm?: boolean };

type Auth = {
  ready: boolean;
  enabled: boolean;
  session: Session | null;
  email: string | null;
  userId: string | null;
  skipped: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string) => Promise<Result>;
  resetPassword: (email: string) => Promise<Result>;
  signOut: () => Promise<void>;
  continueWithout: () => void;
};

const Ctx = createContext<Auth | null>(null);

// Mensajes de Supabase traducidos para el dueño.
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'El correo o la contraseña no coinciden.';
  if (m.includes('email not confirmed')) return 'Primero confirma tu correo con el enlace que te enviamos.';
  if (m.includes('already registered')) return 'Ese correo ya tiene cuenta. Toca Entrar.';
  if (m.includes('password should be')) return 'La contraseña debe tener al menos 8 caracteres.';
  if (m.includes('rate limit')) return 'Hiciste muchos intentos. Espera unos minutos.';
  if (m.includes('network') || m.includes('fetch')) return 'No hay conexión. Revisa tu internet.';
  return 'Algo salió mal. Intenta de nuevo.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [ready, setReady] = useState(!cloudEnabled);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    Promise.all([supabase.auth.getSession(), AsyncStorage.getItem(SKIP_KEY).catch(() => null)])
      .then(([{ data }, skip]) => {
        if (!alive) return;
        setSession(data.session);
        setSkipped(skip === '1');
      })
      .finally(() => alive && setReady(true));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const auth = useMemo<Auth>(
    () => ({
      ready,
      enabled: cloudEnabled,
      session,
      email: session?.user.email ?? null,
      userId: session?.user.id ?? null,
      skipped,
      signIn: async (email, password) => {
        if (!supabase) return { error: 'La nube aún no está conectada.' };
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        return error ? { error: friendly(error.message) } : {};
      },
      signUp: async (email, password) => {
        if (!supabase) return { error: 'La nube aún no está conectada.' };
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) return { error: friendly(error.message) };
        return { needsConfirm: !data.session };
      },
      resetPassword: async (email) => {
        if (!supabase) return { error: 'La nube aún no está conectada.' };
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        return error ? { error: friendly(error.message) } : {};
      },
      signOut: async () => {
        await supabase?.auth.signOut();
      },
      continueWithout: () => {
        setSkipped(true);
        AsyncStorage.setItem(SKIP_KEY, '1').catch(() => {});
      },
    }),
    [ready, session, skipped],
  );

  return <Ctx.Provider value={auth}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const auth = useContext(Ctx);
  if (!auth) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return auth;
}
