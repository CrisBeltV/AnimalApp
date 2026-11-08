import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { cloudEnabled, supabase } from './supabase';

// Quien eligió "Seguir sin cuenta" usa la app solo en su teléfono.
const SKIP_KEY = 'animaapp:sin-cuenta';
// Mientras la nube no esté conectada, la cuenta vive en este teléfono (correo y huella de la contraseña).
const LOCAL_KEY = 'animaapp:cuenta-local';

type LocalAccount = { email: string; pass: string; signedIn: boolean };

// Huella sencilla para no guardar la contraseña tal cual en el teléfono.
// Cuando la nube se conecte, Supabase guarda las contraseñas de forma segura.
function fingerprint(email: string, password: string) {
  let h = 5381;
  for (const ch of `${email.toLowerCase()}:${password}`) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
  return String(h >>> 0);
}

type Result = { error?: string; needsConfirm?: boolean };

type Auth = {
  ready: boolean;
  enabled: boolean;
  session: Session | null;
  signedIn: boolean; // con cuenta en la nube o en este teléfono
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
  const [local, setLocal] = useState<LocalAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const stored = Promise.all([AsyncStorage.getItem(SKIP_KEY).catch(() => null), AsyncStorage.getItem(LOCAL_KEY).catch(() => null)]);
    Promise.all([supabase ? supabase.auth.getSession() : null, stored])
      .then(([cloud, [skip, acc]]) => {
        if (!alive) return;
        if (cloud) setSession(cloud.data.session);
        setSkipped(skip === '1');
        try {
          setLocal(acc ? (JSON.parse(acc) as LocalAccount) : null);
        } catch {
          setLocal(null);
        }
      })
      .finally(() => alive && setReady(true));
    const sub = supabase?.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      alive = false;
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  const keepLocal = (acc: LocalAccount | null) => {
    setLocal(acc);
    if (acc) AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(acc)).catch(() => {});
    else AsyncStorage.removeItem(LOCAL_KEY).catch(() => {});
  };

  const auth = useMemo<Auth>(
    () => ({
      ready,
      enabled: cloudEnabled,
      session,
      signedIn: !!session || !!local?.signedIn,
      email: session?.user.email ?? (local?.signedIn ? local.email : null),
      userId: session?.user.id ?? null,
      skipped,
      signIn: async (email, password) => {
        if (!supabase) {
          const mail = email.trim().toLowerCase();
          if (!local || local.email !== mail) return { error: 'No hay una cuenta con ese correo en este teléfono. Toca "Crear cuenta nueva".' };
          if (local.pass !== fingerprint(mail, password)) return { error: 'El correo o la contraseña no coinciden.' };
          keepLocal({ ...local, signedIn: true });
          return {};
        }
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        return error ? { error: friendly(error.message) } : {};
      },
      signUp: async (email, password) => {
        if (!supabase) {
          const mail = email.trim().toLowerCase();
          if (local && local.email === mail) return { error: 'Ese correo ya tiene cuenta. Toca Entrar.' };
          keepLocal({ email: mail, pass: fingerprint(mail, password), signedIn: true });
          return {};
        }
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) return { error: friendly(error.message) };
        return { needsConfirm: !data.session };
      },
      resetPassword: async (email) => {
        if (!supabase) return { error: 'Por ahora tu cuenta vive solo en este teléfono y no podemos enviar correos. Cuando conectemos la nube, el enlace llegará a tu correo.' };
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        return error ? { error: friendly(error.message) } : {};
      },
      signOut: async () => {
        await supabase?.auth.signOut();
        if (local) keepLocal({ ...local, signedIn: false });
      },
      continueWithout: () => {
        setSkipped(true);
        AsyncStorage.setItem(SKIP_KEY, '1').catch(() => {});
      },
    }),
    [ready, session, skipped, local],
  );

  return <Ctx.Provider value={auth}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const auth = useContext(Ctx);
  if (!auth) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return auth;
}
