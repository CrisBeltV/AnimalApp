import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Files } from '../components/Files';
import { Chips, DeleteEntry, Input, finish } from '../components/form';
import { BackHeader, Button, T } from '../components/ui';
import { DOC_TYPES } from '../lib/expediente';
import { deleteFiles } from '../lib/files';
import { formatDate, parseDate } from '../lib/health';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import type { Attachment } from '../lib/types';

// Documento suelto del expediente: radiografía, examen, ecografía, fórmula. Primero el archivo.
export default function Documento() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { data, addEntry, updateEntry, removeEntry } = useStore();
  const pet = data.pet!;
  const editing = data.entries.find((e) => e.id === params.id);
  const [files, setFiles] = useState<Attachment[]>(editing?.files ?? []);
  const [tipo, setTipo] = useState(editing?.fields?.tipo ?? 'radiografia');
  const [titulo, setTitulo] = useState(editing?.fields?.titulo ?? '');
  const [fecha, setFecha] = useState(formatDate(editing?.at ?? Date.now()));
  const [nota, setNota] = useState(editing?.fields?.nota ?? '');

  const day = parseDate(fecha);
  const valid = day !== null && (files.length > 0 || nota.trim().length > 0);

  const save = () => {
    if (day === null) return;
    const fields: Record<string, string> = { tipo };
    if (titulo.trim()) fields.titulo = titulo.trim();
    if (nota.trim()) fields.nota = nota.trim();
    const same = new Date(day).toDateString() === new Date().toDateString();
    const at = same ? Date.now() : day + 12 * 3600000;
    const note = titulo.trim() || DOC_TYPES.find((t) => t.id === tipo)?.label;
    const entry = { fields, files, at, note };
    if (editing) {
      updateEntry(editing.id, entry);
      deleteFiles((editing.files ?? []).filter((f) => !files.some((x) => x.id === f.id)));
    } else {
      addEntry({ kind: 'documento', ...entry });
    }
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BackHeader title={editing ? 'Editar documento' : 'Nuevo documento'} subtitle={pet.name} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Files files={files} onChange={setFiles} />
        <Chips options={DOC_TYPES} value={tipo} onChange={setTipo} />
        <Input field={{ key: 'titulo', label: 'Título (opcional)', placeholder: 'Tórax, hemograma…' }} value={titulo} onChange={setTitulo} />
        <Input field={{ key: 'fecha', label: 'Fecha', placeholder: 'DD/MM/AAAA', date: true, required: true }} value={fecha} onChange={setFecha} />
        <Input field={{ key: 'nota', label: 'Notas', placeholder: 'Resultado, indicaciones…', multiline: true }} value={nota} onChange={setNota} />
        <T.Muted style={{ fontSize: 12 }}>El diagnóstico siempre es del veterinario.</T.Muted>
        <Button label={editing ? 'Guardar cambios' : 'Guardar'} kind="solid" disabled={!valid} onPress={save} />
        {editing && <DeleteEntry onDelete={() => (removeEntry(editing.id), finish())} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
