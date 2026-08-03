import type { City } from "@/lib/types";

export const cities: City[] = [
  {
    id: "muscat",
    name_en: "Muscat",
    name_ar: "مسقط",
    center: { lat: 23.588, lng: 58.3829 },
    zoom: 11,
  },
  {
    id: "salalah",
    name_en: "Salalah",
    name_ar: "صلالة",
    center: { lat: 17.0151, lng: 54.0924 },
    zoom: 11,
  },
  {
    id: "sohar",
    name_en: "Sohar",
    name_ar: "صحار",
    center: { lat: 24.3463, lng: 56.7298 },
    zoom: 12,
  },
  {
    id: "nizwa",
    name_en: "Nizwa",
    name_ar: "نزوى",
    center: { lat: 22.9333, lng: 57.5333 },
    zoom: 12,
  },
  {
    id: "sur",
    name_en: "Sur",
    name_ar: "صور",
    center: { lat: 22.5667, lng: 59.5289 },
    zoom: 12,
  },
  {
    id: "barka",
    name_en: "Barka",
    name_ar: "بركاء",
    center: { lat: 23.7081, lng: 57.8893 },
    zoom: 12,
  },
];

export function cityById(id: string | undefined) {
  return cities.find((c) => c.id === id);
}
