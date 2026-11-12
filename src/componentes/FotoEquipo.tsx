import { formacionActual } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { ClubId } from '../data/tipos';
import { Silueta } from './Silueta';

// Foto del equipo: ilustración con las siluetas de los titulares de la última formación, en dos filas.
export function FotoEquipo({ clubId }: { clubId: ClubId }) {
  const f = formacionActual(LIGA, clubId);
  if (!f) return null;
  const orden = { ARQ: 0, DEF: 1, MED: 2, DEL: 3 } as const;
  const js = [...f.titulares].sort((a, b) => orden[a.posicion] - orden[b.posicion] || a.dorsal - b.dorsal);
  const atras = js.slice(0, 5);
  const frente = js.slice(5);
  return (
    <figure className="foto-equipo">
      <svg className="foto-fondo" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="foto-hinchada" width="14" height="12" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2.2" fill="rgb(255 255 255 / .08)" />
            <circle cx="11" cy="10" r="2.2" fill="rgb(255 255 255 / .05)" />
          </pattern>
          <linearGradient id="foto-tribuna" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--club)" stopOpacity="0.55" />
            <stop offset="1" stopColor="#0b100d" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" fill="#101812" />
        <rect width="400" height="150" fill="url(#foto-tribuna)" />
        <rect width="400" height="150" fill="url(#foto-hinchada)" />
        <g stroke="rgb(255 255 255 / .1)" strokeWidth="1">
          <line x1="0" y1="52" x2="400" y2="52" />
          <line x1="0" y1="100" x2="400" y2="100" />
        </g>
        <rect y="150" width="400" height="75" fill="var(--cesped)" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <rect key={i} x={i * 50} y="150" width="25" height="75" fill="rgb(255 255 255 / .03)" />
        ))}
      </svg>
      <div className="foto-fila atras">
        {atras.map(j => (
          <Silueta key={j.id} clubId={clubId} dorsal={j.dorsal} tam={58} />
        ))}
      </div>
      <div className="foto-fila frente">
        {frente.map(j => (
          <Silueta key={j.id} clubId={clubId} dorsal={j.dorsal} tam={74} />
        ))}
      </div>
      <figcaption>Ilustración · Datos de demostración</figcaption>
    </figure>
  );
}
