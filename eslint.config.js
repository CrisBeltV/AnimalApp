const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expo,
  prettier,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'supabase/.temp/*', 'src/types/database.ts'],
  },
  {
    // Los errores no se tragan en silencio: se manejan o se registran.
    rules: { 'no-empty': ['error', { allowEmptyCatch: false }] },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
  {
    // Deuda del demo (2026-10-23): estas reglas están en aviso, no en error, mientras el código
    // de Jim sigue en src/app, src/components y src/lib. Al migrar un módulo a src/features
    // las reglas aplican como error. El tope de avisos se fija en el script `lint`.
    files: ['src/app/**', 'src/components/**', 'src/lib/**'],
    rules: {
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/use-memo': 'warn',
      'import/no-duplicates': 'warn',
      'react/no-unescaped-entities': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
]);
