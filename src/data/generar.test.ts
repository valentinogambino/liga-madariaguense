import { describe, expect, it } from 'vitest';
import { generarLiga } from './generar';
import { capitan, formacionActual, goleadores, partidoEnVivo, tabla, titulosPorClub } from './consultas';

const liga = generarLiga(2026);
const golesDe = (evs: { tipo: string; club: string }[], c: string) =>
  evs.filter(e => e.club === c && ['gol', 'penal', 'en-contra'].includes(e.tipo)).length;

describe('generarLiga', () => {
  it('es determinista', () => {
    expect(JSON.stringify(generarLiga(2026))).toBe(JSON.stringify(liga));
  });

  it('tiene detalle desde 2000: 12 clubes hasta 2010 y 13 desde que entra Arena', () => {
    for (let t = 2000; t <= 2026; t++)
      for (const torneo of ['Apertura', 'Clausura'] as const) {
        const ps = liga.partidos.filter(p => p.temporada === t && p.torneo === torneo);
        const n = t >= 2011 ? 13 : 12;
        expect(ps).toHaveLength(((n * (n - 1)) / 2) | 0);
        const participantes = liga.clubes.filter(c => t >= 2011 || c.id !== 'arena');
        for (const c of participantes) expect(ps.filter(p => p.local === c.id || p.visitante === c.id)).toHaveLength(n - 1);
      }
  });

  it('las formaciones usan jugadores que estaban en el club esa temporada', () => {
    const porId = new Map(liga.jugadores.map(j => [j.id, j]));
    for (const p of liga.partidos.filter((_, i) => i % 7 === 0)) {
      if (!p.formaciones) continue;
      for (const [club, f] of [[p.local, p.formaciones.local], [p.visitante, p.formaciones.visitante]] as const)
        for (const id of [...f.titulares, ...f.suplentes]) {
          const j = porId.get(id)!;
          expect(j.trayectoria.some(x => x.club === club && x.desde <= p.temporada && (x.hasta ?? 9999) >= p.temporada)).toBe(true);
        }
    }
  });

  it('los goles de los eventos coinciden con el resultado', () => {
    for (const p of liga.partidos) {
      if (!p.goles) continue;
      expect(golesDe(p.eventos, p.local)).toBe(p.goles.local);
      expect(golesDe(p.eventos, p.visitante)).toBe(p.goles.visitante);
    }
  });

  it('nadie juega después de salir o de ser expulsado', () => {
    for (const p of liga.partidos) {
      const fuera = new Map<string, number>();
      for (const e of p.eventos) {
        if (e.tipo === 'cambio' && e.sale) fuera.set(e.sale, e.minuto);
        if (e.tipo === 'roja') fuera.set(e.jugador, e.minuto);
      }
      for (const e of p.eventos) {
        if (e.tipo === 'en-contra' || e.tipo === 'cambio' || e.tipo === 'roja') continue;
        const m = fuera.get(e.jugador);
        if (m !== undefined) expect(e.minuto).toBeLessThanOrEqual(m);
      }
    }
  });

  it('congela la demo en el Clausura 2026, fecha 9, con el clásico en vivo al minuto 67', () => {
    const vivo = partidoEnVivo(liga)!;
    expect(vivo).toBeDefined();
    expect([vivo.temporada, vivo.torneo, vivo.fecha, vivo.minuto]).toEqual([2026, 'Clausura', 9, 67]);
    expect([vivo.local, vivo.visitante]).toEqual(['cosme', 'racing']);
    expect(vivo.eventos.every(e => e.minuto <= 67)).toBe(true);
    expect(liga.pendientesEnVivo.every(e => e.minuto > 67)).toBe(true);
    const f9 = liga.partidos.filter(p => p.temporada === 2026 && p.torneo === 'Clausura' && p.fecha === 9);
    expect(f9.filter(p => p.estado === 'jugado')).toHaveLength(2);
    expect(f9.filter(p => p.estado === 'programado')).toHaveLength(3);
    expect(liga.campeonAperturaActual).toBeDefined();
  });

  it('tiene 22 jugadores por club con dorsales únicos y sin DNI', () => {
    for (const c of liga.clubes) {
      const js = liga.jugadores.filter(j => j.club === c.id && j.activo);
      expect(js).toHaveLength(22);
      expect(new Set(js.map(j => j.dorsal)).size).toBe(22);
    }
    expect(JSON.stringify(liga).toLowerCase()).not.toContain('dni');
  });

  it('ordena la tabla por puntos y respeta las fundaciones en los campeones', () => {
    const t = tabla(liga, 2026, 'Clausura');
    for (let i = 1; i < t.length; i++) expect(t[i - 1]!.pts).toBeGreaterThanOrEqual(t[i]!.pts);
    for (const c of liga.campeones) {
      const club = liga.clubes.find(x => x.id === c.campeon)!;
      expect(c.anio).toBeGreaterThan(club.fundacion);
      if (c.anio >= 2000) expect(c.apertura).toBeDefined();
    }
    expect(liga.campeones.map(c => c.anio)).toEqual(Array.from({ length: 36 }, (_, i) => 1990 + i));
    expect(titulosPorClub(liga)[0]!.anios.length).toBeGreaterThan(3);
    expect(goleadores(liga, 2026, 'Clausura').length).toBeGreaterThan(0);
    expect(liga.sanciones.length).toBeGreaterThanOrEqual(3);
  });

  it('cada club tiene capitán, fundación con el mismo año y una formación de 11', () => {
    for (const c of liga.clubes) {
      expect(c.fundacionFecha.slice(0, 4)).toBe(String(c.fundacion));
      const cap = capitan(liga, c.id);
      expect(cap?.club).toBe(c.id);
      expect(capitan(liga, c.id)).toBe(cap);
      const f = formacionActual(liga, c.id)!;
      expect(f.titulares).toHaveLength(11);
      expect(f.titulares.filter(j => j.posicion === 'ARQ')).toHaveLength(1);
    }
  });

  it('genera rápido', () => {
    const t0 = performance.now();
    generarLiga(7);
    expect(performance.now() - t0).toBeLessThan(2500);
  });
});
