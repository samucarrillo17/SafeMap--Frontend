"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Heart, ShieldCheck, Star, X } from "lucide-react";

import { getBarriosAction } from "@/server/barrios/action";
import { Barrios, EstadoSemaforo } from "./interfaces/Barrios.interface";
import { LeafletMap } from "@/components/leaflet-map";
import { StarRating } from "@/components/star-rating";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalificacionFormValues, CalificacionOutput, calificacionSchema } from "./schemas/calificacion-schema";
import { Field, FieldContent, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const levelInfo: Record<
  EstadoSemaforo,
  { label: string; color: string; fill: string }
> = {
  verde: { label: "Seguro", color: "#2f9e6d", fill: "#b9efd5" },
  amarillo: { label: "Precaución", color: "#d59028", fill: "#ffe1a8" },
  rojo: { label: "Peligroso", color: "#d45b60", fill: "#f8b8b9" },
  sin_calificar: { label: "Sin datos", color: "#8a8a8a", fill: "#e0e0e0" },
};

export default function Page() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [barrios, setBarrios] = useState<Barrios[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    getBarrios();
  }, []);

  

  const getBarrios = async () => {
    try {
      setIsLoading(true);
      const result = await getBarriosAction();

      if (result?.success && result?.barrios && result.barrios.length > 0) {
        setBarrios(result.barrios);
        setSelectedId(result.barrios[0].id);
      }
    } catch (error) {
      console.error("Error al obtener barrios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBarrio = useMemo(
    () => barrios.find((item) => item.id === selectedId) ?? barrios[0],
    [barrios, selectedId],
  );

  const handleSelectNeighborhood = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const semaforoKey =
    (selectedBarrio?.estado_semaforo as EstadoSemaforo) || "sin_calificar";
  const currentLevel = levelInfo[semaforoKey] || levelInfo.sin_calificar

  async function onSubmitCalificacion(values: CalificacionOutput) {
    // try {
    //   const result = await createCommentAction(params, values);

    //   if (result.success) {
    //     onOpenChange(false);
    //     onSubmit?.({
    //       professor: values.professorName,
    //       rating: values.rating,
    //       reason: values.reason,
    //     });
    //     toast.success("Comentario creado exitosamente");
    //   }
    //   toast.error(result.error);
    //   router.refresh(); // Refresca la página para mostrar el nuevo comentario
    // } catch (error) {
    //   console.error("Error al crear el comentario:", error);
    //   toast.error("Error al crear el comentario");
    // }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 font-sans text-[#7d8bae]">
      {/* Topbar */}
      <header className="flex items-center justify-between py-4 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#7d8bae] text-white rounded-xl shadow-sm">
            <ShieldCheck size={22} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <strong className="block text-base font-bold text-slate-900">
              Barranquilla
            </strong>
            <span className="text-xs text-[#7d8bae] font-medium">
              en confianza
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#e5857b] uppercase bg-rose-50 border border-rose-100 px-3 py-1 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-[#e5857b] animate-pulse" />
          DATOS DE LA COMUNIDAD · ACTUALIZADO HOY
        </div>
        <h1 className="text-4xl sm:text-5xl  text-[#45496a] mb-3">
          <strong>Muévete con confianza</strong>
          <br />
          <strong className=" text-[#e5857b] font-semibold">
            por Barranquilla.
          </strong>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl">
          Consulta la percepción de seguridad de cada barrio y comparte tu
          experiencia para ayudar a otros.
        </p>
      </section>

      {/* Layout Principal: Mapa arriba full-width y detalles abajo */}
      <div className="flex flex-col gap-8" id="mapa">
        {/* Panel del Mapa */}
        <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                MAPA DE SEGURIDAD
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Barranquilla, Atlántico
              </h2>
            </div>
          </div>

          {/* Wrapper del mapa en pantalla completa */}
          <div className="w-full h-150 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                Cargando mapa de seguridad...
              </div>
            ) : (
              <LeafletMap
                neighborhoods={barrios}
                selectedId={selectedId}
                visibleIds={barrios.map((b) => b.id)}
                onSelect={handleSelectNeighborhood}
              />
            )}
          </div>
        </section>

        {/* Panel de Detalles (Abajo del mapa) */}
        {selectedBarrio && (
          <aside className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div>
                <span className="text-xs font-bold tracking-wider text-[#e5857b] uppercase">
                  BARRIO SELECCIONADO
                </span>
                <h2 className="text-3xl font-extrabold text-[#7d8bae]">
                  {selectedBarrio.nombre}
                </h2>
              </div>
              <button
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Cerrar detalles"
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid horizontal para estadísticas y formulario */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Columna Izquierda: Métricas */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* Safety Card */}
                <div
                  className="flex items-center justify-between p-5 rounded-xl border"
                  style={{
                    backgroundColor: `${currentLevel.fill}40`,
                    borderColor: currentLevel.color,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-lg text-white shadow-sm"
                      style={{ backgroundColor: currentLevel.color }}
                    >
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        NIVEL DE SEGURIDAD
                      </span>
                      <strong className="text-lg font-bold text-slate-900">
                        {currentLevel.label}
                      </strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-2xl font-black text-slate-900">
                      {selectedBarrio.puntaje_promedio ?? 0}
                    </strong>
                    <span className="text-sm font-semibold text-slate-500">
                      {" "}
                      / 5
                    </span>
                  </div>
                </div>

                {/* Detail Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CALIFICACIÓN
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={
                            star <=
                            Math.round(selectedBarrio.puntaje_promedio ?? 0)
                              ? "#e5857b"
                              : "none"
                          }
                          className={
                            star <=
                            Math.round(selectedBarrio.puntaje_promedio ?? 0)
                              ? "text-[#e5857b]"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      OPINIONES
                    </span>
                    <strong className="text-xl font-bold text-slate-800">
                      {selectedBarrio.contador_calificaciones ?? 0}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Formulario de experiencia */}
              <section className="lg:col-span-7 p-6 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xl font-bold tracking-wider text-[#e5857b] uppercase">
                      TU EXPERIENCIA
                    </span>
                    <h3 className="text-md font-bold text-[#7d8bae]">
                      Ayuda a la comunidad
                    </h3>
                  </div>
                  <Heart size={20} className="text-[#e5857b]" />
                </div>

                {submitted ? (
                  <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800">
                    <Check
                      size={20}
                      className="text-emerald-600 mt-0.5 shrink-0"
                    />
                    <div>
                      <strong className="font-bold">
                        ¡Gracias por aportar!
                      </strong>
                      <span className="text-sm">
                        Tu reporte ayuda a que otros se muevan mejor.
                      </span>
                    </div>
                  </div>
                ) : (
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={handleSubmit(onSubmitCalificacion)}
                  >
                    <Field>
                      <FieldLabel>Calificación</FieldLabel>
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
                    <div>
                      <label className="font-semibold text-[#45496a]">
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
                            <FieldLabel htmlFor="fue_victima-true">
                              <Field orientation="horizontal">
                                <FieldContent>
                                  <FieldTitle>Sí</FieldTitle>
                                </FieldContent>
                                <RadioGroupItem
                                  value="true"
                                  id="fue_victima-true"
                                />
                              </Field>
                            </FieldLabel>
                            <FieldLabel htmlFor="fue_victima-false">
                              <Field orientation="horizontal">
                                <FieldContent>
                                  <FieldTitle>No</FieldTitle>
                                </FieldContent>
                                <RadioGroupItem
                                  value="false"
                                  id="fue_victima-false"
                                />
                              </Field>
                            </FieldLabel>
                          </RadioGroup>
                        )}
                      />
                      {errors.fue_victima && (
                        <span className="text-xs text-destructive">
                          {errors.fue_victima.message}
                        </span>
                      )}
                    </div>

                    <Field>
                      <FieldLabel htmlFor="reason">
                        Razones de tu calificación
                      </FieldLabel>
                      <Textarea
                        id="reason"
                        rows={4}
                        placeholder="Describe tu experiencia con la asignatura y el profesor..."
                        {...register("comentario")}
                      />
                      {errors.comentario && (
                        <span className="text-xs text-destructive">
                          {errors.comentario.message}
                        </span>
                      )}
                    </Field>

                    <button
                      className="w-full bg-[#45496a] hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mt-1 shadow-sm"
                      type="submit"
                    >
                      Enviar calificación <span>→</span>
                    </button>
                  </form>
                )}
              </section>
            </div>
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400 py-8 mt-12 border-t border-slate-200 gap-4">
        <span>© 2024 Barranquilla en confianza</span>
        <span>
          La seguridad la construimos entre todos ·{" "}
          <a href="#privacidad" className="hover:underline text-slate-500">
            Privacidad
          </a>
        </span>
      </footer>
    </main>
  );
}
