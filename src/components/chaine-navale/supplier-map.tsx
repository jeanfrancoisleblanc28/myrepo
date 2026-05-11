"use client";

import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  fournisseursGeoreferences,
  statusLabels,
  type SupplyChainTier,
} from "@/lib/naval-supply-chain";
import {
  mrcCentre,
  zoneColor,
  zonesIndustrielles,
} from "@/lib/zones-pierredesaurel";

/**
 * Leaflet ships its default marker icon as a referenced image which Next.js
 * cannot resolve through `import`. We rebuild a deterministic divIcon per
 * supplier tier (T1/T2/T3) so it works without any asset config.
 */
const tierIconColor: Record<SupplyChainTier["code"], string> = {
  T1: "#0f172a",
  T2: "#475569",
  T3: "#94a3b8",
};

function buildIcon(tierCode: SupplyChainTier["code"]): L.DivIcon {
  const color = tierIconColor[tierCode];
  return L.divIcon({
    className: "supplier-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `
      <span style="
        display:flex;align-items:center;justify-content:center;
        width:28px;height:28px;border-radius:9999px;
        background:${color};color:white;
        font-size:11px;font-weight:700;font-family:Inter,system-ui,sans-serif;
        border:2px solid white;
        box-shadow:0 1px 4px rgba(0,0,0,.35);
      ">${tierCode}</span>
    `,
  });
}

export default function SupplierMap() {
  const icons = useMemo(
    () => ({
      T1: buildIcon("T1"),
      T2: buildIcon("T2"),
      T3: buildIcon("T3"),
    }),
    [],
  );

  return (
    <MapContainer
      center={mrcCentre}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "520px", width: "100%" }}
      className="rounded-lg border"
      aria-label="Carte des fournisseurs navals et zones industrielles de la MRC Pierre-De Saurel"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {zonesIndustrielles.map((zone) => {
        const colors = zoneColor[zone.code];
        return (
          <Polygon
            key={zone.id}
            positions={zone.contour}
            pathOptions={{
              color: colors.stroke,
              weight: 1.5,
              fillColor: colors.fill,
              fillOpacity: 0.15,
            }}
          >
            <Tooltip direction="top" sticky>
              <div style={{ minWidth: 220 }}>
                <strong>
                  {zone.code} — {zone.nom}
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: 12 }}>
                  {zone.description}
                </p>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}

      {fournisseursGeoreferences.map((supplier) => (
        <Marker
          key={`${supplier.tierCode}-${supplier.nom}`}
          position={supplier.coordonnees}
          icon={icons[supplier.tierCode]}
        >
          <Popup>
            <div style={{ minWidth: 220 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                {supplier.nom}
              </p>
              <p
                style={{
                  margin: "2px 0 8px",
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                {supplier.tierCode} — {supplier.categorieNom}
              </p>
              <ul
                style={{
                  margin: "0 0 8px",
                  padding: "0 0 0 16px",
                  fontSize: 12,
                }}
              >
                {supplier.specialites.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 9999,
                  fontSize: 11,
                  background: "#ecfdf5",
                  color: "#065f46",
                  fontWeight: 600,
                }}
              >
                {statusLabels[supplier.statut]}
              </span>
              {supplier.partenariatStrategique && (
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11,
                    color: "#475569",
                  }}
                >
                  {supplier.partenariatStrategique}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
