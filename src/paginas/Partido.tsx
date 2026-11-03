import { Link, useParams } from 'react-router';
import { Cancha, TarjetaEnVivo } from '../componentes/EnVivo';
import { textoGol } from '../lib/texto';
import { Escudo } from '../componentes/Escudo';
import { BotonCompartir } from '../componentes/Compartir';
import { SeccionCab } from '../componentes/Partidos';
import { club, dorsalEn, jugador, partido as buscarPartido } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { ClubId, Evento, Formacion, Partido as TPartido } from '../data/tipos';
import { useConVivo } from '../lib/contextoVivo';
import { diaLargo, hora } from '../lib/formato';
import { NoEncontrada } from './NoEncontrada';

const ICONO: Record<Evento['tipo'], string> = { gol: '⚽', penal: '⚽', 'en-contra': '⚽', amarilla: '', roja: '', cambio: '⇄' };

function Linea({ e, p }: { e: Evento; p: TPartido }) {
  const local = e.club === p.local;
  const j = jugador(LIGA, e.jugador);
  const sale = e.sale ? jugador(LIGA, e.sale) : undefined;
  const asis = e.asistencia ? jugador(LIGA, e.asistencia) : undefined;
  const esGol = e.tipo === 'gol' || e.tipo === 'penal' || e.tipo === 'en-contra';
  return (
    <li className={`evento ${local ? 'local' : 'visita'}${esGol ? ' es-gol' : ''}`}>
      <span className="ev-min num">{e.minuto}′</span>
      <span className="ev-icono" aria-hidden="true">
        {e.tipo === 'amarilla' ? <span className="tarjeta-amarilla" /> : e.tipo === 'roja' ? <span className="tarjeta-roja" /> : ICONO[e.tipo]}
      </span>
      <span className="ev-texto">
        {e.tipo === 'cambio' ? (
          <>
            <b>{j?.apellido}</b> por {sale?.apellido}
          </>
        ) : (
          <>
            <Link to={`/jugadores/${e.jugador}`}>
              <b>{esGol ? textoGol(e) : j?.apellido}</b>
            </Link>
            {asis && <span className="texto-2"> · asist. {asis.apellido}</span>}
            {e.tipo === 'amarilla' && <span className="sr"> amonestado</span>}
            {e.tipo === 'roja' && <span className="texto-2"> · expulsado</span>}
          </>
        )}
      </span>
    </li>
  );
}

function Plantilla({ f, clubId, eventos, temporada }: { f: Formacion; clubId: ClubId; eventos: Evento[]; temporada: number }) {
  const c = club(LIGA, clubId);
  const marcas = (id: string) => {
    const evs = eventos.filter(e => e.jugador === id || e.sale === id);
    return evs.map((e, i) =>
      e.tipo === 'amarilla' ? <span key={i} className="tarjeta-amarilla" title="Amarilla" /> :
      e.tipo === 'roja' ? <span key={i} className="tarjeta-roja" title="Roja" /> :
      e.tipo === 'cambio' ? <span key={i} className={`flecha ${e.sale === id ? 'sale' : 'entra'}`} title={e.sale === id ? `Salió ${e.minuto}′` : `Entró ${e.minuto}′`}>{e.sale === id ? '↓' : '↑'}{e.minuto}′</span> :
      e.tipo === 'gol' || e.tipo === 'penal' ? <span key={i} title="Gol">⚽</span> : null
    );
  };
  const fila = (id: string) => {
    const j = jugador(LIGA, id)!;
    return (
      <li key={id}>
        <Link to={`/jugadores/${id}`}>
          <span className="num dorsal">{dorsalEn(LIGA, id, clubId, temporada)}</span>
          <span className="pl-nombre">{j.nombre[0]}. {j.apellido}</span>
          <span className="pl-marcas">{marcas(id)}</span>
        </Link>
      </li>
    );
  };
  return (
    <div className="plantilla" style={{ ['--club' as string]: c.colores.primario }}>
      <h3>
        <Escudo id={clubId} tam={22} /> {c.corto}
      </h3>
      <ul>{f.titulares.map(fila)}</ul>
      <h4 className="etiqueta">Suplentes</h4>
      <ul className="suplentes">{f.suplentes.map(fila)}</ul>
    </div>
  );
}

export function Partido() {
  const { id = '' } = useParams();
  const base = buscarPartido(LIGA, id);
  if (!base) return <NoEncontrada />;
  return <DetallePartido base={base} />;
}

function DetallePartido({ base }: { base: TPartido }) {
  const p = useConVivo(base);
  const L = club(LIGA, p.local);
  const V = club(LIGA, p.visitante);
  const titulo = p.torneo === 'Final' ? `Final ${p.temporada}` : `${p.torneo} ${p.temporada} · Fecha ${p.fecha}`;
  const enJuego = p.estado === 'en-vivo' || base.estado === 'en-vivo';
  return (
    <div className="pila" style={{ gap: 24 }}>
      <header className="titulo-pagina">
        <span className="etiqueta">{titulo}</span>
        <h1 className="sr">
          {L.nombre} contra {V.nombre}
        </h1>
      </header>

      {enJuego ? (
        <TarjetaEnVivo partido={p} />
      ) : (
        <section className="en-vivo-tarjeta" style={{ ['--c-local' as string]: L.colores.primario, ['--c-visita' as string]: V.colores.primario }}>
          <Cancha />
          <span className="ev-tinte local" aria-hidden="true" />
          <span className="ev-tinte visita" aria-hidden="true" />
          <div className="ev-meta">
            <span className="etiqueta">{p.estado === 'jugado' ? 'Final' : 'Programado'}</span>
            <span className="etiqueta">{hora(p.dia)} h</span>
          </div>
          <div className="ev-duelo">
            <Link to={`/clubes/${L.id}`} className="ev-equipo">
              <Escudo id={L.id} tam={64} />
              <b>{L.nombre}</b>
            </Link>
            <div className="ev-resultado num">
              {p.goles ? (
                <>
                  {p.goles.local}
                  <i>:</i>
                  {p.goles.visitante}
                </>
              ) : (
                <i style={{ fontSize: '0.5em' }}>vs</i>
              )}
            </div>
            <Link to={`/clubes/${V.id}`} className="ev-equipo">
              <Escudo id={V.id} tam={64} />
              <b>{V.nombre}</b>
            </Link>
          </div>
        </section>
      )}

      <dl className="datos-partido">
        <div>
          <dt>Día</dt>
          <dd>{diaLargo(p.dia)}</dd>
        </div>
        <div>
          <dt>Cancha</dt>
          <dd>{p.cancha}</dd>
        </div>
        {p.arbitro && (
          <div>
            <dt>Árbitro</dt>
            <dd>{p.arbitro}</dd>
          </div>
        )}
      </dl>

      <div className="acciones">
        {p.goles && <BotonCompartir tipo="partido" id={p.id} />}
        <Link className="boton" to={`/comparar?a=${p.local}&b=${p.visitante}`}>
          Cara a cara
        </Link>
      </div>

      {p.eventos.length > 0 && (
        <section className="pila">
          <SeccionCab titulo="Minuto a minuto" />
          <ol className="eventos tarjeta">
            {[...p.eventos].reverse().map((e, i) => (
              <Linea key={`${e.minuto}-${e.jugador}-${e.tipo}-${i}`} e={e} p={p} />
            ))}
          </ol>
        </section>
      )}

      {p.formaciones && (
        <section className="pila">
          <SeccionCab titulo="Formaciones" />
          <div className="formaciones">
            <Plantilla f={p.formaciones.local} clubId={p.local} eventos={p.eventos} temporada={p.temporada} />
            <Plantilla f={p.formaciones.visitante} clubId={p.visitante} eventos={p.eventos} temporada={p.temporada} />
          </div>
        </section>
      )}
    </div>
  );
}
