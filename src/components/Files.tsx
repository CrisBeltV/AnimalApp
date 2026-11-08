import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { MAX_BYTES, pickFiles, sizeLabel } from '../lib/files';
import type { Source } from '../lib/files';
import { colors } from '../lib/theme';
import type { Attachment } from '../lib/types';
import { Icon } from './Icon';
import { Button, T } from './ui';

// Documentos de un registro: fotos y PDF (fórmulas, radiografías, exámenes).
// Un cuadro con "+" para agregar, y cada documento abre para verlo, compartirlo o quitarlo.
export function Files({
  files,
  onChange,
  photoOnly,
  readOnly,
}: {
  files: Attachment[];
  onChange: (f: Attachment[]) => void;
  photoOnly?: boolean;
  readOnly?: boolean; // solo ver y compartir: sin agregar ni quitar
}) {
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<Attachment | null>(null);
  const [problem, setProblem] = useState('');

  const add = async (source: Source) => {
    setAdding(false);
    setProblem('');
    const { added, rejected } = await pickFiles(source);
    if (added.length) onChange(photoOnly ? added.slice(-1) : [...files, ...added]);
    if (rejected.length) setProblem(`No se pudo guardar: ${rejected.join(', ')}. Cada archivo puede pesar hasta ${sizeLabel(MAX_BYTES)}.`);
  };

  const share = (f: Attachment) =>
    Sharing.shareAsync(f.uri, { mimeType: f.type === 'pdf' ? 'application/pdf' : 'image/jpeg' }).catch(() => {});

  return (
    <View style={{ gap: 8 }}>
      <View style={s.grid}>
        {files.map((f) => (
          <Pressable key={f.id} accessibilityLabel={f.name} onPress={() => setOpen(f)} style={s.tile}>
            {f.type === 'image' ? (
              <Image source={{ uri: f.uri }} style={s.fill} resizeMode="cover" />
            ) : (
              <>
                <Icon name="lista" size={26} color={colors.accent} />
                <T.Black style={{ fontSize: 12, color: colors.accent }}>PDF</T.Black>
                <T.Muted numberOfLines={2} style={{ fontSize: 11, textAlign: 'center' }}>
                  {f.name}
                </T.Muted>
              </>
            )}
          </Pressable>
        ))}
        {!readOnly && !(photoOnly && files.length > 0) && (
          <Pressable accessibilityLabel={photoOnly ? 'Agregar foto' : 'Agregar documento'} onPress={() => setAdding(true)} style={[s.tile, s.add]}>
            <Icon name="mas" size={30} color={colors.accent} />
          </Pressable>
        )}
      </View>
      {problem ? <T.Muted style={{ fontSize: 13, color: colors.lostText }}>{problem}</T.Muted> : null}

      <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}>
        <Pressable style={s.backdrop} onPress={() => setAdding(false)}>
          <View style={s.sheet}>
            <Button label="Tomar foto" onPress={() => add('camara')} />
            <Button label="Elegir de la galería" kind="secondary" onPress={() => add('galeria')} />
            {!photoOnly && <Button label="Elegir un PDF u otro archivo" kind="secondary" onPress={() => add('archivo')} />}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(null)}>
          {open && (
            <Pressable style={s.sheet} onPress={() => {}}>
              {open.type === 'image' ? (
                <Image source={{ uri: open.uri }} style={s.preview} resizeMode="contain" />
              ) : (
                <View style={[s.preview, { alignItems: 'center', justifyContent: 'center', gap: 6, height: 140 }]}>
                  <Icon name="lista" size={40} color={colors.accent} />
                  <T.Black style={{ textAlign: 'center' }}>{open.name}</T.Black>
                </View>
              )}
              <T.Muted style={{ fontSize: 12, textAlign: 'center' }}>{[open.name, sizeLabel(open.size)].filter(Boolean).join(' · ')}</T.Muted>
              {Platform.OS !== 'web' && <Button label={open.type === 'pdf' ? 'Abrir o compartir' : 'Compartir'} onPress={() => share(open)} />}
              {!readOnly && (
              <Button
                label="Quitar"
                kind="lost"
                onPress={() => {
                  onChange(files.filter((x) => x.id !== open.id));
                  setOpen(null);
                }}
              />
              )}
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.blueOutline,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: 6,
    overflow: 'hidden',
  },
  add: { borderStyle: 'dashed', borderWidth: 2 },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,37,64,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: colors.card, borderRadius: 28, padding: 20, gap: 12 },
  preview: { width: '100%', height: 320, borderRadius: 16, backgroundColor: colors.bg },
});
