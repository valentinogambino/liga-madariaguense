import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { SelectorTemporada, TablaPosiciones } from '../componentes/Partidos';
import { calcularTabla, club, participantesDe, tabla, temporadas } from '../data/consultas';
import { LIGA } from '../data/liga';

type Vista = 'Clausura' | 'Apertura' | 'Anual';

export function Posiciones() {
  const [params] = useSearchParams();
  const [temporada, setTemporada] = useState(Number(params.get('temporada') ?? LIGA.ahora.temporada));
  const [vista, setVista] = useState<Vista>('Clausura');
  const filas =
    vista === 'Anual'
      ? calcularTabla(
          LIGA.partidos.filter(p => p.temporada === temporada && p.torneo !== 'Final'),
          participantesDe(LIGA, temporada),
          id => club(LIGA, id).nombre
        )
      : tabla(LIGA, temporada, vista);
  const campeon = LIGA.campeones.find(c => c.anio === temporada);
  const enCurso = temporada === LIGA.ahora.temporada && vista === LIGA.ahora.torneo;
  return (
    <div className="pila" style={{ gap: 12 }}>
      <header className="titulo-pagina titulo-linea">
        <h1>Posiciones</h1>
        <span className="etiqueta">Primera · {temporada}</span>
      </header>
      <div className="filtros filtros-fila">
        <SelectorTemporada valor={temporada} temporadas={temporadas(LIGA)} onCambio={setTemporada} />
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
      <p className="texto-2 nota-tabla">
        {enCurso
          ? `En juego: Clausura, fecha ${LIGA.ahora.fecha}. El ganador juega la final con el campeón del Apertura. `
          : vista === 'Anual'
            ? 'Suma de Apertura y Clausura. '
            : 'Torneo terminado. '}
        Tocá un club para ver su formación. Victoria 3 puntos, empate 1. Desempate: diferencia de gol y goles a favor.
        {campeon?.apertura && vista === 'Apertura' && ` Campeón del Apertura: ${club(LIGA, campeon.apertura).nombre}.`}
        {temporada === LIGA.ahora.temporada && vista === 'Apertura' && LIGA.campeonAperturaActual &&
          ` Campeón del Apertura: ${club(LIGA, LIGA.campeonAperturaActual).nombre}.`}
      </p>
    </div>
  );
}
