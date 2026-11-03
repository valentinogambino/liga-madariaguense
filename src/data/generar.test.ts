import { describe, expect, it } from 'vitest';
import { generarLiga } from './generar';
import { goleadores, partidoEnVivo, tabla, titulosPorClub } from './consultas';

const liga = generarLiga(2026);
const golesDe = (evs: { tipo: string; club: string }[], c: string) =>
  evs.filter(e => e.club === c && ['gol', 'penal', 'en-contra'].includes(e.tipo)).length;

describe('generarLiga', () => {
  it('es determinista', () => {
    expect(JSON.stringify(generarLiga(2026))).toBe(JSON.stringify(liga));
  });

  it('arma 13 fechas de 6 partidos por torneo y cada club juega 12', () => {
    for (const t of [2024, 2025, 2026])
      for (const torneo of ['Apertura', 'Clausura'] as const) {
        const ps = liga.partidos.filter(p => p.temporada === t && p.torneo === torneo);
        expect(ps).toHaveLength(78);
        for (const c of liga.clubes) expect(ps.filter(p => p.local === c.id || p.visitante === c.id)).toHaveLength(12);
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
      const js = liga.jugadores.filter(j => j.club === c.id);
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
    }
    expect(liga.campeones.map(c => c.anio)).toEqual(Array.from({ length: 36 }, (_, i) => 1990 + i));
    expect(titulosPorClub(liga)[0]!.anios.length).toBeGreaterThan(3);
    expect(goleadores(liga, 2026, 'Clausura').length).toBeGreaterThan(0);
    expect(liga.sanciones.length).toBeGreaterThanOrEqual(3);
  });

  it('genera rápido', () => {
    const t0 = performance.now();
    generarLiga(7);
    expect(performance.now() - t0).toBeLessThan(400);
  });
});
