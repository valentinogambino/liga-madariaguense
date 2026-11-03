import { jugador } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { Evento } from '../data/tipos';

export function apellido(id: string) {
  return jugador(LIGA, id)?.apellido ?? '';
}

export function textoGol(e: Evento) {
  const extra = e.tipo === 'penal' ? ' (p)' : e.tipo === 'en-contra' ? ' (e/c)' : '';
  return `${apellido(e.jugador)}${extra}`;
}
