"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  IdCard,
  ShieldCheck,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { useForm } from "react-hook-form";

import { registerAction } from "@/server/auth/action";
import toast from "react-hot-toast";
import { RegisterInput, registerSchema } from "@/app/schemas/auth-schema";

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      correo: "",
      contrasena: "",
    },
  });
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = form;

  const onSubmitRegister = async (values: RegisterInput) => {
    try {
      const result = await registerAction(values);
      if (!result.success) {
        toast.error(result.error, {
          duration: 2000,
        });
        return;
      }
      toast.success("Registro exitoso");
      router.refresh();
    } catch (error) {
      return error;
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2.5 bg-negro-primario text-white rounded-xl shadow-sm">
            <ShieldCheck size={22} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <strong className="block text-base font-bold text-negro-primario">
              Barranquilla
            </strong>
            <span className="text-sm text-piel font-medium">en confianza</span>
          </div>
        </div>

        <Card className="text-negro-primario">
          <CardHeader className="text-center gap-3">
            <CardTitle className="text-2xl font-semibold">
              Crea una cuenta
            </CardTitle>
            <CardDescription>
              Tu opinión ayuda a que Barranquilla se mueva mejor.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="auth-form" onSubmit={handleSubmit(onSubmitRegister)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nombre</FieldLabel>
                  <div className="relative">
                    <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="ej: Juan"
                      className="pl-9 py-5"
                      {...register("nombre")}
                    />
                  </div>
                  {errors.nombre && (
                    <FieldDescription className="text-destructive">
                      {errors.nombre.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Correo</FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre@universidad.edu"
                      className="pl-9 py-5"
                      {...register("correo")}
                    />
                  </div>
                  {errors.correo && (
                    <FieldDescription className="text-destructive">
                      {errors.correo.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 py-5"
                      {...register("contrasena")}
                    />
                  </div>

                  {errors.contrasena ? (
                    <FieldDescription className="text-destructive">
                      {errors.contrasena.message}
                    </FieldDescription>
                  ) : (
                    <FieldDescription>
                      Usa al menos 6 caracteres.
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirmar contraseña
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 py-5"
                      {...register("confirmarContrasena")}
                    />
                  </div>
                  {errors.confirmarContrasena && (
                    <FieldDescription className="text-destructive">
                      {errors.confirmarContrasena.message}
                    </FieldDescription>
                  )}
                </Field>
                <Button
                  type="submit"
                  className="w-full cursor-pointer bg-negro-primario py-5"
                >
                  Crear mi cuenta
                </Button>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t">
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/iniciar-sesion"
                className="font-medium text-piel underline-offset-4 hover:underline"
              >
                Inicia sesión
              </Link>
  
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
