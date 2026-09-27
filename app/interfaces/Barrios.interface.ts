export type EstadoSemaforo = "verde" | "amarillo" | "rojo" | "sin_calificar";
export interface Barrios {
  id: string;
  nombre: string;
  geometria: Geometria;
  puntaje_promedio: number;
  estado_semaforo:EstadoSemaforo | string;
  contador_calificaciones: number;
}

export interface Geometria {
  type: string;
  coordinates: Array<Array<number[]>>;
}
