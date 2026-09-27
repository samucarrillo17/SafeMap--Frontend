import { z } from "zod";

export const calificacionSchema = z.object({
  estrellas: z
    .number()
    .min(1, { message: "La calificacion debe ser al menois de una estrella" })
    .max(5),
  comentario: z
    .string()
    .min(10, { message: "El comentario debe tener al menos 6 caracteres." })
    .max(200, { message: "El comentario no puede exceder los 200 caracteres." })
    .trim()
    .optional(),
  fue_victima: z
    .enum(["true", "false"], {
      message: "Debes indicar si fuiste víctima o no.",
    })
    .transform((val) => val === "true"), 
});


export type CalificacionFormValues = z.input<typeof calificacionSchema>;

export type CalificacionOutput = z.output<typeof calificacionSchema>;