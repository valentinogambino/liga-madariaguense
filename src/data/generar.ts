import { crearAzar, type Azar } from './azar';
import { CLUBES } from './clubes';
import { calcularTabla } from './consultas';
import { APELLIDOS, APODOS, ARBITROS, EXTRANJEROS, HISTORIAS, LUGARES, NOMBRES } from './textos';
import type {
  Campeonato, Club, ClubId, Evento, Formacion, Jugador, Liga, Partido, Posicion, Sancion, TipoTorneo
} from './tipos';

// Genera toda la liga de la demo a partir de una semilla. Determinista: misma semilla, mismos datos.
// Momento congelado: Clausura 2026, fecha 9 (dos jugados el sábado, uno en vivo al minuto 67, tres programados).

// Detalle partido a partido desde 2000; antes, solo el campeón de cada año (desde 1990).
const PRIMERA_TEMPORADA = 2000;
const TEMPORADAS = Array.from({ length: 2026 - PRIMERA_TEMPORADA + 1 }, (_, i) => PRIMERA_TEMPORADA + i);
// Año desde el que cada club juega Primera (si no figura, desde antes de 2000).
const AFILIACION: Partial<Record<ClubId, number>> = { arena: 2011, golf: 1998 };
const juegaEn = (c: ClubId, anio: number) => anio >= (AFILIACION[c] ?? 0);
const clubesDe = (anio: number) => CLUBES.map(c => c.id).filter(c => juegaEn(c, anio));
const ACTUAL = { temporada: 2026, torneo: 'Clausura' as const, fecha: 9 };
const MINUTO_VIVO = 67;
const CLASICO: [ClubId, ClubId] = ['cosme', 'racing'];
const NEUTRAL = 'Estadio Carlos Gesell';

// Fuerza base de cada club (1 = promedio). Los históricos ganadores, arriba.
const FUERZA: Record<ClubId, number> = {
  cosme: 1.32, 'san-lorenzo': 1.25, racing: 1.22, pinamar: 1.15, 'villa-gesell': 1.05, arena: 1.08, juventud: 0.98,
  'san-vicente': 0.97, leon: 0.92, golf: 0.95, clan: 0.86, valeria: 0.84, 'nuevo-amanecer': 0.82
};

// ---------- Fechas del calendario ----------

const dosDig = (n: number) => String(n).padStart(2, '0');
function primerSabado(anio: number, mes: number): Date {
  const d = new Date(Date.UTC(anio, mes - 1, 1));
  while (d.getUTCDay() !== 6) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}
const sumarDias = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
const iso = (d: Date, hora: string) => `${d.getUTCFullYear()}-${dosDig(d.getUTCMonth() + 1)}-${dosDig(d.getUTCDate())}T${hora}`;

function inicioTorneo(anio: number, torneo: 'Apertura' | 'Clausura'): Date {
  // Apertura desde marzo; Clausura de modo que la fecha 9 de 2026 caiga el fin de semana del 31/10.
  return torneo === 'Apertura' ? primerSabado(anio, 3) : sumarDias(primerSabado(anio, 9), 0);
}

// ---------- Fixture: método del círculo con 13 clubes + «libre» ----------

type Cruce = [ClubId, ClubId];
interface Ronda { cruces: Cruce[]; libre: ClubId | null }

function fixture(az: Azar, clubes: ClubId[]): Ronda[] {
  const ids: (ClubId | null)[] = az.mezclar(clubes);
  if (ids.length % 2) ids.push(null);
  const n = ids.length;
  const rondas: Ronda[] = [];
  for (let r = 0; r < n - 1; r++) {
    const cruces: Cruce[] = [];
    let libre: ClubId | null = null;
    for (let i = 0; i < n / 2; i++) {
      const a = ids[i]!;
      const b = ids[n - 1 - i]!;
      if (a === null || b === null) libre = (a ?? b) as ClubId;
      else cruces.push((r + i) % 2 === 0 ? [a, b] : [b, a]);
    }
    rondas.push({ cruces, libre });
    const ultimo = ids.pop()!;
    ids.splice(1, 0, ultimo);
  }
  return rondas;
}

// ---------- Jugadores: planteles que cambian año a año ----------

const DORSALES: Record<Posicion, number[]> = {
  ARQ: [1, 12, 25],
  DEF: [2, 3, 4, 6, 13, 14, 15, 22, 24],
  MED: [5, 8, 10, 16, 18, 20, 23, 26, 28],
  DEL: [7, 9, 11, 17, 19, 21, 27, 29, 30]
};
const CUPO: [Posicion, number][] = [['ARQ', 2], ['DEF', 7], ['MED', 7], ['DEL', 6]];

interface Interno extends Jugador { nivel: number; nac: number }
type Planteles = Map<number, Map<ClubId, Interno[]>>;

// Simula los planteles de 2000 a 2026: cada temporada algunos se retiran, otros se van de la liga o pasan a otro
// club, y los huecos se llenan con pases o con juveniles. El plantel de 2026 queda en 22 por club.
function simularPlanteles(az: Azar): { jugadores: Interno[]; planteles: Planteles } {
  const usados = new Set<string>();
  const jugadores: Interno[] = [];
  const lugares = LUGARES.map(([l, p]) => ({ l, p }));
  const roster = new Map<ClubId, Interno[]>();
  const planteles: Planteles = new Map();

  const persona = (pos: Posicion, nac: number): Interno => {
    let nombre: string, apellido: string;
    do {
      nombre = az.elegir(NOMBRES);
      apellido = az.elegir(APELLIDOS);
    } while (usados.has(`${nombre} ${apellido}`));
    usados.add(`${nombre} ${apellido}`);
    const [lugar, nacionalidad] = az.chance(0.05) ? az.elegir(EXTRANJEROS) : [az.ponderado(lugares, x => x.p).l, 'Argentina'];
    const j: Interno = {
      id: `j${String(jugadores.length + 1).padStart(4, '0')}`,
      nombre,
      apellido,
      apodo: az.chance(0.15) ? az.elegir(APODOS) : undefined,
      dorsal: 0,
      posicion: pos,
      nacimiento: `${nac}-${dosDig(az.entero(1, 12))}-${dosDig(az.entero(1, 28))}`,
      lugarNacimiento: lugar,
      nacionalidad,
      club: 'cosme',
      activo: true,
      trayectoria: [],
      nivel: az(),
      nac
    };
    jugadores.push(j);
    return j;
  };
  const dorsalLibre = (club: ClubId, pos: Posicion) => {
    const ocupados = new Set((roster.get(club) ?? []).map(j => j.dorsal));
    const propios = DORSALES[pos].filter(d => !ocupados.has(d));
    if (propios.length) return az.elegir(propios);
    return az.elegir(Array.from({ length: 30 }, (_, i) => i + 1).filter(d => !ocupados.has(d)));
  };
  const unir = (j: Interno, club: ClubId, anio: number) => {
    j.dorsal = dorsalLibre(club, j.posicion);
    j.club = club;
    j.trayectoria.push({ club, desde: anio, hasta: null, dorsal: j.dorsal });
    roster.get(club)!.push(j);
  };
  const salir = (j: Interno, anio: number) => {
    j.trayectoria.at(-1)!.hasta = anio - 1;
    roster.set(j.club, roster.get(j.club)!.filter(x => x !== j));
  };

  for (const anio of TEMPORADAS) {
    const pase: Interno[] = [];
    for (const c of clubesDe(anio)) {
      if (!roster.has(c)) {
        // Plantel inicial (2000, o el año en que el club entra a Primera).
        roster.set(c, []);
        for (const [pos, cant] of CUPO)
          for (let k = 0; k < cant; k++) {
            const j = persona(pos, anio - az.entero(17, 34));
            // Algunos traían un paso previo por otro club de la liga.
            if (anio === PRIMERA_TEMPORADA && az.chance(0.25)) {
              const otro = az.elegir(CLUBES.filter(x => x.id !== c && juegaEn(x.id, 1995)).map(x => x.id));
              const desde = Math.max(j.nac + 18, 1992);
              if (desde < anio - 1) j.trayectoria.push({ club: otro, desde, hasta: az.entero(desde, anio - 1) });
            }
            unir(j, c, anio);
            const previo = j.trayectoria.at(-2);
            j.trayectoria.at(-1)!.desde =
              previo?.hasta != null ? previo.hasta + 1 : Math.min(anio, Math.max(j.nac + 17, anio - az.entero(0, 6)));
          }
        continue;
      }
      for (const j of [...roster.get(c)!]) {
        const edad = anio - j.nac;
        const retiro = edad >= 37 ? 0.85 : edad >= 34 ? 0.3 : 0.015;
        if (az.chance(retiro) || az.chance(0.035)) salir(j, anio);
        else if (az.chance(0.07)) {
          salir(j, anio);
          pase.push(j);
        }
      }
    }
    // Completar cupos: primero con jugadores que cambian de club, después con juveniles.
    for (const c of az.mezclar(clubesDe(anio))) {
      for (const [pos, cant] of CUPO) {
        while (roster.get(c)!.filter(j => j.posicion === pos).length < cant) {
          const idx = pase.findIndex(j => j.posicion === pos && j.trayectoria.at(-1)!.club !== c);
          if (idx >= 0 && az.chance(0.7)) unir(pase.splice(idx, 1)[0]!, c, anio);
          else unir(persona(pos, anio - az.entero(17, 20)), c, anio);
        }
      }
    }
    planteles.set(anio, new Map([...roster.entries()].map(([c, js]) => [c, [...js]])));
  }
  for (const j of jugadores) j.activo = j.trayectoria.at(-1)!.hasta === null;
  return { jugadores, planteles };
}

// ---------- Partido ----------

// Rendimiento según la edad: pico entre los 25 y los 30.
const forma = (j: Interno, anio: number) => j.nivel - Math.abs(anio - j.nac - 27.5) * 0.04;

function formacion(az: Azar, plantel: Interno[], anio: number): Formacion {
  const por = (p: Posicion) =>
    plantel
      .filter(j => j.posicion === p)
      .map(j => ({ j, v: forma(j, anio) + az() * 0.5 }))
      .sort((a, b) => b.v - a.v)
      .map(x => x.j);
  const arq = por('ARQ');
  const def = por('DEF');
  const med = por('MED');
  const del = por('DEL');
  const esquema = az.elegir([[4, 4, 2], [4, 3, 3], [4, 4, 2], [3, 5, 2]] as const);
  const titulares = [arq[0]!, ...def.slice(0, esquema[0]), ...med.slice(0, esquema[1]), ...del.slice(0, esquema[2])];
  const resto = az.mezclar(plantel.filter(j => !titulares.includes(j) && j.posicion !== 'ARQ'));
  return { titulares: titulares.map(j => j.id), suplentes: [arq[1]!.id, ...resto.slice(0, 6).map(j => j.id)] };
}

interface Lado { club: ClubId; f: Formacion; plantel: Map<string, Interno> }

function jugarPartido(az: Azar, local: Lado, visita: Lado, goles: [number, number], probRoja: number): Evento[] {
  const eventos: Evento[] = [];
  const preparar = (lado: Lado) => {
    // Cambios: 3 a 5, después del entretiempo.
    const n = az.entero(3, 5);
    const salen = az.mezclar(lado.f.titulares.slice(1)).slice(0, n);
    const entran = lado.f.suplentes.slice(1, 1 + n);
    const minutos = Array.from({ length: n }, () => az.entero(46, 88)).sort((a, b) => a - b);
    const cambios = salen.map((s, i) => ({ sale: s, entra: entran[i]!, minuto: minutos[i]! }));
    return { cambios, rojas: new Map<string, number>() };
  };
  const pl = preparar(local);
  const pv = preparar(visita);
  const enCancha = (lado: Lado, info: ReturnType<typeof preparar>, m: number) => {
    const fuera = new Set(info.cambios.filter(c => c.minuto <= m).map(c => c.sale));
    const dentro = info.cambios.filter(c => c.minuto <= m).map(c => c.entra);
    return [...lado.f.titulares.filter(id => !fuera.has(id)), ...dentro].filter(id => {
      const r = info.rojas.get(id);
      return r === undefined || r > m;
    });
  };
  for (const [lado, info] of [[local, pl], [visita, pv]] as const)
    for (const c of info.cambios) eventos.push({ tipo: 'cambio', minuto: c.minuto, club: lado.club, jugador: c.entra, sale: c.sale });

  // Rojas: el expulsado no puede haber sido reemplazado después; se elige entre los que terminan en cancha.
  for (const [lado, info] of [[local, pl], [visita, pv]] as const) {
    if (!az.chance(probRoja)) continue;
    const m = az.entero(20, 89);
    const candidatos = enCancha(lado, info, 90).filter(id => id !== lado.f.titulares[0] && enCancha(lado, info, m).includes(id));
    if (!candidatos.length) continue;
    const id = az.elegir(candidatos);
    info.rojas.set(id, m);
    eventos.push({ tipo: 'roja', minuto: m, club: lado.club, jugador: id });
  }

  const peso = (lado: Lado) => (id: string) => {
    const pos = lado.plantel.get(id)?.posicion;
    return pos === 'DEL' ? 6 : pos === 'MED' ? 3 : pos === 'DEF' ? 1 : 0.02;
  };
  const anotarGoles = (lado: Lado, info: ReturnType<typeof preparar>, rival: Lado, rinfo: ReturnType<typeof preparar>, cant: number) => {
    for (let i = 0; i < cant; i++) {
      const m = az.entero(1, 90);
      if (az.chance(0.03)) {
        const enContra = enCancha(rival, rinfo, m);
        eventos.push({ tipo: 'en-contra', minuto: m, club: lado.club, jugador: az.elegir(enContra) });
        continue;
      }
      const presentes = enCancha(lado, info, m);
      const autor = az.ponderado(presentes, peso(lado));
      const penal = az.chance(0.1);
      const posibles = presentes.filter(id => id !== autor);
      const asistencia = !penal && az.chance(0.6) && posibles.length ? az.ponderado(posibles, id => (lado.plantel.get(id)?.posicion === 'MED' ? 3 : 1)) : undefined;
      eventos.push({ tipo: penal ? 'penal' : 'gol', minuto: m, club: lado.club, jugador: autor, ...(asistencia ? { asistencia } : {}) });
    }
  };
  anotarGoles(local, pl, visita, pv, goles[0]);
  anotarGoles(visita, pv, local, pl, goles[1]);

  // Amarillas: 3 a 4 en promedio, una por jugador.
  const amonestados = new Set<string>();
  const cantAm = az.poisson(3.4);
  for (let i = 0; i < cantAm; i++) {
    const [lado, info] = az.chance(0.5) ? [local, pl] : [visita, pv];
    const m = az.entero(5, 90);
    const presentes = enCancha(lado, info, m).filter(id => !amonestados.has(id) && !info.rojas.has(id));
    if (!presentes.length) continue;
    const id = az.elegir(presentes);
    amonestados.add(id);
    eventos.push({ tipo: 'amarilla', minuto: m, club: lado.club, jugador: id });
  }
  const orden: Record<Evento['tipo'], number> = { gol: 0, penal: 0, 'en-contra': 0, amarilla: 1, roja: 2, cambio: 3 };
  return eventos.sort((a, b) => a.minuto - b.minuto || orden[a.tipo] - orden[b.tipo]);
}

const golesDe = (evs: Evento[], c: ClubId) => evs.filter(e => e.club === c && (e.tipo === 'gol' || e.tipo === 'penal' || e.tipo === 'en-contra')).length;

// ---------- Campeones históricos ----------

function campeonesHistoricos(az: Azar): Campeonato[] {
  // 1990-1999: solo campeón y subcampeón (no hay detalle de partidos).
  const bolsa = az.mezclar<ClubId>([
    'cosme', 'cosme', 'racing', 'racing', 'san-lorenzo', 'san-lorenzo', 'pinamar', 'villa-gesell', 'juventud', 'san-vicente'
  ]);
  return bolsa.map((campeon, i) => {
    const anio = 1990 + i;
    const otros = CLUBES.filter(c => c.id !== campeon && juegaEn(c.id, anio) && c.id !== 'golf');
    return { anio, campeon, subcampeon: az.ponderado(otros, c => FUERZA[c.id] ** 3).id };
  });
}

// ---------- Liga completa ----------

export function generarLiga(semilla = 2026): Liga {
  const az = crearAzar(semilla);
  const clubes: Club[] = CLUBES.map(c => ({ ...c, estadio: { ...c.estadio }, colores: { ...c.colores }, historia: HISTORIAS[c.id] }));
  const { jugadores, planteles } = simularPlanteles(az);
  const mapas = new Map<string, Map<string, Interno>>();
  const plantelDe = (anio: number, c: ClubId) => planteles.get(anio)!.get(c)!;
  const mapaDe = (anio: number, c: ClubId) => {
    const k = `${anio}-${c}`;
    if (!mapas.has(k)) mapas.set(k, new Map(plantelDe(anio, c).map(j => [j.id, j])));
    return mapas.get(k)!;
  };
  // Fuerza de cada club por temporada: paseo aleatorio que vuelve a su base, para que haya ciclos y campeones distintos.
  const fuerzaAnual = new Map<string, number>();
  for (const c of CLUBES) {
    let desvio = 0;
    for (const anio of TEMPORADAS) {
      desvio = desvio * 0.8 + (az() - 0.5) * 0.28;
      const novato = c.id === 'arena' && anio < 2014 ? 0.85 : 1;
      fuerzaAnual.set(`${anio}-${c.id}`, FUERZA[c.id] * Math.exp(desvio) * novato);
    }
  }

  const partidos: Partido[] = [];
  const libres: Record<string, ClubId> = {};
  const campeones = campeonesHistoricos(az);
  const nombre = (id: ClubId) => clubes.find(c => c.id === id)!.nombre;
  let pendientesEnVivo: Evento[] = [];
  let campeonAperturaActual: ClubId | undefined;

  const crearPartido = (
    temporada: number, torneo: TipoTorneo, fecha: number, dia: string, local: ClubId, visitante: ClubId,
    estado: Partido['estado'], cancha?: string
  ): Partido => {
    const id = `${temporada}-${torneo.toLowerCase()}-${dosDig(fecha)}-${local}-${visitante}`;
    const base = { id, temporada, torneo, fecha, dia, local, visitante, cancha: cancha ?? clubes.find(c => c.id === local)!.estadio.nombre };
    if (estado === 'programado') return { ...base, estado, goles: null, eventos: [], formaciones: null };
    const ajuste = 1 + (az() - 0.5) * 0.2;
    const fl = fuerzaAnual.get(`${temporada}-${local}`)! * ajuste;
    const fv = fuerzaAnual.get(`${temporada}-${visitante}`)! * (2 - ajuste);
    const gl = az.poisson(Math.min(3.2, 1.3 * (fl / fv) ** 1.4));
    const gv = az.poisson(Math.min(3.0, 1.0 * (fv / fl) ** 1.4));
    const L: Lado = { club: local, f: formacion(az, plantelDe(temporada, local), temporada), plantel: mapaDe(temporada, local) };
    const V: Lado = { club: visitante, f: formacion(az, plantelDe(temporada, visitante), temporada), plantel: mapaDe(temporada, visitante) };
    const tarde = temporada === ACTUAL.temporada && torneo === ACTUAL.torneo && fecha >= ACTUAL.fecha - 1;
    let eventos = jugarPartido(az, L, V, [gl, gv], tarde ? 0.3 : 0.09);
    if (torneo === 'Final' && golesDe(eventos, local) === golesDe(eventos, visitante)) {
      // Una final no termina empatada: gol en el descuento del que mejor juega ese día.
      const gana = az.chance(fl / (fl + fv)) ? L : V;
      const autor = gana.f.titulares[gana.f.titulares.length - 1]!;
      eventos = [...eventos, { tipo: 'gol', minuto: 90, club: gana.club, jugador: autor }];
    }
    let minuto: number | undefined;
    if (estado === 'en-vivo') {
      minuto = MINUTO_VIVO;
      pendientesEnVivo = eventos.filter(e => e.minuto > MINUTO_VIVO);
      eventos = eventos.filter(e => e.minuto <= MINUTO_VIVO);
    }
    return {
      ...base, estado, eventos, minuto,
      goles: { local: golesDe(eventos, local), visitante: golesDe(eventos, visitante) },
      formaciones: { local: L.f, visitante: V.f },
      arbitro: az.elegir(ARBITROS)
    };
  };

  for (const temporada of TEMPORADAS) {
    const participantes = clubesDe(temporada);
    const rondas = fixture(az, participantes);
    let campeonApertura: ClubId | undefined;
    let campeonClausura: ClubId | undefined;
    for (const torneo of ['Apertura', 'Clausura'] as const) {
      let orden = rondas.map((r, i) => ({ ...r, i }));
      if (torneo === 'Clausura') {
        orden = orden.map(r => ({ ...r, cruces: r.cruces.map(([a, b]) => [b, a] as Cruce) }));
        if (temporada === ACTUAL.temporada) {
          // El clásico va en vivo en la fecha 9, con Cosme de local.
          const k = orden.findIndex(r => r.cruces.some(c => c.includes(CLASICO[0]) && c.includes(CLASICO[1])));
          [orden[8], orden[k]] = [orden[k]!, orden[8]!];
          orden[8]!.cruces = orden[8]!.cruces.map(c => (c.includes(CLASICO[0]) && c.includes(CLASICO[1]) ? CLASICO : c));
        }
      }
      const inicio = inicioTorneo(temporada, torneo);
      orden.forEach((ronda, idx) => {
        const fecha = idx + 1;
        if (ronda.libre) libres[`${temporada}-${torneo}-${fecha}`] = ronda.libre;
        const sabado = sumarDias(inicio, idx * 7);
        const domingo = sumarDias(sabado, 1);
        const cruces = [...ronda.cruces].sort((a, b) => {
          const ca = a.includes(CLASICO[0]) && a.includes(CLASICO[1]) ? -1 : 0;
          const cb = b.includes(CLASICO[0]) && b.includes(CLASICO[1]) ? -1 : 0;
          return ca - cb;
        });
        const esActual = temporada === ACTUAL.temporada && torneo === ACTUAL.torneo;
        cruces.forEach(([local, visitante], k) => {
          let estado: Partido['estado'] = 'jugado';
          let dia: string;
          if (esActual && fecha === ACTUAL.fecha) {
            // k=0 es el clásico, en vivo el domingo; k=1,2 jugados el sábado; el resto, domingo más tarde.
            if (k === 0) { estado = 'en-vivo'; dia = iso(domingo, '15:30'); }
            else if (k <= 2) dia = iso(sabado, k === 1 ? '15:30' : '16:30');
            else { estado = 'programado'; dia = iso(domingo, ['17:00', '17:30', '18:00'][k - 3]!); }
          } else {
            if (esActual && fecha > ACTUAL.fecha) estado = 'programado';
            dia = k < 2 ? iso(sabado, k === 0 ? '15:30' : '16:30') : iso(domingo, ['15:30', '16:00', '16:30', '17:00'][k - 2]!);
          }
          partidos.push(crearPartido(temporada, torneo, fecha, dia, local, visitante, estado));
        });
      });
      const tablaFinal = calcularTabla(
        partidos.filter(p => p.temporada === temporada && p.torneo === torneo), participantes, nombre
      );
      const terminado = !(temporada === ACTUAL.temporada && torneo === ACTUAL.torneo);
      if (terminado) {
        if (torneo === 'Apertura') campeonApertura = tablaFinal[0]!.club;
        else campeonClausura = tablaFinal[0]!.club;
      }
    }
    if (campeonApertura && campeonClausura) {
      let campeon = campeonApertura;
      let subcampeon = campeonClausura;
      if (campeonApertura !== campeonClausura) {
        const ultima = partidos.filter(p => p.temporada === temporada && p.torneo === 'Clausura').at(-1)!;
        const dia = iso(sumarDias(new Date(`${ultima.dia.slice(0, 10)}T00:00:00Z`), 7), '17:00');
        const final = crearPartido(temporada, 'Final', 1, dia, campeonApertura, campeonClausura, 'jugado', NEUTRAL);
        partidos.push(final);
        const g = final.goles!;
        campeon = g.local > g.visitante ? final.local : final.visitante;
        subcampeon = campeon === final.local ? final.visitante : final.local;
      } else {
        const t = calcularTabla(partidos.filter(p => p.temporada === temporada && p.torneo !== 'Final'), participantes, nombre);
        subcampeon = t.find(f => f.club !== campeon)!.club;
      }
      campeones.push({ anio: temporada, campeon, subcampeon, apertura: campeonApertura, clausura: campeonClausura });
    } else if (campeonApertura) {
      campeonAperturaActual = campeonApertura;
    }
  }

  partidos.sort((a, b) => a.dia.localeCompare(b.dia) || a.id.localeCompare(b.id));

  const sanciones = calcularSanciones(az, partidos);
  const ahora = { ...ACTUAL, libre: libres[`${ACTUAL.temporada}-${ACTUAL.torneo}-${ACTUAL.fecha}`]! };
  const publicos: Jugador[] = jugadores.map(({ nivel, nac, ...j }) => (void nivel, void nac, j));
  return { clubes, jugadores: publicos, partidos, campeones, sanciones, ahora, libres, pendientesEnVivo, campeonAperturaActual };
}

function calcularSanciones(az: Azar, partidos: Partido[]): Sancion[] {
  const clausura = partidos.filter(p => p.temporada === ACTUAL.temporada && p.torneo === ACTUAL.torneo && p.estado === 'jugado');
  const out: Sancion[] = [];
  const amarillas = new Map<string, number>();
  for (const p of clausura) {
    for (const e of p.eventos) {
      if (e.tipo === 'amarilla') {
        const n = (amarillas.get(e.jugador) ?? 0) + 1;
        amarillas.set(e.jugador, n);
        if (n % 5 === 0 && p.fecha >= ACTUAL.fecha - 1) out.push({ jugador: e.jugador, club: e.club, motivo: 'acumulacion', fechas: 1, desde: p.id });
      }
      if (e.tipo === 'roja' && p.fecha >= ACTUAL.fecha - 1)
        out.push({ jugador: e.jugador, club: e.club, motivo: 'roja', fechas: az.entero(1, 3), desde: p.id });
    }
  }
  return out;
}
