"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { StarRating } from "@/components/star-rating";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";
import {
  CalificacionFormValues,
  CalificacionOutput,
  calificacionSchema,
} from "@/app/schemas/calificacion-schema";
import { crearCalificacionAction } from "@/server/calificacion/action";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export type ReviewInput = {
  professor: string;
  rating: number;
  reason: string;
  
};

type CalificacionialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  params: string;
  nombre: string;
  onSuccess: () => void | Promise<void>;
};

export function CalificacionDialog({
  open,
  onOpenChange,
  params,
  nombre,
  onSuccess,
}: CalificacionialogProps) {
  const router = useRouter();
  const form = useForm<CalificacionFormValues, any, CalificacionOutput>({
    resolver: zodResolver(calificacionSchema),
    defaultValues: {
      estrellas: 0,
      fue_victima: "false",
      comentario: "",
    },
  });

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = form;

  async function onSubmitForm(values: CalificacionOutput) {
    try {
      const result = await crearCalificacionAction(params, values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("¡Calificación enviada!");
      reset();
      onOpenChange(false);
      router.refresh();
      await onSuccess(); 
    } catch (error) {
      console.error("Error al crear la calificación:", error);
      toast.error("Error al crear la calificación");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-negro-primario">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Califica el barrio <em className="text-piel">{nombre}</em>
          </DialogTitle>
          <DialogDescription>
            Comparte tu experiencia para ayudar a los ciudadanos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <FieldGroup className="">
            <Field>
              <FieldLabel className="font-semibold">
                ¿Que calificacion le das a este barrio?
              </FieldLabel>
              <Controller
                name="estrellas"
                control={control}
                render={({ field }) => (
                  <StarRating
                    value={field.value}
                    onChange={field.onChange}
                    size={28}
                  />
                )}
              />
              {errors.estrellas && (
                <span className="text-xs text-destructive">
                  {errors.estrellas.message}
                </span>
              )}
            </Field>

            <label className="font-semibold ">
              ¿Fuiste víctima de algún percance en este barrio?
            </label>
            <Controller
              name="fue_victima"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  className="max-w-sm"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <FieldLabel htmlFor="fue_victima-true">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Sí</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="true" id="fue_victima-true" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="fue_victima-false">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>No</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="false" id="fue_victima-false" />
                      </Field>
                    </FieldLabel>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.fue_victima && (
              <span className="text-xs text-destructive">
                {errors.fue_victima.message}
              </span>
            )}

            <Field>
              <FieldLabel htmlFor="reason">
                Razones de tu calificación
              </FieldLabel>
              <Textarea
                id="reason"
                rows={4}
                placeholder="Describe tu experiencia..."
                {...register("comentario")}
              />
              {errors.comentario && (
                <span className="text-xs text-destructive">
                  {errors.comentario.message}
                </span>
              )}
            </Field>

            <DialogFooter className="mt-4">
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                className="cursor-pointer bg-negro-primario text-white"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Calificar"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
