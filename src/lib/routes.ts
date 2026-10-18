import { router } from 'expo-router';

import type { Entry, EntryKind } from './types';

// Cada tipo de registro abre su propia ventana. Con id, la ventana abre en modo editar.
function pathFor(kind: EntryKind) {
  if (kind === 'paseo') return '/salida';
  if (kind === 'peso') return '/medidas';
  if (kind === 'alimento') return '/ficha';
  if (kind === 'higiene') return '/higiene';
  if (kind === 'foto') return '/foto-semana';
  if (kind === 'animo') return '/animo';
  if (kind === 'vacuna' || kind === 'medicamento') return '/ficha';
  if (kind === 'veterinario') return '/veterinario';
  if (kind === 'novedad' || kind === 'deposicion' || kind === 'enfermedad' || kind === 'lesion') return '/novedad';
  return '/registro';
}

export function newEntry(kind: EntryKind, replace = false) {
  const go = replace ? router.replace : router.push;
  go({ pathname: pathFor(kind), params: { tipo: kind } });
}

export function openEntry(entry: Entry) {
  router.push({ pathname: pathFor(entry.kind), params: { tipo: entry.kind, id: entry.id } });
}
