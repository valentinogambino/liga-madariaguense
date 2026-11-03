import { useId } from 'react';
import { club } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { ClubId } from '../data/tipos';

const RAYAS = ['racing', 'clan', 'villa-gesell', 'san-lorenzo'];
const MITAD = ['cosme', 'valeria'];

const claro = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150;
};

// Silueta de jugador con la camiseta del club y el dorsal; las fotos reales llegan en la versión real.
export function Silueta({ clubId, dorsal, tam = 120 }: { clubId: ClubId; dorsal: number; tam?: number }) {
  const c = club(LIGA, clubId);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { primario, secundario } = c.colores;
  const rayas = RAYAS.includes(clubId);
  const mitad = MITAD.includes(clubId);
  const tinta = claro(rayas ? secundario : primario) ? '#111' : '#fff';
  return (
    <svg
      viewBox="0 0 120 140"
      width={tam}
      height={(tam * 140) / 120}
      role="img"
      aria-label={`Silueta con la camiseta ${dorsal} de ${c.nombre}`}
    >
      <defs>
        <clipPath id={`cam-${id}`}>
          <path d="M28 70 L44 58 Q60 66 76 58 L92 70 L104 98 L90 104 L86 92 L86 140 L34 140 L34 92 L30 104 L16 98 Z" />
        </clipPath>
        <linearGradient id={`luz-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="34" r="20" fill="#2a382f" />
      <path d="M51 50 h18 v12 h-18z" fill="#2a382f" />
      <g clipPath={`url(#cam-${id})`}>
        <rect x="0" y="50" width="120" height="90" fill={rayas ? secundario : primario} />
        {rayas && [24, 44, 64, 84].map(x => <rect key={x} x={x} y="50" width="10" height="90" fill={primario} />)}
        {mitad && <rect x="60" y="50" width="60" height="90" fill={secundario} />}
        {!rayas && !mitad && <rect x="0" y="62" width="120" height="6" fill={secundario} opacity="0.85" />}
        <rect x="0" y="50" width="120" height="90" fill={`url(#luz-${id})`} />
      </g>
      <text
        x="60"
        y="120"
        textAnchor="middle"
        fontFamily="'Big Shoulders Display', Impact, sans-serif"
        fontWeight="800"
        fontSize="34"
        fill={tinta}
        stroke={tinta === '#fff' ? 'rgb(0 0 0 / .4)' : 'none'}
        strokeWidth="1"
      >
        {dorsal}
      </text>
    </svg>
  );
}
