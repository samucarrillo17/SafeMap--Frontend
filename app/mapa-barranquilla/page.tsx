"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Heart, LogOut, ShieldCheck, Star, X } from "lucide-react";

import { getBarriosAction } from "@/server/barrios/action";

import { LeafletMap } from "@/components/leaflet-map";

import { Barrios, EstadoSemaforo } from "../interfaces/Barrios.interface";
import { Button } from "@/components/ui/button";
import { CalificacionDialog } from "@/components/calificacion-dialog";
import { logoutAction } from "@/server/auth/action";
import { redirect, useRouter } from "next/navigation";

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
  const [isLoading, setIsLoading] = useState(false);
  const [openDialogCalificacion, setOpenDialogCalificacion] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    getBarrios();
  }, []);

  const getBarrios = async () => {
    try {
      setIsLoading(true);
      const result = await getBarriosAction();

      if (result?.success && result?.barrios && result.barrios.length > 0) {
        setBarrios(result.barrios);
      }
    } catch (error) {
      console.error("Error al obtener barrios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBarrio = useMemo(
    () => barrios.find((item) => item.id === selectedId) ?? null,
    [barrios, selectedId],
  );

  const handleSelectNeighborhood = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  function handleCalificacion() {
    setOpenDialogCalificacion(true);
  }

  async function logout() {
    await logoutAction();
    router.push("/iniciar-sesion");
  }

  const semaforoKey =
    (selectedBarrio?.estado_semaforo as EstadoSemaforo) || "sin_calificar";
  const currentLevel = levelInfo[semaforoKey] || levelInfo.sin_calificar;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 font-sans text-gris-secundario">
      {/* Topbar */}
      <header className="flex items-center justify-between py-4 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gris-secundario text-white rounded-xl shadow-sm">
            <ShieldCheck size={22} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <strong className="block text-base font-bold text-slate-900">
              Barranquilla
            </strong>
            <span className="text-xs text-gris-secundario font-medium">
              en confianza
            </span>
          </div>
        </div>
        <button
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Cerrar detalles"
          onClick={logout}
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Hero */}
      <section className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-piel uppercase bg-rose-50 border border-rose-100 px-3 py-1 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-piel animate-pulse" />
          DATOS DE LA COMUNIDAD · ACTUALIZADO HOY
        </div>
        <h1 className="text-4xl sm:text-5xl  text-negro-primario mb-3">
          <strong>Muévete con confianza</strong>
          <br />
          <strong className=" text-piel font-semibold">
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
              <h2 className="text-2xl font-bold text-piel">
                Barranquilla, Atlántico
              </h2>
            </div>
          </div>

          {/* Wrapper del mapa en pantalla completa */}
          <div className="w-full h-150 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative z-0">
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
                <span className="text-xs font-bold tracking-wider text-piel uppercase">
                  BARRIO SELECCIONADO
                </span>
                <h2 className="text-3xl font-extrabold text-gris-secundario">
                  {selectedBarrio.nombre}
                </h2>
              </div>
              <button
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar detalles"
                onClick={() => setSelectedId("")}
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
                              ? "text-piel"
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

              <section className="lg:col-span-7 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p className="text-piel text-2xl mb-3">
                  <strong>Comparte tu experiencia</strong>
                </p>
                <p className="text-md mb-3">
                  Ayuda a que Barranquilla viaje mas segura y conozca reportes
                  de seguridad de sus barrios
                </p>
                <Button
                  className="bg-negro-primario text-white py-5 cursor-pointer"
                  onClick={handleCalificacion}
                >
                  Calificar este barrio
                </Button>
              </section>
            </div>
            <CalificacionDialog
              open={openDialogCalificacion}
              onOpenChange={setOpenDialogCalificacion}
              params={selectedBarrio.id}
              nombre={selectedBarrio.nombre}
              onSuccess={getBarrios}
            />
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
