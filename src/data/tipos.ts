// Modelo de datos de la demo. Clubes, localidades y escudos son reales; todo lo demás es inventado.

export type ClubId =
  | 'cosme'
  | 'leon'
  | 'juventud'
  | 'clan'
  | 'racing'
  | 'san-vicente'
  | 'pinamar'
  | 'arena'
  | 'nuevo-amanecer'
  | 'valeria'
  | 'villa-gesell'
  | 'san-lorenzo'
  | 'golf';

export type Localidad = 'General Madariaga' | 'Pinamar' | 'Ostende' | 'Valeria del Mar' | 'Villa Gesell';

export interface Estadio {
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
}

export interface Club {
  id: ClubId;
  nombre: string; // «Atlético Cosme»
  corto: string; // «Cosme», para listas angostas
  sigla: string; // tres letras, para el marcador: «COS»
  localidad: Localidad;
  fundacion: number; // año, inventado
  estadio: Estadio;
  colores: { primario: string; secundario: string }; // hex, tiñen la ficha
  escudo: string; // ruta pública: /escudos/<id>.png
  historia: string; // reseña inventada, 2 o 3 párrafos separados por \n\n
}

export type Posicion = 'ARQ' | 'DEF' | 'MED' | 'DEL';

export interface PasoPorClub {
  club: ClubId;
  desde: number; // año
  hasta: number | null; // null = actual
  dorsal?: number; // camiseta en ese club
}

export interface Jugador {
  id: string; // «j-cosme-07»
  nombre: string;
  apellido: string;
  apodo?: string;
  dorsal: number;
  posicion: Posicion;
  nacimiento: string; // AAAA-MM-DD
  lugarNacimiento: string; // «General Madariaga», «Mar del Plata»…
  nacionalidad: string; // casi todos «Argentina»
  club: ClubId; // club actual, o el último si ya no juega
  activo: boolean; // false si se retiró o dejó la liga
  trayectoria: PasoPorClub[]; // en orden cronológico, termina en el club actual
}

export type TipoTorneo = 'Apertura' | 'Clausura' | 'Final';

export type TipoEvento = 'gol' | 'penal' | 'en-contra' | 'amarilla' | 'roja' | 'cambio';

export interface Evento {
  tipo: TipoEvento;
  minuto: number; // 1..90 (+ descuento como 90)
  club: ClubId; // club al que se le anota el evento (en un gol en contra, el que se beneficia)
  jugador: string; // id de Jugador (en un cambio, el que entra)
  asistencia?: string; // id, solo en goles
  sale?: string; // id, solo en cambios
}

export interface Formacion {
  titulares: string[]; // 11 ids
  suplentes: string[]; // 5 a 7 ids; los que entraron figuran en los eventos de cambio
}

export type EstadoPartido = 'jugado' | 'en-vivo' | 'programado';

export interface Partido {
  id: string; // «2026-clausura-09-cosme-racing»
  temporada: number;
  torneo: TipoTorneo;
  fecha: number; // 1..13; en la final, 1
  dia: string; // fecha y hora ISO local, «2026-10-25T16:00»
  local: ClubId;
  visitante: ClubId;
  cancha: string; // nombre del estadio del local
  estado: EstadoPartido;
  goles: { local: number; visitante: number } | null; // null si está programado
  minuto?: number; // solo en vivo
  eventos: Evento[]; // en vivo: hasta el minuto actual
  formaciones: { local: Formacion; visitante: Formacion } | null; // null si está programado
  arbitro?: string;
}

export interface Campeonato {
  anio: number;
  campeon: ClubId;
  subcampeon: ClubId;
  apertura?: ClubId; // desde 2024 hay detalle
  clausura?: ClubId;
}

export type MotivoSancion = 'acumulacion' | 'roja';

export interface Sancion {
  jugador: string;
  club: ClubId;
  motivo: MotivoSancion;
  fechas: number; // fechas que le faltan cumplir
  desde: string; // id del partido que la originó
}

export interface Momento {
  temporada: number;
  torneo: TipoTorneo;
  fecha: number; // fecha en curso
  libre: ClubId; // el que no juega en esa fecha
}

export interface Liga {
  clubes: Club[];
  jugadores: Jugador[];
  partidos: Partido[]; // 2000 a 2026, ordenados por día
  campeones: Campeonato[]; // 1990..2025 (desde 2000, derivados de los partidos)
  sanciones: Sancion[]; // vigentes para la próxima fecha
  ahora: Momento;
  libres: Record<string, ClubId>; // clave «<temporada>-<torneo>-<fecha>»
  campeonAperturaActual?: ClubId; // campeón del torneo ya terminado de la temporada en curso
  pendientesEnVivo: Evento[]; // eventos del partido en vivo que todavía no pasaron (minuto > actual), para la simulación
}
