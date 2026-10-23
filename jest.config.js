module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  clearMocks: true,
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  // npm deja expo-modules-core anidado dentro de expo (conflicto de peers opcionales)
  // y el preset de jest-expo lo pide en la raíz. Metro ya lo resuelve; esto es solo para Jest.
  modulePaths: ['<rootDir>/node_modules/expo/node_modules'],
};
