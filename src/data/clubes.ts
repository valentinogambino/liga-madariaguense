import type { Club } from './tipos';

// Nombre, localidad, escudo y colores son reales. Fundación, estadio e historia son inventados para la demo
// (las coordenadas caen dentro de cada localidad, no en la cancha real).

const esc = (id: string) => `/escudos/${id}.png`;

export const CLUBES: Club[] = [
  {
    id: 'cosme',
    nombre: 'Atlético Cosme',
    corto: 'Cosme',
    sigla: 'COS',
    localidad: 'General Madariaga',
    fundacion: 1921,
    estadio: { nombre: 'Estadio Don Cosme', direccion: 'Av. San Martín 1450, General Madariaga', lat: -37.0018, lng: -57.1385 },
    colores: { primario: '#1f8a4c', secundario: '#d8282e' },
    escudo: esc('cosme'),
    historia: ''
  },
  {
    id: 'leon',
    nombre: 'Deportivo El León',
    corto: 'El León',
    sigla: 'LEO',
    localidad: 'General Madariaga',
    fundacion: 1978,
    estadio: { nombre: 'La Cueva del León', direccion: 'Calle 28 y Rivadavia, General Madariaga', lat: -36.9952, lng: -57.1298 },
    colores: { primario: '#e2b33b', secundario: '#111111' },
    escudo: esc('leon'),
    historia: ''
  },
  {
    id: 'juventud',
    nombre: 'Juventud Unida',
    corto: 'Juventud',
    sigla: 'JUV',
    localidad: 'General Madariaga',
    fundacion: 1934,
    estadio: { nombre: 'Estadio Juventud Unida', direccion: 'Belgrano 980, General Madariaga', lat: -36.9978, lng: -57.1432 },
    colores: { primario: '#e0262d', secundario: '#ffffff' },
    escudo: esc('juventud'),
    historia: ''
  },
  {
    id: 'clan',
    nombre: 'Los del Clan',
    corto: 'Los del Clan',
    sigla: 'CLA',
    localidad: 'General Madariaga',
    fundacion: 1986,
    estadio: { nombre: 'Cancha de Los del Clan', direccion: 'Hipólito Yrigoyen 2100, General Madariaga', lat: -37.0061, lng: -57.1342 },
    colores: { primario: '#e32b2b', secundario: '#55c3ea' },
    escudo: esc('clan'),
    historia: ''
  },
  {
    id: 'racing',
    nombre: 'Racing Club',
    corto: 'Racing',
    sigla: 'RAC',
    localidad: 'General Madariaga',
    fundacion: 1927,
    estadio: { nombre: 'Estadio La Academia', direccion: 'Mitre 640, General Madariaga', lat: -36.9991, lng: -57.1371 },
    colores: { primario: '#5cc0ee', secundario: '#ffffff' },
    escudo: esc('racing'),
    historia: ''
  },
  {
    id: 'san-vicente',
    nombre: 'Atlético San Vicente',
    corto: 'San Vicente',
    sigla: 'SVI',
    localidad: 'Pinamar',
    fundacion: 1968,
    estadio: { nombre: 'Estadio San Vicente', direccion: 'Av. Shaw 450, Pinamar', lat: -37.1105, lng: -56.8601 },
    colores: { primario: '#d9262c', secundario: '#ffffff' },
    escudo: esc('san-vicente'),
    historia: ''
  },
  {
    id: 'pinamar',
    nombre: 'Deportivo Pinamar',
    corto: 'Pinamar',
    sigla: 'PIN',
    localidad: 'Pinamar',
    fundacion: 1959,
    estadio: { nombre: 'Estadio de los Pinos', direccion: 'Av. Bunge 1800, Pinamar', lat: -37.1078, lng: -56.8722 },
    colores: { primario: '#1d6b3a', secundario: '#ffffff' },
    escudo: esc('pinamar'),
    historia: ''
  },
  {
    id: 'arena',
    nombre: 'Arena FC',
    corto: 'Arena',
    sigla: 'ARE',
    localidad: 'Pinamar',
    fundacion: 2009,
    estadio: { nombre: 'Complejo Arena', direccion: 'Av. Intermédanos 3200, Pinamar', lat: -37.1183, lng: -56.8689 },
    colores: { primario: '#d6b25c', secundario: '#111111' },
    escudo: esc('arena'),
    historia: ''
  },
  {
    id: 'nuevo-amanecer',
    nombre: 'Nuevo Amanecer',
    corto: 'N. Amanecer',
    sigla: 'NAM',
    localidad: 'Ostende',
    fundacion: 1982,
    estadio: { nombre: 'Estadio de Ostende', direccion: 'Av. Biarritz 200, Ostende', lat: -37.1312, lng: -56.8822 },
    colores: { primario: '#f2e21b', secundario: '#d9262c' },
    escudo: esc('nuevo-amanecer'),
    historia: ''
  },
  {
    id: 'valeria',
    nombre: 'Defensores de Valeria del Mar',
    corto: 'Def. Valeria',
    sigla: 'DVM',
    localidad: 'Valeria del Mar',
    fundacion: 1974,
    estadio: { nombre: 'Cancha de los Médanos', direccion: 'Espora 1100, Valeria del Mar', lat: -37.1452, lng: -56.8905 },
    colores: { primario: '#2a6db5', secundario: '#e8d7a8' },
    escudo: esc('valeria'),
    historia: ''
  },
  {
    id: 'villa-gesell',
    nombre: 'Atlético Villa Gesell',
    corto: 'Atl. Gesell',
    sigla: 'AVG',
    localidad: 'Villa Gesell',
    fundacion: 1950,
    estadio: { nombre: 'Estadio Carlos Gesell', direccion: 'Av. 3 y Paseo 120, Villa Gesell', lat: -37.2581, lng: -56.9762 },
    colores: { primario: '#f4d21c', secundario: '#1b2c6b' },
    escudo: esc('villa-gesell'),
    historia: ''
  },
  {
    id: 'san-lorenzo',
    nombre: 'San Lorenzo de Villa Gesell',
    corto: 'San Lorenzo',
    sigla: 'SLO',
    localidad: 'Villa Gesell',
    fundacion: 1963,
    estadio: { nombre: 'El Bosque Azulgrana', direccion: 'Av. Buenos Aires 2400, Villa Gesell', lat: -37.2452, lng: -56.9845 },
    colores: { primario: '#1d3f8f', secundario: '#c8232c' },
    escudo: esc('san-lorenzo'),
    historia: ''
  },
  {
    id: 'golf',
    nombre: 'Deportivo Villa Gesell Golf Club',
    corto: 'Golf Club',
    sigla: 'GOL',
    localidad: 'Villa Gesell',
    fundacion: 1995,
    estadio: { nombre: 'Cancha del Golf', direccion: 'Circunvalación y Paseo 101, Villa Gesell', lat: -37.2368, lng: -56.9921 },
    colores: { primario: '#1f5c45', secundario: '#ee7a2a' },
    escudo: esc('golf'),
    historia: ''
  }
];

export const CLUB_POR_ID = Object.fromEntries(CLUBES.map(c => [c.id, c])) as Record<Club['id'], Club>;
