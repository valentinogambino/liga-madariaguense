import { useSearchParams } from 'react-router';
import { Escudo } from '../componentes/Escudo';
import { FilaPartido } from '../componentes/Partidos';
import { club, libreDe, partidosDeFecha } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { TipoTorneo } from '../data/tipos';
import { diaLargo } from '../lib/formato';

const TEMPORADAS = [2026, 2025, 2024];

export function Fixture() {
  const [params, setParams] = useSearchParams();
  const temporada = Number(params.get('temporada') ?? LIGA.ahora.temporada);
  const torneo = (params.get('torneo') ?? (temporada === LIGA.ahora.temporada ? LIGA.ahora.torneo : 'Clausura')) as TipoTorneo;
  const fecha = Number(params.get('fecha') ?? (temporada === LIGA.ahora.temporada && torneo === LIGA.ahora.torneo ? LIGA.ahora.fecha : 13));
  const cambiar = (cambios: Record<string, string | number>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(cambios)) p.set(k, String(v));
    setParams(p, { replace: true });
  };
  const partidos = partidosDeFecha(LIGA, temporada, torneo, fecha);
  const final = LIGA.partidos.find(p => p.temporada === temporada && p.torneo === 'Final');
  const libre = libreDe(LIGA, temporada, torneo, fecha);
  const dias = [...new Set(partidos.map(p => p.dia.slice(0, 10)))];

  return (
    <div className="pila" style={{ gap: 20 }}>
      <header className="titulo-pagina">
        <span className="etiqueta">Primera · Temporada {temporada}</span>
        <h1>Fixture y resultados</h1>
      </header>

      <div className="filtros">
        <div className="chips" role="group" aria-label="Temporada">
          {TEMPORADAS.map(t => (
            <button key={t} type="button" className="chip" aria-pressed={t === temporada} onClick={() => cambiar({ temporada: t, torneo: 'Apertura', fecha: 1 })}>
              {t}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Torneo">
          {(['Apertura', 'Clausura'] as const).map(t => (
            <button key={t} type="button" className="chip" aria-pressed={t === torneo} onClick={() => cambiar({ torneo: t, fecha: 1 })}>
              {t}
            </button>
          ))}
          {final && (
            <button type="button" className="chip" aria-pressed={torneo === 'Final'} onClick={() => cambiar({ torneo: 'Final', fecha: 1 })}>
              Final
            </button>
          )}
        </div>
        {torneo !== 'Final' && (
          <div className="chips fechas" role="group" aria-label="Fecha">
            {Array.from({ length: 13 }, (_, i) => i + 1).map(f => (
              <button key={f} type="button" className="chip num" aria-pressed={f === fecha} onClick={() => cambiar({ fecha: f })}>
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {dias.map(d => (
        <section key={d} className="pila">
          <h2 className="etiqueta">
            {torneo === 'Final' ? 'Final de la temporada · ' : `Fecha ${fecha} · `}
            {diaLargo(d)}
          </h2>
          <div className="lista">
            {partidos.filter(p => p.dia.startsWith(d)).map(p => (
              <FilaPartido key={p.id} partido={p} />
            ))}
          </div>
        </section>
      ))}
      {libre && torneo !== 'Final' && (
        <p className="nota-libre">
          <Escudo id={libre} tam={18} /> Libre en esta fecha: {club(LIGA, libre).nombre}
        </p>
      )}
      {!partidos.length && <p className="texto-2">No hay partidos para esta selección.</p>}
    </div>
  );
}
