import { z } from "zod";

export const loginSchema = z.object({
  correo: z
    .string()
    .min(1, { message: "El correo electrónico es requerido." })
    .email({ message: "Ingresa un correo electrónico válido." }),
  contrasena: z.string().min(1, { message: "La contraseña es requerida." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
      .trim(),
    correo: z
      .string()
      .min(1, { message: "El correo electrónico es requerido." })
      .email({ message: "Ingresa un correo electrónico válido." })
      .trim()
      .toLowerCase(),
    contrasena: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmarContrasena: z
      .string()
      .min(1, { message: "La confirmación de contraseña es requerida." }),
  })
  .refine((data) => data.contrasena === data.confirmarContrasena, {
    message: "Las contraseñas no coinciden.",
  });

export type RegisterInput = z.infer<typeof registerSchema>;