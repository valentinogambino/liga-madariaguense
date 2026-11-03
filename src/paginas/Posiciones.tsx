import { useState } from 'react';
import { TablaPosiciones } from '../componentes/Partidos';
import { calcularTabla, club, tabla } from '../data/consultas';
import { LIGA } from '../data/liga';

type Vista = 'Clausura' | 'Apertura' | 'Anual';

export function Posiciones() {
  const [temporada, setTemporada] = useState(LIGA.ahora.temporada);
  const [vista, setVista] = useState<Vista>('Clausura');
  const filas =
    vista === 'Anual'
      ? calcularTabla(
          LIGA.partidos.filter(p => p.temporada === temporada && p.torneo !== 'Final'),
          LIGA.clubes.map(c => c.id),
          id => club(LIGA, id).nombre
        )
      : tabla(LIGA, temporada, vista);
  const campeon = LIGA.campeones.find(c => c.anio === temporada);
  const enCurso = temporada === LIGA.ahora.temporada && vista === LIGA.ahora.torneo;
  return (
    <div className="pila" style={{ gap: 20 }}>
      <header className="titulo-pagina">
        <span className="etiqueta">Primera · Temporada {temporada}</span>
        <h1>Tabla de posiciones</h1>
        <p>
          {enCurso
            ? `En juego: Clausura, fecha ${LIGA.ahora.fecha}. El ganador juega la final con el campeón del Apertura.`
            : vista === 'Anual'
              ? 'Suma de Apertura y Clausura.'
              : 'Torneo terminado.'}
        </p>
      </header>
      <div className="filtros">
        <div className="chips" role="group" aria-label="Temporada">
          {[2026, 2025, 2024].map(t => (
            <button key={t} type="button" className="chip" aria-pressed={t === temporada} onClick={() => setTemporada(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Torneo">
          {(['Clausura', 'Apertura', 'Anual'] as Vista[]).map(v => (
            <button key={v} type="button" className="chip" aria-pressed={v === vista} onClick={() => setVista(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="tarjeta" style={{ padding: '4px 2px' }}>
        <TablaPosiciones filas={filas} resaltar={[filas[0]?.club ?? '']} />
      </div>
      <p className="texto-2">
        Victoria 3 puntos, empate 1. Desempate: diferencia de gol y goles a favor.
        {campeon?.apertura && vista === 'Apertura' && ` Campeón del Apertura: ${club(LIGA, campeon.apertura).nombre}.`}
        {temporada === LIGA.ahora.temporada && vista === 'Apertura' && LIGA.campeonAperturaActual &&
          ` Campeón del Apertura: ${club(LIGA, LIGA.campeonAperturaActual).nombre}.`}
      </p>
    </div>
  );
}
