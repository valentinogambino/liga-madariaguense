import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Contexto, type EstadoVivo } from './contextoVivo';
import { LIGA } from '../data/liga';
import { partidoEnVivo } from '../data/consultas';
import type { Evento } from '../data/tipos';

// Simulación del partido en vivo: el reloj arranca en el minuto del modelo y avanza un minuto cada
// SEGUNDOS_POR_MINUTO; los eventos pendientes entran cuando llega su minuto. Al 90 queda «Final».

const SEGUNDOS_POR_MINUTO = 6;
const esGol = (e: Evento) => e.tipo === 'gol' || e.tipo === 'penal' || e.tipo === 'en-contra';

export function ProveedorEnVivo({ children }: { children: ReactNode }) {
  const base = partidoEnVivo(LIGA);
  const [minuto, setMinuto] = useState(base?.minuto ?? 90);
  useEffect(() => {
    if (!base) return undefined;
    const id = window.setInterval(() => setMinuto(m => (m >= 90 ? 90 : m + 1)), SEGUNDOS_POR_MINUTO * 1000);
    return () => window.clearInterval(id);
  }, [base]);

  const valor = useMemo<EstadoVivo>(() => {
    if (!base) return { partido: undefined, ultimoGol: undefined, terminado: false };
    const nuevos = LIGA.pendientesEnVivo.filter(e => e.minuto <= minuto);
    const eventos = [...base.eventos, ...nuevos];
    const goles = {
      local: eventos.filter(e => esGol(e) && e.club === base.local).length,
      visitante: eventos.filter(e => esGol(e) && e.club === base.visitante).length
    };
    const terminado = minuto >= 90;
    return {
      partido: { ...base, eventos, goles, minuto, estado: terminado ? 'jugado' : 'en-vivo' },
      ultimoGol: nuevos.filter(esGol).at(-1),
      terminado
    };
  }, [base, minuto]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

