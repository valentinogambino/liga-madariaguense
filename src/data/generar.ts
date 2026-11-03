import { crearAzar, type Azar } from './azar';
import { CLUBES } from './clubes';
import { calcularTabla } from './consultas';
import { APELLIDOS, APODOS, ARBITROS, EXTRANJEROS, HISTORIAS, LUGARES, NOMBRES } from './textos';
import type {
  Campeonato, Club, ClubId, Evento, Formacion, Jugador, Liga, Partido, Posicion, Sancion, TipoTorneo
} from './tipos';

// Genera toda la liga de la demo a partir de una semilla. Determinista: misma semilla, mismos datos.
// Momento congelado: Clausura 2026, fecha 9 (dos jugados el sábado, uno en vivo al minuto 67, tres programados).

const TEMPORADAS = [2024, 2025, 2026] as const;
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
interface Ronda { cruces: Cruce[]; libre: ClubId }

function fixture(az: Azar): Ronda[] {
  const ids: (ClubId | null)[] = [...az.mezclar(CLUBES.map(c => c.id)), null];
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
    rondas.push({ cruces, libre: libre! });
    const ultimo = ids.pop()!;
    ids.splice(1, 0, ultimo);
  }
  return rondas;
}

// ---------- Jugadores ----------

const DORSALES: Record<Posicion, number[]> = {
  ARQ: [1, 12, 25],
  DEF: [2, 3, 4, 6, 13, 14, 15, 22, 24],
  MED: [5, 8, 10, 16, 18, 20, 23, 26, 28],
  DEL: [7, 9, 11, 17, 19, 21, 27, 29, 30]
};
const CUPO: [Posicion, number][] = [['ARQ', 2], ['DEF', 7], ['MED', 7], ['DEL', 6]];

interface Interno extends Jugador { nivel: number }

function crearJugadores(az: Azar): Interno[] {
  const usados = new Set<string>();
  const out: Interno[] = [];
  const lugares = LUGARES.map(([l, p]) => ({ l, p }));
  for (const c of CLUBES) {
    for (const [pos, cant] of CUPO) {
      const dorsales = az.mezclar(DORSALES[pos]).slice(0, cant).sort((a, b) => a - b);
      for (const dorsal of dorsales) {
        let nombre: string, apellido: string;
        do {
          nombre = az.elegir(NOMBRES);
          apellido = az.elegir(APELLIDOS);
        } while (usados.has(`${nombre} ${apellido}`));
        usados.add(`${nombre} ${apellido}`);
        const veterano = az.chance(0.12);
        const edad = veterano ? az.entero(32, 38) : az.entero(17, 33);
        const anioNac = 2026 - edad;
        const extranjero = az.chance(0.05);
        const [lugar, nacionalidad] = extranjero
          ? az.elegir(EXTRANJEROS)
          : [az.ponderado(lugares, x => x.p).l, 'Argentina'];
        // Trayectoria: veterano de un solo club, o 1-2 pasos previos por otros clubes de la liga.
        const debut = Math.max(anioNac + 17, 2004);
        const trayectoria: Jugador['trayectoria'] = [];
        const pasos = veterano && az.chance(0.6) ? 0 : az.chance(0.3) ? az.entero(1, 2) : 0;
        let desde = debut;
        const otros = az.mezclar(CLUBES.filter(x => x.id !== c.id).map(x => x.id));
        for (let i = 0; i < pasos && desde < 2025; i++) {
          const hasta = Math.min(2025, desde + az.entero(1, 4));
          trayectoria.push({ club: otros[i]!, desde, hasta });
          desde = hasta + 1;
        }
        trayectoria.push({ club: c.id, desde: Math.min(desde, 2026), hasta: null });
        out.push({
          id: `j-${c.id}-${dosDig(dorsal)}`,
          nombre,
          apellido,
          apodo: az.chance(0.15) ? az.elegir(APODOS) : undefined,
          dorsal,
          posicion: pos,
          nacimiento: `${anioNac}-${dosDig(az.entero(1, 12))}-${dosDig(az.entero(1, 28))}`,
          lugarNacimiento: lugar,
          nacionalidad,
          club: c.id,
          trayectoria,
          nivel: az() + (veterano ? 0.15 : 0)
        });
      }
    }
  }
  return out;
}

// ---------- Partido ----------

function formacion(az: Azar, plantel: Interno[]): Formacion {
  const por = (p: Posicion) => az.mezclar(plantel.filter(j => j.posicion === p)).sort((a, b) => b.nivel + az() * 0.5 - (a.nivel + az() * 0.5));
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
  const cuenta: [ClubId, number][] = [
    ['cosme', 7], ['san-lorenzo', 6], ['racing', 5], ['pinamar', 4], ['villa-gesell', 3], ['juventud', 2],
    ['san-vicente', 2], ['leon', 1], ['clan', 1], ['valeria', 1], ['arena', 1], ['golf', 1]
  ];
  const fundacion = new Map(CLUBES.map(c => [c.id, c.fundacion]));
  const anios = Array.from({ length: 34 }, (_, i) => 1990 + i);
  let bolsa = az.mezclar(cuenta.flatMap(([c, n]) => Array<ClubId>(n).fill(c)));
  // Arena y Golf solo pueden ganar después de afiliarse; se les asigna un año válido.
  const puede = (c: ClubId, anio: number) => (c === 'arena' ? anio >= 2012 : c === 'golf' ? anio >= 1999 : true);
  for (let intento = 0; intento < 50 && bolsa.some((c, i) => !puede(c, anios[i]!)); intento++) bolsa = az.mezclar(bolsa);
  for (let i = 0; i < bolsa.length; i++) {
    if (puede(bolsa[i]!, anios[i]!)) continue;
    const j = bolsa.findIndex((c, k) => k > i && puede(bolsa[i]!, anios[k]!) && puede(c, anios[i]!));
    if (j > 0) [bolsa[i], bolsa[j]] = [bolsa[j]!, bolsa[i]!];
  }
  return anios.map((anio, i) => {
    const campeon = bolsa[i]!;
    const otros = CLUBES.filter(c => c.id !== campeon && (fundacion.get(c.id) ?? 0) < anio - 2 && puede(c.id, anio));
    const subcampeon = az.ponderado(otros, c => FUERZA[c.id] ** 3).id;
    return { anio, campeon, subcampeon };
  });
}

// ---------- Liga completa ----------

export function generarLiga(semilla = 2026): Liga {
  const az = crearAzar(semilla);
  const clubes: Club[] = CLUBES.map(c => ({ ...c, estadio: { ...c.estadio }, colores: { ...c.colores }, historia: HISTORIAS[c.id] }));
  const jugadores = crearJugadores(az);
  const planteles = new Map<ClubId, Map<string, Interno>>();
  for (const c of clubes) planteles.set(c.id, new Map(jugadores.filter(j => j.club === c.id).map(j => [j.id, j])));

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
    const ajuste = 1 + (az() - 0.5) * 0.12 * (temporada - 2023);
    const fl = FUERZA[local] * ajuste;
    const fv = FUERZA[visitante] * (2 - ajuste);
    const gl = az.poisson(Math.min(3.2, 1.3 * (fl / fv) ** 1.4));
    const gv = az.poisson(Math.min(3.0, 1.0 * (fv / fl) ** 1.4));
    const L: Lado = { club: local, f: formacion(az, [...planteles.get(local)!.values()]), plantel: planteles.get(local)! };
    const V: Lado = { club: visitante, f: formacion(az, [...planteles.get(visitante)!.values()]), plantel: planteles.get(visitante)! };
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
    const rondas = fixture(az);
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
        libres[`${temporada}-${torneo}-${fecha}`] = ronda.libre;
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
        partidos.filter(p => p.temporada === temporada && p.torneo === torneo), clubes.map(c => c.id), nombre
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
        const t = calcularTabla(partidos.filter(p => p.temporada === temporada && p.torneo !== 'Final'), clubes.map(c => c.id), nombre);
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
  const publicos: Jugador[] = jugadores.map(({ nivel, ...j }) => (void nivel, j));
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
