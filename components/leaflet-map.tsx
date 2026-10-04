"use client";

import { useEffect, useRef } from "react";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Barrios, EstadoSemaforo } from "@/app/interfaces/Barrios.interface";

const levelColors: Record<EstadoSemaforo, { stroke: string; fill: string }> = {
  verde: { stroke: "#2f9e6d", fill: "#91fdc9" },
  amarillo: { stroke: "#d59028", fill: "#f4c56d" },
  rojo: { stroke: "#d45b60", fill: "#f98889" },
  sin_calificar: { stroke: "#8a8a8a", fill: "#e0e0e0" },
};

const neighborhoodCoordinates: Record<string, [number, number][]> = {
  "alto-prado": [
    [11.0157, -74.8108],
    [11.018, -74.803],
    [11.012, -74.798],
    [11.006, -74.802],
    [11.008, -74.81],
  ],
  "zona-franca": [
    [10.955, -74.765],
    [10.96, -74.76],
    [10.95, -74.755],
    [10.948, -74.762],
  ],
};

function getLayerStyle(item: Barrios, isSelected: boolean): L.PathOptions {
  const key = (item.estado_semaforo as EstadoSemaforo) || "sin_calificar";
  const colors = levelColors[key] || levelColors.sin_calificar;

  return {
    color: colors.stroke,
    fillColor: colors.fill,
    fillOpacity: isSelected ? 0.85 : 0.85,
    weight: isSelected ? 3 : 1,
  };
}

export function LeafletMap({
  neighborhoods,
  selectedId,
  onSelect,
}: {
  neighborhoods: Barrios[];
  selectedId: string;
  visibleIds: string[];
  onSelect: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, L.Path>>({});
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then(({ default: L }) => {
      if (cancelled || !mapRef.current) return;

      if (!leafletMap.current) {
      
        const barranquillaBounds = L.latLngBounds(
          L.latLng(10.9, -74.95), // esquina suroeste
          L.latLng(11.1, -74.7), // esquina noreste
        );

        leafletMap.current = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
          minZoom: 12, 
          maxBounds: barranquillaBounds, 
          maxBoundsViscosity: 1.0, 
        }).setView([10.997, -74.8], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(leafletMap.current);
      }

      const map = leafletMap.current;

     
      Object.values(layersRef.current).forEach((layer) =>
        map.removeLayer(layer),
      );
      layersRef.current = {};

      const featuresGroup = L.featureGroup();

      neighborhoods.forEach((item) => {
        const slug = item.nombre.toLowerCase().replace(/\s+/g, "-");
        const isSelected = item.id === selectedIdRef.current;
        const style = getLayerStyle(item, isSelected);

        let layer: L.Path;
        const hasValidGeoJSON =
          item.geometria?.coordinates?.[0]?.[0] &&
          Math.abs(item.geometria.coordinates[0][0][0]) > 1;

        if (hasValidGeoJSON) {
          layer = L.geoJSON(item.geometria as any, {
            style,
          }) as unknown as L.Path;
        } else {
          const coords =
            neighborhoodCoordinates[slug] ||
            neighborhoodCoordinates["alto-prado"];
          layer = L.polygon(coords, style);
        }

        layer.bindTooltip(item.nombre, { sticky: true });
        layer.on("click", () => onSelectRef.current(item.id));
        layer.addTo(map);
        if (isSelected) layer.bringToFront();
        featuresGroup.addLayer(layer);
        layersRef.current[item.id] = layer;
      });

      if (featuresGroup.getLayers().length > 0) {
        map.fitBounds(featuresGroup.getBounds());
      }

      window.setTimeout(() => map.invalidateSize(), 0);
    });

    return () => {
      cancelled = true;
    };
  }, [neighborhoods]);

  
  useEffect(() => {
    Object.entries(layersRef.current).forEach(([id, layer]) => {
      const item = neighborhoods.find((n) => n.id === id);
      if (!item) return;

      const isSelected = id === selectedId;
      layer.setStyle(getLayerStyle(item, isSelected));

     
      if (isSelected) layer.bringToFront();
    });
  }, [selectedId, neighborhoods]);

  
  useEffect(() => {
    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
      layersRef.current = {};
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="leaflet-map"
      style={{ height: "100%", minHeight: "450px", width: "100%" }}
      role="img"
      aria-label="Mapa interactivo de barrios de Barranquilla"
    />
  );
}
