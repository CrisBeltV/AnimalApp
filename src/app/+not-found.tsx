import { Redirect } from 'expo-router';

// Cualquier dirección desconocida lleva a Inicio.
export default function NotFound() {
  return <Redirect href="/" />;
}
