import { useSearchParams } from 'react-router';
import { Escudo } from '../componentes/Escudo';
import { FilaPartido, Forma, SeccionCab } from '../componentes/Partidos';
import { club, estadisticasClub, historialEntre, resultadoPara, tabla, titulosPorClub, ultimosPartidos } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { ClubId } from '../data/tipos';

function Selector({ valor, otro, onCambio, etiqueta }: { valor: ClubId; otro: ClubId; onCambio: (c: ClubId) => void; etiqueta: string }) {
  return (
    <label className="selector-club">
      <Escudo id={valor} tam={64} />
      <span className="sr">{etiqueta}</span>
      <select value={valor} onChange={e => onCambio(e.target.value as ClubId)}>
        {LIGA.clubes.map(c => (
          <option key={c.id} value={c.id} disabled={c.id === otro}>
            {c.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Comparar() {
  const [params, setParams] = useSearchParams();
  const a = (params.get('a') ?? 'cosme') as ClubId;
  const b = (params.get('b') ?? 'racing') as ClubId;
  const valido = (x: string) => LIGA.clubes.some(c => c.id === x);
  const A = valido(a) ? a : 'cosme';
  const B = valido(b) && b !== A ? b : A === 'racing' ? 'cosme' : 'racing';
  const fijar = (x: ClubId, y: ClubId) => setParams({ a: x, b: y }, { replace: true });
  const h = historialEntre(LIGA, A, B);
  const t = LIGA.ahora.temporada;
  const sa = estadisticasClub(LIGA, A, t);
  const sb = estadisticasClub(LIGA, B, t);
  const tab = tabla(LIGA, t, 'Clausura');
  const tit = titulosPorClub(LIGA);
  const filas: [string, number, number, boolean][] = [
    ['Posición Clausura', tab.findIndex(f => f.club === A) + 1, tab.findIndex(f => f.club === B) + 1, false],
    [`Puntos ${t}`, sa.pg * 3 + sa.pe, sb.pg * 3 + sb.pe, true],
    ['Goles a favor', sa.gf, sb.gf, true],
    ['Goles en contra', sa.gc, sb.gc, false],
    ['Vallas invictas', sa.vallas, sb.vallas, true],
    ['Tarjetas', sa.amarillas + sa.rojas, sb.amarillas + sb.rojas, false],
    ['Títulos de Primera', tit.find(x => x.club === A)?.anios.length ?? 0, tit.find(x => x.club === B)?.anios.length ?? 0, true]
  ];
  const total = h.partidos.length || 1;
  return (
    <div className="pila" style={{ gap: 24 }}>
      <header className="titulo-pagina">
        <span className="etiqueta">Historial desde 2000</span>
        <h1>Cara a cara</h1>
      </header>

      <div className="comparar-cab" style={{ ['--ca' as string]: club(LIGA, A).colores.primario, ['--cb' as string]: club(LIGA, B).colores.primario }}>
        <Selector valor={A} otro={B} onCambio={x => fijar(x, B)} etiqueta="Primer club" />
        <span className="num comparar-vs">vs</span>
        <Selector valor={B} otro={A} onCambio={x => fijar(A, x)} etiqueta="Segundo club" />
      </div>

      <section className="pila">
        <SeccionCab titulo="Historial" texto={`${h.partidos.length} partidos`} />
        <div className="historial tarjeta">
          <div className="historial-nums">
            <div>
              <b className="num">{h.ganadosA}</b>
              <span>{club(LIGA, A).corto}</span>
            </div>
            <div>
              <b className="num">{h.empates}</b>
              <span>Empates</span>
            </div>
            <div>
              <b className="num">{h.ganadosB}</b>
              <span>{club(LIGA, B).corto}</span>
            </div>
          </div>
          <div className="historial-barra" aria-hidden="true">
            <span style={{ width: `${(h.ganadosA / total) * 100}%`, background: 'var(--ca)' }} />
            <span style={{ width: `${(h.empates / total) * 100}%`, background: 'var(--empato)' }} />
            <span style={{ width: `${(h.ganadosB / total) * 100}%`, background: 'var(--cb)' }} />
          </div>
          <p className="texto-2" style={{ textAlign: 'center' }}>
            Goles: {h.golesA} a {h.golesB}
          </p>
        </div>
      </section>

      <section className="pila">
        <SeccionCab titulo="Lado a lado" texto={`Temporada ${t}`} />
        <div className="lado-a-lado tarjeta">
          {filas.map(([k, x, y, masEsMejor]) => {
            const mejorA = masEsMejor ? x > y : x < y;
            const mejorB = masEsMejor ? y > x : y < x;
            return (
              <div key={k} className="lal-fila">
                <b className={`num${mejorA ? ' mejor' : ''}`}>{x}</b>
                <span>{k}</span>
                <b className={`num${mejorB ? ' mejor' : ''}`}>{y}</b>
              </div>
            );
          })}
          <div className="lal-fila">
            <Forma ultimos={ultimosPartidos(LIGA, A, 5).map(p => resultadoPara(p, A)!).reverse()} mini />
            <span>Últimos 5</span>
            <Forma ultimos={ultimosPartidos(LIGA, B, 5).map(p => resultadoPara(p, B)!).reverse()} mini />
          </div>
        </div>
      </section>

      <section className="pila">
        <SeccionCab titulo="Últimos enfrentamientos" />
        {h.partidos.length ? (
          <div className="lista">
            {h.partidos.slice(0, 6).map(p => (
              <FilaPartido key={p.id} partido={p} mostrarDia />
            ))}
          </div>
        ) : (
          <p className="texto-2">No se enfrentaron en estas temporadas.</p>
        )}
      </section>
    </div>
  );
}
