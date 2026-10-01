"use client";

import L from "leaflet";
import { useEffect, useEffectEvent, useRef } from "react";

import "leaflet/dist/leaflet.css";

type Titik = { latitude: number; longitude: number };

// Pusat Kota Semarang, hanya untuk tampilan awal sebelum titik sekolah ditentukan.
const PUSAT_AWAL: L.LatLngTuple = [-6.9932, 110.4203];
const ZOOM_KOTA = 12;
const ZOOM_SEKOLAH = 17;

const IKON_PENANDA = L.divIcon({
  className: "",
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  html: '<svg viewBox="0 0 32 40" width="32" height="40" aria-hidden="true"><path d="M16 0C7.2 0 0 7 0 15.6 0 27 16 40 16 40s16-13 16-24.4C32 7 24.8 0 16 0z" fill="var(--primary)" stroke="var(--card)" stroke-width="2"/><circle cx="16" cy="15" r="5.5" fill="var(--highlight)"/></svg>',
});

type PetaLokasiSekolahProps = { titik: Titik | null; radius: number; onPindah: (titik: Titik) => void };

/**
 * Peta OpenStreetMap (Leaflet) untuk menentukan titik sekolah: ketuk peta atau geser penanda. Lingkaran
 * menunjukkan radius absen. Dimuat hanya di browser karena Leaflet membutuhkan `window`.
 */
export function PetaLokasiSekolah({ titik, radius, onPindah }: PetaLokasiSekolahProps) {
  const wadahRef = useRef<HTMLDivElement>(null);
  const petaRef = useRef<L.Map | null>(null);
  const penandaRef = useRef<L.Marker | null>(null);
  const lingkaranRef = useRef<L.Circle | null>(null);
  const pindah = useEffectEvent((posisi: L.LatLng) => onPindah({ latitude: posisi.lat, longitude: posisi.lng }));

  useEffect(() => {
    if (!wadahRef.current) return;

    const peta = L.map(wadahRef.current, { center: PUSAT_AWAL, zoom: ZOOM_KOTA });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Kontributor OpenStreetMap</a>',
    }).addTo(peta);
    peta.on("click", (peristiwa) => pindah(peristiwa.latlng));
    petaRef.current = peta;

    return () => {
      peta.remove();
      petaRef.current = null;
      penandaRef.current = null;
      lingkaranRef.current = null;
    };
  }, []);

  useEffect(() => {
    const peta = petaRef.current;
    if (!peta) return;

    if (!titik) {
      penandaRef.current?.remove();
      lingkaranRef.current?.remove();
      penandaRef.current = null;
      lingkaranRef.current = null;
      return;
    }

    const posisi: L.LatLngTuple = [titik.latitude, titik.longitude];
    if (penandaRef.current && lingkaranRef.current) {
      penandaRef.current.setLatLng(posisi);
      lingkaranRef.current.setLatLng(posisi).setRadius(radius);
      if (!peta.getBounds().contains(posisi)) peta.panTo(posisi);
      return;
    }

    const warna = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    const penanda = L.marker(posisi, { draggable: true, icon: IKON_PENANDA, title: "Titik sekolah", alt: "Titik sekolah" }).addTo(peta);
    penanda.on("dragend", () => pindah(penanda.getLatLng()));
    penandaRef.current = penanda;
    lingkaranRef.current = L.circle(posisi, { radius, color: warna, weight: 2, fillOpacity: 0.15 }).addTo(peta);
    peta.setView(posisi, ZOOM_SEKOLAH);
  }, [titik, radius]);

  // `isolate` menjaga z-index kontrol Leaflet tidak menimpa header dan menu yang menempel.
  return <div ref={wadahRef} role="application" aria-label="Peta lokasi sekolah" className="isolate z-0 h-72 w-full overflow-hidden rounded-lg border border-border sm:h-96" />;
}
