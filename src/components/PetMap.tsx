import { BarrioMap } from './BarrioMap';
import type { MapMarker, MapViewMode } from './petMapTypes';

// En web MapLibre nativo no corre: se sigue usando el barrio dibujado.
// La vista 2D/3D no aplica al mapa dibujado.
export function PetMap({
  markers,
  controlsBottom,
}: {
  markers: MapMarker[];
  controlsBottom?: number;
  view?: MapViewMode;
  onViewChange?: (view: MapViewMode) => void;
}) {
  return <BarrioMap initialWidth={700} controlsBottom={controlsBottom} markers={markers} />;
}
