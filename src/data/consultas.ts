import type { Club, ClubId, Evento, Jugador, Liga, Partido, TipoTorneo } from './tipos';

// Consultas puras sobre la liga. Ninguna modifica los datos.

export type Resultado = 'G' | 'E' | 'P';

export interface FilaTabla {
  club: ClubId;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  ultimos: Resultado[]; // los últimos 5, el más reciente al final
}

const contado = (p: Partido) => p.estado === 'jugado' && p.goles !== null;

export function calcularTabla(partidos: Partido[], clubes: ClubId[], nombre: (id: ClubId) => string): FilaTabla[] {
  const filas = new Map<ClubId, FilaTabla>();
  for (const c of clubes) filas.set(c, { club: c, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0, ultimos: [] });
  const ordenados = [...partidos].filter(contado).sort((a, b) => a.dia.localeCompare(b.dia));
  for (const p of ordenados) {
    const g = p.goles!;
    const anotar = (c: ClubId, af: number, en: number) => {
      const f = filas.get(c);
      if (!f) return;
      f.pj++;
      f.gf += af;
      f.gc += en;
      const r: Resultado = af > en ? 'G' : af === en ? 'E' : 'P';
      if (r === 'G') {
        f.pg++;
        f.pts += 3;
      } else if (r === 'E') {
        f.pe++;
        f.pts += 1;
      } else f.pp++;
      f.ultimos.push(r);
    };
    anotar(p.local, g.local, g.visitante);
    anotar(p.visitante, g.visitante, g.local);
  }
  const lista = [...filas.values()];
  for (const f of lista) {
    f.dg = f.gf - f.gc;
    f.ultimos = f.ultimos.slice(-5);
  }
  return lista.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || nombre(a.club).localeCompare(nombre(b.club)));
}

// ---------- Memo por referencia de liga ----------
const memos = new WeakMap<Liga, Map<string, unknown>>();
function memo<T>(liga: Liga, clave: string, calcular: () => T): T {
  let m = memos.get(liga);
  if (!m) memos.set(liga, (m = new Map()));
  if (!m.has(clave)) m.set(clave, calcular());
  return m.get(clave) as T;
}

const indices = (liga: Liga) =>
  memo(liga, 'indices', () => ({
    clubes: new Map(liga.clubes.map(c => [c.id, c])),
    jugadores: new Map(liga.jugadores.map(j => [j.id, j])),
    partidos: new Map(liga.partidos.map(p => [p.id, p]))
  }));

export const club = (liga: Liga, id: ClubId): Club => indices(liga).clubes.get(id)!;
export const jugador = (liga: Liga, id: string): Jugador | undefined => indices(liga).jugadores.get(id);
export const partido = (liga: Liga, id: string): Partido | undefined => indices(liga).partidos.get(id);
export const nombreJugador = (j: Jugador) => `${j.nombre} ${j.apellido}`;

export function tabla(liga: Liga, temporada: number, torneo: Exclude<TipoTorneo, 'Final'>): FilaTabla[] {
  return memo(liga, `tabla-${temporada}-${torneo}`, () =>
    {
      const ps = liga.partidos.filter(p => p.temporada === temporada && p.torneo === torneo);
      return calcularTabla(ps, participantesDe(liga, temporada), id => club(liga, id).nombre);
    }
  );
}

// Clubes que jugaron Primera esa temporada (Arena recién desde 2011).
export const participantesDe = (liga: Liga, temporada: number): ClubId[] =>
  memo(liga, `part-${temporada}`, () => {
    const ids = new Set(liga.partidos.filter(p => p.temporada === temporada).flatMap(p => [p.local, p.visitante]));
    return liga.clubes.map(c => c.id).filter(c => ids.has(c));
  });

export function partidosDeFecha(liga: Liga, temporada: number, torneo: TipoTorneo, fecha: number): Partido[] {
  return liga.partidos.filter(p => p.temporada === temporada && p.torneo === torneo && p.fecha === fecha);
}

export const temporadas = (liga: Liga): number[] =>
  memo(liga, 'temporadas', () => [...new Set(liga.partidos.map(p => p.temporada))].sort((a, b) => b - a));

export const fechasDe = (liga: Liga, temporada: number, torneo: TipoTorneo): number =>
  memo(liga, `fechas-${temporada}-${torneo}`, () =>
    Math.max(0, ...liga.partidos.filter(p => p.temporada === temporada && p.torneo === torneo).map(p => p.fecha))
  );

// Dorsal que usaba el jugador en ese club y esa temporada (cambia si pasó por varios clubes).
export function dorsalEn(liga: Liga, id: string, c: ClubId, temporada: number): number | undefined {
  const j = jugador(liga, id);
  const paso = j?.trayectoria.find(x => x.club === c && x.desde <= temporada && (x.hasta === null || x.hasta >= temporada));
  return paso?.dorsal ?? j?.dorsal;
}

export const libreDe = (liga: Liga, temporada: number, torneo: TipoTorneo, fecha: number): ClubId | undefined =>
  liga.libres[`${temporada}-${torneo}-${fecha}`];

export function ultimaFechaJugada(liga: Liga): Partido[] {
  const { temporada, torneo, fecha } = liga.ahora;
  return partidosDeFecha(liga, temporada, torneo, fecha - 1);
}

export function fechaActual(liga: Liga): Partido[] {
  const { temporada, torneo, fecha } = liga.ahora;
  return partidosDeFecha(liga, temporada, torneo, fecha);
}

export function proximaFecha(liga: Liga): Partido[] {
  return fechaActual(liga).filter(p => p.estado === 'programado');
}

export const partidoEnVivo = (liga: Liga): Partido | undefined => liga.partidos.find(p => p.estado === 'en-vivo');

export function plantel(liga: Liga, c: ClubId): Jugador[] {
  const orden = { ARQ: 0, DEF: 1, MED: 2, DEL: 3 } as const;
  return liga.jugadores.filter(j => j.club === c && j.activo).sort((a, b) => orden[a.posicion] - orden[b.posicion] || a.dorsal - b.dorsal);
}

// Capitán: el jugador activo con más años seguidos en el club; desempata el mayor.
export function capitan(liga: Liga, c: ClubId): Jugador | undefined {
  const desde = (j: Jugador) => j.trayectoria[j.trayectoria.length - 1]?.desde ?? 9999;
  return [...plantel(liga, c)].sort((a, b) => desde(a) - desde(b) || a.nacimiento.localeCompare(b.nacimiento) || a.dorsal - b.dorsal)[0];
}

export interface FormacionActual {
  partido: Partido;
  titulares: Jugador[];
  suplentes: Jugador[];
}

// Titulares y suplentes del último partido jugado del club.
export function formacionActual(liga: Liga, c: ClubId): FormacionActual | undefined {
  const p = ultimosPartidos(liga, c, 1)[0];
  const f = p?.formaciones?.[p.local === c ? 'local' : 'visitante'];
  if (!p || !f) return undefined;
  const aJugadores = (ids: string[]) => ids.map(id => jugador(liga, id)).filter((j): j is Jugador => !!j);
  return { partido: p, titulares: aJugadores(f.titulares), suplentes: aJugadores(f.suplentes) };
}

export function partidosDeClub(liga: Liga, c: ClubId, temporada?: number): Partido[] {
  return liga.partidos.filter(p => (p.local === c || p.visitante === c) && (temporada === undefined || p.temporada === temporada));
}

// ---------- Estadísticas de jugador ----------

export interface EstadJugador {
  pj: number;
  titular: number;
  suplenteIngresado: number;
  suplenteSinIngresar: number;
  minutos: number;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
}

const vacia = (): EstadJugador => ({
  pj: 0, titular: 0, suplenteIngresado: 0, suplenteSinIngresar: 0, minutos: 0, goles: 0, asistencias: 0, amarillas: 0, rojas: 0
});

const esGol = (e: Evento) => e.tipo === 'gol' || e.tipo === 'penal';

function acumular(liga: Liga, filtro: (p: Partido) => boolean): Map<string, EstadJugador> {
  const tot = new Map<string, EstadJugador>();
  const de = (id: string) => {
    let e = tot.get(id);
    if (!e) tot.set(id, (e = vacia()));
    return e;
  };
  for (const p of liga.partidos) {
    if (!p.formaciones || !filtro(p)) continue;
    const fin = p.estado === 'en-vivo' ? (p.minuto ?? 90) : 90;
    const salida = new Map<string, number>();
    const entrada = new Map<string, number>();
    for (const e of p.eventos) {
      if (e.tipo === 'cambio') {
        entrada.set(e.jugador, e.minuto);
        if (e.sale) salida.set(e.sale, e.minuto);
      }
      if (e.tipo === 'roja') salida.set(e.jugador, e.minuto);
    }
    for (const lado of [p.formaciones.local, p.formaciones.visitante]) {
      for (const id of lado.titulares) {
        const s = de(id);
        s.pj++;
        s.titular++;
        s.minutos += (salida.get(id) ?? fin) - 0;
      }
      for (const id of lado.suplentes) {
        const s = de(id);
        const m = entrada.get(id);
        if (m === undefined) s.suplenteSinIngresar++;
        else {
          s.pj++;
          s.suplenteIngresado++;
          s.minutos += Math.max(1, (salida.get(id) ?? fin) - m);
        }
      }
    }
    for (const e of p.eventos) {
      if (esGol(e)) {
        de(e.jugador).goles++;
        if (e.asistencia) de(e.asistencia).asistencias++;
      }
      if (e.tipo === 'amarilla') de(e.jugador).amarillas++;
      if (e.tipo === 'roja') de(e.jugador).rojas++;
    }
  }
  return tot;
}

const filtroDe = (temporada?: number, torneo?: TipoTorneo) => (p: Partido) =>
  (temporada === undefined || p.temporada === temporada) && (torneo === undefined || p.torneo === torneo);

export function estadisticasJugador(liga: Liga, id: string, temporada?: number, torneo?: TipoTorneo): EstadJugador {
  const t = memo(liga, `ej-${temporada ?? 'todas'}-${torneo ?? 'todos'}`, () => acumular(liga, filtroDe(temporada, torneo)));
  return t.get(id) ?? vacia();
}

export function estadisticasPorTemporada(liga: Liga, id: string): { temporada: number; club: ClubId | undefined; e: EstadJugador }[] {
  const temporadas = [...new Set(liga.partidos.map(p => p.temporada))].sort();
  return temporadas
    .map(t => {
      const e = estadisticasJugador(liga, id, t);
      const j = jugador(liga, id);
      const paso = j?.trayectoria.find(x => x.desde <= t && (x.hasta === null || x.hasta >= t));
      return { temporada: t, club: paso?.club, e };
    })
    .filter(r => r.club || r.e.pj > 0);
}

export interface Ranking {
  jugador: Jugador;
  valor: number;
}

function ranking(liga: Liga, temporada: number, torneo: TipoTorneo | undefined, campo: keyof EstadJugador, n: number): Ranking[] {
  return memo(liga, `rk-${temporada}-${torneo ?? 'todos'}-${campo}-${n}`, () => {
    const t = memo(liga, `ej-${temporada}-${torneo ?? 'todos'}`, () => acumular(liga, filtroDe(temporada, torneo)));
    return [...t.entries()]
      .filter(([, e]) => e[campo] > 0)
      .map(([id, e]) => ({ jugador: jugador(liga, id)!, valor: e[campo] }))
      .filter(r => r.jugador)
      .sort((a, b) => b.valor - a.valor || a.jugador.apellido.localeCompare(b.jugador.apellido))
      .slice(0, n);
  });
}

export const goleadores = (liga: Liga, temporada: number, torneo?: TipoTorneo, n = 10) => ranking(liga, temporada, torneo, 'goles', n);
export const asistidores = (liga: Liga, temporada: number, torneo?: TipoTorneo, n = 10) => ranking(liga, temporada, torneo, 'asistencias', n);
export const amonestados = (liga: Liga, temporada: number, torneo?: TipoTorneo, n = 10) => ranking(liga, temporada, torneo, 'amarillas', n);
export const expulsados = (liga: Liga, temporada: number, torneo?: TipoTorneo, n = 10) => ranking(liga, temporada, torneo, 'rojas', n);
export const masMinutos = (liga: Liga, temporada: number, torneo?: TipoTorneo, n = 10) => ranking(liga, temporada, torneo, 'minutos', n);

export function vallaMenosVencida(liga: Liga, temporada: number, torneo: Exclude<TipoTorneo, 'Final'>) {
  return [...tabla(liga, temporada, torneo)]
    .filter(f => f.pj > 0)
    .map(f => ({ club: f.club, gc: f.gc, pj: f.pj, promedio: f.gc / f.pj }))
    .sort((a, b) => a.promedio - b.promedio);
}

export function fairPlay(liga: Liga, temporada: number, torneo?: TipoTorneo) {
  const tot = new Map<ClubId, { amarillas: number; rojas: number }>();
  for (const c of liga.clubes) tot.set(c.id, { amarillas: 0, rojas: 0 });
  for (const p of liga.partidos.filter(filtroDe(temporada, torneo)))
    for (const e of p.eventos) {
      const t = tot.get(e.club)!;
      if (e.tipo === 'amarilla') t.amarillas++;
      if (e.tipo === 'roja') t.rojas++;
    }
  return [...tot.entries()]
    .map(([c, t]) => ({ club: c, ...t, puntos: t.amarillas + t.rojas * 3 }))
    .sort((a, b) => a.puntos - b.puntos);
}

export function estadisticasClub(liga: Liga, c: ClubId, temporada: number) {
  const ps = partidosDeClub(liga, c, temporada).filter(contado);
  let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0, vallas = 0;
  for (const p of ps) {
    const loc = p.local === c;
    const a = loc ? p.goles!.local : p.goles!.visitante;
    const b = loc ? p.goles!.visitante : p.goles!.local;
    gf += a;
    gc += b;
    if (b === 0) vallas++;
    if (a > b) pg++;
    else if (a === b) pe++;
    else pp++;
  }
  const amarillas = ps.flatMap(p => p.eventos).filter(e => e.club === c && e.tipo === 'amarilla').length;
  const rojas = ps.flatMap(p => p.eventos).filter(e => e.club === c && e.tipo === 'roja').length;
  return { pj: ps.length, pg, pe, pp, gf, gc, vallas, amarillas, rojas };
}

export function historialEntre(liga: Liga, a: ClubId, b: ClubId) {
  const partidos = liga.partidos
    .filter(p => contado(p) && ((p.local === a && p.visitante === b) || (p.local === b && p.visitante === a)))
    .sort((x, y) => y.dia.localeCompare(x.dia));
  let ganadosA = 0, empates = 0, ganadosB = 0, golesA = 0, golesB = 0;
  for (const p of partidos) {
    const ga = p.local === a ? p.goles!.local : p.goles!.visitante;
    const gb = p.local === a ? p.goles!.visitante : p.goles!.local;
    golesA += ga;
    golesB += gb;
    if (ga > gb) ganadosA++;
    else if (ga < gb) ganadosB++;
    else empates++;
  }
  return { partidos, ganadosA, empates, ganadosB, golesA, golesB };
}

export function titulosPorClub(liga: Liga) {
  const t = new Map<ClubId, number[]>();
  for (const c of liga.campeones) t.set(c.campeon, [...(t.get(c.campeon) ?? []), c.anio]);
  return liga.clubes
    .map(c => ({ club: c.id, anios: t.get(c.id) ?? [] }))
    .sort((a, b) => b.anios.length - a.anios.length || club(liga, a.club).nombre.localeCompare(club(liga, b.club).nombre));
}

export function ultimosPartidos(liga: Liga, c: ClubId, n = 5): Partido[] {
  return partidosDeClub(liga, c)
    .filter(contado)
    .sort((a, b) => b.dia.localeCompare(a.dia))
    .slice(0, n);
}

export function proximoPartido(liga: Liga, c: ClubId): Partido | undefined {
  return partidosDeClub(liga, c)
    .filter(p => p.estado !== 'jugado')
    .sort((a, b) => a.dia.localeCompare(b.dia))[0];
}

export const resultadoPara = (p: Partido, c: ClubId): Resultado | null => {
  if (!p.goles) return null;
  const a = p.local === c ? p.goles.local : p.goles.visitante;
  const b = p.local === c ? p.goles.visitante : p.goles.local;
  return a > b ? 'G' : a === b ? 'E' : 'P';
};

// ---------- Búsqueda ----------

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export type ResultadoBusqueda =
  | { tipo: 'club'; club: Club }
  | { tipo: 'jugador'; jugador: Jugador }
  | { tipo: 'partido'; partido: Partido };

export function buscar(liga: Liga, texto: string): ResultadoBusqueda[] {
  const q = normalizar(texto.trim());
  if (q.length < 2) return [];
  const palabras = q.split(/\s+/);
  const coincide = (s: string) => {
    const n = normalizar(s);
    return palabras.every(p => n.includes(p));
  };
  const out: ResultadoBusqueda[] = [];
  for (const c of liga.clubes) if (coincide(`${c.nombre} ${c.corto} ${c.localidad}`)) out.push({ tipo: 'club', club: c });
  for (const j of liga.jugadores)
    if (coincide(`${j.nombre} ${j.apellido} ${j.apodo ?? ''} ${club(liga, j.club).corto}`)) out.push({ tipo: 'jugador', jugador: j });
  if (out.length < 20) {
    const temp = liga.ahora.temporada;
    for (const p of liga.partidos.filter(p => p.temporada === temp)) {
      if (coincide(`${club(liga, p.local).nombre} ${club(liga, p.visitante).nombre} ${club(liga, p.local).corto} ${club(liga, p.visitante).corto}`))
        out.push({ tipo: 'partido', partido: p });
      if (out.length >= 20) break;
    }
  }
  return out.slice(0, 20);
}

// ---------- Marcador de arriba ----------

export function tickerPartidos(liga: Liga): Partido[] {
  const actual = fechaActual(liga);
  const vivo = actual.filter(p => p.estado === 'en-vivo');
  const jugadosHoy = actual.filter(p => p.estado === 'jugado');
  const anterior = ultimaFechaJugada(liga);
  const programados = actual.filter(p => p.estado === 'programado');
  return [...vivo, ...jugadosHoy, ...programados, ...anterior];
}
