// Generador pseudoaleatorio con semilla (mulberry32): mismos datos en cada corrida.

export interface Azar {
  (): number; // [0, 1)
  entero(min: number, max: number): number; // ambos inclusive
  elegir<T>(lista: readonly T[]): T;
  ponderado<T>(lista: readonly T[], peso: (x: T) => number): T;
  mezclar<T>(lista: readonly T[]): T[];
  chance(p: number): boolean;
  poisson(media: number): number;
}

export function crearAzar(semilla: number): Azar {
  let a = semilla >>> 0;
  const r = (() => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as Azar;
  r.entero = (min, max) => min + Math.floor(r() * (max - min + 1));
  r.elegir = lista => {
    if (lista.length === 0) throw new Error('elegir: lista vacía');
    return lista[Math.floor(r() * lista.length)] as (typeof lista)[number];
  };
  r.ponderado = (lista, peso) => {
    const total = lista.reduce((s, x) => s + peso(x), 0);
    let tiro = r() * total;
    for (const x of lista) {
      tiro -= peso(x);
      if (tiro <= 0) return x;
    }
    return lista[lista.length - 1] as (typeof lista)[number];
  };
  r.mezclar = lista => {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [copia[i], copia[j]] = [copia[j] as (typeof copia)[number], copia[i] as (typeof copia)[number]];
    }
    return copia;
  };
  r.chance = p => r() < p;
  r.poisson = media => {
    const limite = Math.exp(-media);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= r();
    } while (p > limite);
    return k - 1;
  };
  return r;
}
