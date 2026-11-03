import { createContext, useContext } from 'react';
import type { Evento, Partido } from '../data/tipos';

export interface EstadoVivo {
  partido: Partido | undefined;
  ultimoGol: Evento | undefined; // el último que entró durante la sesión, para animarlo
  terminado: boolean;
}

export const Contexto = createContext<EstadoVivo>({ partido: undefined, ultimoGol: undefined, terminado: false });

export const useEnVivo = () => useContext(Contexto);

// Devuelve el partido con el estado en vivo aplicado si es el que se está jugando.
export function useConVivo(p: Partido): Partido {
  const { partido } = useEnVivo();
  return partido && partido.id === p.id ? partido : p;
}
