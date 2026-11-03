import { club } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { ClubId } from '../data/tipos';

export function Escudo({ id, tam = 28, className }: { id: ClubId; tam?: number; className?: string }) {
  const c = club(LIGA, id);
  return (
    <img
      src={c.escudo}
      alt={`Escudo de ${c.nombre}`}
      width={tam}
      height={tam}
      loading="lazy"
      decoding="async"
      className={className}
      style={{ width: tam, height: tam, objectFit: 'contain', flex: 'none' }}
    />
  );
}
