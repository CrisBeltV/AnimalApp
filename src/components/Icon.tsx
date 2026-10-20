import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

// Íconos de línea tomados de la maqueta (24x24).
export type IconName =
  | 'todo'
  | 'actividad'
  | 'comida'
  | 'cuerpo'
  | 'salud'
  | 'animo'
  | 'mascota'
  | 'comunidad'
  | 'huella'
  | 'mas'
  | 'chevronDown'
  | 'chevronRight'
  | 'atras'
  | 'agua'
  | 'deposicion'
  | 'medicamento'
  | 'vacuna'
  | 'cita'
  | 'sintoma'
  | 'camara'
  | 'alerta'
  | 'bandera'
  | 'campana'
  | 'mapa'
  | 'reloj'
  | 'lista'
  | 'estrella'
  | 'usuario'
  | 'ajustes'
  | 'tienda'
  | 'insignia'
  | 'entrar';

export function Icon({
  name,
  size = 24,
  color = '#1F2A3A',
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const p = {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  let body: React.ReactNode;
  switch (name) {
    case 'todo':
      body = (
        <>
          <Rect x={4} y={4} width={7} height={7} rx={2} {...p} />
          <Rect x={13} y={4} width={7} height={7} rx={2} {...p} />
          <Rect x={4} y={13} width={7} height={7} rx={2} {...p} />
          <Rect x={13} y={13} width={7} height={7} rx={2} {...p} />
        </>
      );
      break;
    case 'actividad':
      body = (
        <>
          <Circle cx={6} cy={18} r={2} {...p} />
          <Circle cx={18} cy={6} r={2} {...p} />
          <Path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7" {...p} />
        </>
      );
      break;
    case 'comida':
      body = (
        <>
          <Path d="M3 11h18a9 7 0 0 1-18 0z" {...p} />
          <Path d="M9 7c0-2 2-2 2-4M14 7c0-2 2-2 2-4" {...p} />
        </>
      );
      break;
    case 'cuerpo':
      body = (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={4} {...p} />
          <Path d="M8 11a4 4 0 0 1 8 0" {...p} />
          <Path d="M12 11l2-2" {...p} />
        </>
      );
      break;
    case 'salud':
      body = (
        <>
          <Path d="M20.8 6.6a5 5 0 0 0-8.8-2.4 5 5 0 0 0-8.8 2.4C2.5 11 12 20 12 20s9.5-9 8.8-13.4z" {...p} />
          <Path d="M8 11h2l1-2 2 4 1-2h2" {...p} />
        </>
      );
      break;
    case 'animo':
      body = (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Path d="M8.5 14.5a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01" {...p} />
        </>
      );
      break;
    case 'mascota':
      body = (
        <>
          <Path d="M5 10L4 4l5 3h6l5-3-1 6" {...p} />
          <Path d="M5 10a7 7 0 0 0 14 0" {...p} />
          <Path d="M10 13h.01M14 13h.01" {...p} />
        </>
      );
      break;
    case 'comunidad':
      body = (
        <>
          <Circle cx={9} cy={8} r={3.5} {...p} />
          <Path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" {...p} />
          <Circle cx={17} cy={9} r={2.5} {...p} />
          <Path d="M16 14c3 0 5.5 2 5.5 5" {...p} />
        </>
      );
      break;
    case 'huella':
      body = (
        <>
          <Ellipse cx={12} cy={16} rx={4.6} ry={3.8} fill={color} />
          <Ellipse cx={6} cy={11} rx={2} ry={2.5} fill={color} />
          <Ellipse cx={9.5} cy={7} rx={2} ry={2.6} fill={color} />
          <Ellipse cx={14.5} cy={7} rx={2} ry={2.6} fill={color} />
          <Ellipse cx={18} cy={11} rx={2} ry={2.5} fill={color} />
        </>
      );
      break;
    case 'mas':
      body = <Path d="M12 5v14M5 12h14" {...p} />;
      break;
    case 'chevronDown':
      body = <Path d="M6 9l6 6 6-6" {...p} />;
      break;
    case 'chevronRight':
      body = <Path d="M9 5l7 7-7 7" {...p} />;
      break;
    case 'atras':
      body = <Path d="M15 5l-7 7 7 7" {...p} />;
      break;
    case 'agua':
      body = <Path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" {...p} />;
      break;
    case 'deposicion':
      body = <Path d="M5 19h14a2 2 0 0 0 0-4h-1a2 2 0 0 0 0-4h-1a3 3 0 0 0-3-4l-1-3c-2 2-4 3-4 7H7a2 2 0 0 0 0 4H5a2 2 0 0 0 0 4z" {...p} />;
      break;
    case 'medicamento':
      body = (
        <>
          <Rect x={3} y={8.5} width={18} height={7} rx={3.5} transform="rotate(-45 12 12)" {...p} />
          <Path d="M9.5 9.5l5 5" {...p} />
        </>
      );
      break;
    case 'vacuna':
      body = <Path d="M18 2l4 4M20 4l-9 9M14 6l4 4M7 13l4 4M9 11l-6 6v4h4l6-6" {...p} />;
      break;
    case 'cita':
      body = (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={3} {...p} />
          <Path d="M8 3v4M16 3v4M3 10h18M12 13v5M9.5 15.5h5" {...p} />
        </>
      );
      break;
    case 'sintoma':
      body = (
        <>
          <Path d="M20.8 6.6a5 5 0 0 0-8.8-2.4 5 5 0 0 0-8.8 2.4C2.5 11 12 20 12 20s9.5-9 8.8-13.4z" {...p} />
          <Path d="M12 8v5M12 16h.01" {...p} />
        </>
      );
      break;
    case 'camara':
      body = (
        <>
          <Path d="M4 8h3l2-3h6l2 3h3v11H4z" {...p} />
          <Circle cx={12} cy={13} r={3.5} {...p} />
        </>
      );
      break;
    case 'alerta':
      body = (
        <>
          <Path d="M12 9v4M12 17h.01" {...p} />
          <Path d="M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" {...p} />
        </>
      );
      break;
    case 'bandera':
      body = <Path d="M5 21V4M5 4h11l-2 4 2 4H5" {...p} />;
      break;
    case 'campana':
      body = <Path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4" {...p} />;
      break;
    case 'mapa':
      body = <Path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" {...p} />;
      break;
    case 'reloj':
      body = (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Path d="M12 7v5l3 2" {...p} />
        </>
      );
      break;
    case 'lista':
      body = <Path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" {...p} />;
      break;
    case 'estrella':
      body = <Path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" {...p} />;
      break;
    case 'usuario':
      body = (
        <>
          <Circle cx={12} cy={8} r={4} {...p} />
          <Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" {...p} />
        </>
      );
      break;
    case 'ajustes':
      body = (
        <>
          <Circle cx={12} cy={12} r={3} {...p} />
          <Path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" {...p} />
        </>
      );
      break;
    case 'tienda':
      body = (
        <>
          <Path d="M4 9l1-5h14l1 5" {...p} />
          <Path d="M4 9h16v11H4z" {...p} />
          <Path d="M9 20v-6h6v6" {...p} />
        </>
      );
      break;
    case 'insignia':
      body = (
        <>
          <Circle cx={12} cy={9} r={6} {...p} />
          <Path d="M8.5 14L7 22l5-3 5 3-1.5-8" {...p} />
        </>
      );
      break;
    case 'entrar':
      body = <Path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" {...p} />;
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}
