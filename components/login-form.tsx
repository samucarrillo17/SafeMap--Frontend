"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Mail, Lock, ShieldCheck } from "lucide-react";
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

import toast from "react-hot-toast";

import { LoginInput, loginSchema } from "@/app/schemas/auth-schema";
import { loginAction } from "@/server/auth/action";

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: "",
      contrasena: "",
    },
  });
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = form;

  const onSubmitLogin = async (values: LoginInput) => {
    const { correo, contrasena } = values;
    try {
      const result = await loginAction(correo, contrasena);
      if (!result.success) {
        toast.error("Correo o contrasena incorrecto", {
          duration: 2000,
        });
        return;
      }
      
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

        <Card>
          <CardHeader className="text-center gap-3">
            <CardTitle className="text-2xl font-semibold text-negro-primario">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-gris-secundario">
              Ingresa para explorar barrios y compartir tu experiencia.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="auth-form" onSubmit={handleSubmit(onSubmitLogin)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email" className="text-negro-primario">
                    Correo
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="password"
                    className="text-negro-primario"
                  >
                    Contraseña
                  </FieldLabel>
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

                  {errors.contrasena && (
                    <FieldDescription className="text-destructive">
                      {errors.contrasena.message}
                    </FieldDescription>
                  ) }
                </Field>
                <Button
                  type="submit"
                  className="w-full bg-negro-primario py-5 cursor-pointer hover:bg-negro-primario/90"
                >
                  Iniciar sesión
                </Button>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t">
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                href="/registrate"
                className="font-medium text-piel underline-offset-4 hover:underline"
              >
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
