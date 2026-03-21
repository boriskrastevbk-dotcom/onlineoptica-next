import type { LensChoice } from "@/components/lens/LensConfigurator";

export const LENS_OPTIONS: LensChoice[] = [
  { id: "std", label: "Стандартни бели стъкла", addPrice: 25 },
  { id: "hmc", label: "Антирефлекс HMC (за работа с компютър)", addPrice: 30 },
  { id: "rhein_16_ultra_blue", label: "Rhein 1.55 Photo Clean Br./Gr.", addPrice: 52 },
  { id: "rhein_16_uva_allblue", label: "Rhein 1.6 UV420 Clean", addPrice: 62 },
  { id: "rhein_as_167_hydro", label: "Rhein 1.6 UV420 Clean", addPrice: 72 },
  { id: "rhein_156_photo_hmc", label: "Rhein 1.67 AS Clean", addPrice: 75 },
  { id: "rhein_16_photo_hydro", label: "Rhein 1.56 Photo Chromic Br./Gr. Super HMC", addPrice: 102 },
  { id: "rhein_15_photo_transitions", label: "Rhein 1.6 Photo UV420 Grey Clean", addPrice: 122 },
];
