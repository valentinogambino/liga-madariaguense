import { Link, useParams } from 'react-router';
import { Campanas } from '../componentes/Campanas';
import { Escudo } from '../componentes/Escudo';
import { FilaPartido, Forma, SeccionCab } from '../componentes/Partidos';
import { Silueta } from '../componentes/Silueta';
import {
  estadisticasClub, estadisticasJugador, goleadores, plantel, proximoPartido, resultadoPara, tabla, titulosPorClub, ultimosPartidos
} from '../data/consultas';
import { LIGA } from '../data/liga';
import type { ClubId } from '../data/tipos';
import { POSICIONES } from '../lib/formato';
import { NoEncontrada } from './NoEncontrada';

export function Club() {
  const { id = '' } = useParams();
  const c = LIGA.clubes.find(x => x.id === id);
  if (!c) return <NoEncontrada />;
  const t = LIGA.ahora.temporada;
  const st = estadisticasClub(LIGA, c.id, t);
  const pos = tabla(LIGA, t, 'Clausura').findIndex(f => f.club === c.id) + 1;
  const titulos = titulosPorClub(LIGA).find(x => x.club === c.id)?.anios ?? [];
  const ultimos = ultimosPartidos(LIGA, c.id, 5);
  const proximo = proximoPartido(LIGA, c.id);
  const jugadores = plantel(LIGA, c.id);
  const goleador = goleadores(LIGA, t, undefined, 200).find(g => g.jugador.club === c.id);
  const rivales = LIGA.clubes.filter(x => x.id !== c.id);
  const grupos = (['ARQ', 'DEF', 'MED', 'DEL'] as const).map(p => ({ p, js: jugadores.filter(j => j.posicion === p) }));

  return (
    <div className="pila ficha-club" style={{ gap: 28, ['--club' as string]: c.colores.primario, ['--club-2' as string]: c.colores.secundario }}>
      <header className="club-hero">
        <Escudo id={c.id} tam={120} className="club-hero-escudo" />
        <div className="pila" style={{ gap: 6 }}>
          <span className="etiqueta">{c.localidad} · Fundado en {c.fundacion}</span>
          <h1>{c.nombre}</h1>
          <div className="club-cifras">
            <span>
              <b className="num">{pos}°</b> Clausura
            </span>
            <span>
              <b className="num">{titulos.length}</b> {titulos.length === 1 ? 'título' : 'títulos'}
            </span>
            <span>
              <b className="num">{jugadores.length}</b> jugadores
            </span>
          </div>
        </div>
      </header>

      <div className="grilla-2">
        <div className="pila" style={{ gap: 28 }}>
          {proximo && (
            <section className="pila">
              <SeccionCab titulo={proximo.estado === 'en-vivo' ? 'Jugando ahora' : 'Próximo partido'} />
              <div className="lista">
                <FilaPartido partido={proximo} />
              </div>
            </section>
          )}
          <section className="pila">
            <SeccionCab titulo="Últimos partidos" />
            <div className="lista">
              {ultimos.map(p => (
                <FilaPartido key={p.id} partido={p} mostrarDia />
              ))}
            </div>
            <Forma ultimos={ultimos.map(p => resultadoPara(p, c.id)!).reverse()} />
          </section>

          <section className="pila">
            <SeccionCab titulo={`Plantel ${t}`} />
            {grupos.map(g => (
              <div key={g.p} className="pila" style={{ gap: 8 }}>
                <h3 className="etiqueta">{POSICIONES[g.p]}s</h3>
                <div className="plantel">
                  {g.js.map(j => {
                    const e = estadisticasJugador(LIGA, j.id, t);
                    return (
                      <Link key={j.id} to={`/jugadores/${j.id}`} className="plantel-item">
                        <Silueta clubId={c.id} dorsal={j.dorsal} tam={52} />
                        <span className="pila" style={{ gap: 0, minWidth: 0 }}>
                          <b>{j.apellido}</b>
                          <span className="texto-2">
                            {j.nombre}
                            {j.apodo ? ` «${j.apodo}»` : ''}
                          </span>
                        </span>
                        <span className="plantel-num">
                          <span className="num">{e.pj}</span> PJ
                          {e.goles > 0 && (
                            <>
                              {' · '}
                              <span className="num">{e.goles}</span> G
                            </>
                          )}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </div>

        <div className="pila" style={{ gap: 28 }}>
          <section className="pila">
            <SeccionCab titulo={`Temporada ${t}`} />
            <div className="cifras">
              {[
                ['Partidos', st.pj], ['Ganados', st.pg], ['Empatados', st.pe], ['Perdidos', st.pp],
                ['Goles a favor', st.gf], ['Goles en contra', st.gc], ['Vallas invictas', st.vallas], ['Amarillas', st.amarillas]
              ].map(([k, v]) => (
                <div key={k} className="cifra">
                  <b className="num">{v}</b>
                  <span>{k}</span>
                </div>
              ))}
            </div>
            {goleador && (
              <p className="texto-2">
                Goleador del club en {t}:{' '}
                <Link to={`/jugadores/${goleador.jugador.id}`} style={{ color: 'var(--arena)' }}>
                  {goleador.jugador.nombre} {goleador.jugador.apellido}
                </Link>{' '}
                ({goleador.valor} goles).
              </p>
            )}
          </section>

          <section className="pila">
            <SeccionCab titulo="Estadio" />
            <div className="estadio tarjeta">
              <div className="estadio-foto" aria-hidden="true">
                <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice">
                  <rect width="400" height="180" fill="var(--cesped)" />
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                    <rect key={i} x={i * 50} y="0" width="25" height="180" fill="rgb(255 255 255 / .025)" />
                  ))}
                  <g fill="none" stroke="rgb(255 255 255 / .22)" strokeWidth="1.5">
                    <rect x="20" y="20" width="360" height="140" />
                    <line x1="200" y1="20" x2="200" y2="160" />
                    <circle cx="200" cy="90" r="26" />
                    <rect x="20" y="55" width="44" height="70" />
                    <rect x="336" y="55" width="44" height="70" />
                  </g>
                </svg>
                <Escudo id={c.id} tam={44} className="estadio-escudo" />
              </div>
              <div className="pila" style={{ gap: 2, padding: '12px 14px 14px' }}>
                <b>{c.estadio.nombre}</b>
                <span className="texto-2">{c.estadio.direccion}</span>
                <a
                  className="enlace-arena"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${c.estadio.lat},${c.estadio.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Cómo llegar →
                </a>
              </div>
            </div>
          </section>

          <Campanas clubId={c.id} />

          <section className="pila">
            <SeccionCab titulo="Palmarés" />
            {titulos.length ? (
              <div className="palmares">
                {titulos.map(a => (
                  <span key={a} className="num">
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="texto-2">Todavía sin títulos de Primera.</p>
            )}
          </section>

          <section className="pila">
            <SeccionCab titulo="Historia" />
            <div className="historia">
              {c.historia.split('\n\n').map((par, i) => (
                <p key={i}>{par}</p>
              ))}
            </div>
          </section>

          <section className="pila">
            <SeccionCab titulo="Cara a cara" />
            <div className="chips">
              {rivales.map(r => (
                <Link key={r.id} to={`/comparar?a=${c.id}&b=${r.id as ClubId}`} className="chip chip-escudo">
                  <Escudo id={r.id} tam={18} /> {r.corto}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
