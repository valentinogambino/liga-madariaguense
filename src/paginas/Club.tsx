import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Campanas } from '../componentes/Campanas';
import { Escudo } from '../componentes/Escudo';
import { FotoEquipo } from '../componentes/FotoEquipo';
import { FilaPartido, Forma, SeccionCab } from '../componentes/Partidos';
import { Silueta } from '../componentes/Silueta';
import {
  capitan, estadisticasClub, estadisticasJugador, goleadores, plantel, proximoPartido, resultadoPara, tabla, titulosPorClub, ultimosPartidos
} from '../data/consultas';
import { LIGA } from '../data/liga';
import type { ClubId } from '../data/tipos';
import { fechaCompleta } from '../lib/formato';
import { NoEncontrada } from './NoEncontrada';

type Panel = 'Temporada' | 'Partidos' | 'Club';

export function Club() {
  const { id = '' } = useParams();
  const [panel, setPanel] = useState<Panel>('Temporada');
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
  const cap = capitan(LIGA, c.id);
  const rivales = LIGA.clubes.filter(x => x.id !== c.id);
  const grupos = [
    { titulo: 'Arqueros', js: jugadores.filter(j => j.posicion === 'ARQ') },
    { titulo: 'Jugadores de campo', js: jugadores.filter(j => j.posicion !== 'ARQ') }
  ];

  return (
    <div className="pila ficha-club" style={{ gap: 18, ['--club' as string]: c.colores.primario, ['--club-2' as string]: c.colores.secundario }}>
      <div className="ficha-arriba">
        <header className="club-hero">
          <Escudo id={c.id} tam={96} className="club-hero-escudo" />
          <div className="pila" style={{ gap: 6 }}>
            <span className="etiqueta">{c.localidad}</span>
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
          <Link to={`/clubes/${c.id}/formacion`} className="boton primario club-hero-boton">
            Formación en cancha →
          </Link>
        </header>
        <FotoEquipo clubId={c.id} />
      </div>

      <div className="destacados">
        <div className="destacado">
          <span className="etiqueta">Fundación</span>
          <b className="num destacado-num">{t - c.fundacion}</b>
          <span className="destacado-sub">años · {fechaCompleta(c.fundacionFecha)}</span>
        </div>
        <div className="destacado">
          <span className="etiqueta">Capitán</span>
          {cap ? (
            <Link to={`/jugadores/${cap.id}`} className="destacado-jugador">
              <span className="destacado-silueta">
                <Silueta clubId={c.id} dorsal={cap.dorsal} tam={44} />
                <i className="brazalete" title="Capitán">
                  C
                </i>
              </span>
              <b>{cap.apellido}</b>
              <span className="destacado-sub">{cap.nombre}</span>
            </Link>
          ) : (
            <span className="destacado-sub">Sin datos</span>
          )}
        </div>
        <div className="destacado">
          <span className="etiqueta">Goleador</span>
          {goleador ? (
            <Link to={`/jugadores/${goleador.jugador.id}`} className="destacado-jugador">
              <span className="destacado-silueta">
                <Silueta clubId={c.id} dorsal={goleador.jugador.dorsal} tam={44} />
                <i className="destacado-goles num">{goleador.valor}</i>
              </span>
              <b>{goleador.jugador.apellido}</b>
              <span className="destacado-sub">
                {goleador.valor} goles en {t}
              </span>
            </Link>
          ) : (
            <span className="destacado-sub">Todavía sin goles en {t}</span>
          )}
        </div>
      </div>

      <section className="pila">
        <SeccionCab titulo={`Plantel ${t}`} />
        {grupos.map(g => (
          <div key={g.titulo} className="pila" style={{ gap: 8 }}>
            <h3 className="etiqueta">
              {g.titulo} · {g.js.length}
            </h3>
            <div className="plantel">
              {g.js.map(j => {
                const e = estadisticasJugador(LIGA, j.id, t);
                return (
                  <Link key={j.id} to={`/jugadores/${j.id}`} className="plantel-item" title={`${j.nombre} ${j.apellido}`}>
                    <Silueta clubId={c.id} dorsal={j.dorsal} tam={40} />
                    <span className="pila" style={{ gap: 0, minWidth: 0 }}>
                      <b>{j.apellido}</b>
                      <span className="plantel-num">
                        {j.posicion} · <span className="num">{e.pj}</span> PJ
                        {e.goles > 0 && (
                          <>
                            {' · '}
                            <span className="num">{e.goles}</span> G
                          </>
                        )}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="chips ficha-pestanas" role="group" aria-label="Más del club">
        {(['Temporada', 'Partidos', 'Club'] as Panel[]).map(v => (
          <button key={v} type="button" className="chip" aria-pressed={v === panel} onClick={() => setPanel(v)}>
            {v}
          </button>
        ))}
      </div>

      {panel === 'Temporada' && (
        <div className="grilla-2">
          <section className="pila">
            <SeccionCab titulo={`Temporada ${t}`} />
            <div className="cifras cifras-4">
              {[
                ['Partidos', st.pj], ['Ganados', st.pg], ['Empatados', st.pe], ['Perdidos', st.pp],
                ['GF', st.gf], ['GC', st.gc], ['Vallas', st.vallas], ['Amarillas', st.amarillas]
              ].map(([k, v]) => (
                <div key={k} className="cifra">
                  <b className="num">{v}</b>
                  <span>{k}</span>
                </div>
              ))}
            </div>
          </section>
          <Campanas clubId={c.id} />
        </div>
      )}

      {panel === 'Partidos' && (
        <div className="grilla-2">
          <div className="pila" style={{ gap: 20 }}>
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
          </div>
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
      )}

      {panel === 'Club' && (
        <div className="grilla-2">
          <div className="pila" style={{ gap: 20 }}>
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
          </div>
          <section className="pila">
            <SeccionCab titulo="Historia" />
            <div className="historia">
              {c.historia.split('\n\n').map((par, i) => (
                <p key={i}>{par}</p>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
