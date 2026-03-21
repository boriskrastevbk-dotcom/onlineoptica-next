import type { LensChoice } from "@/components/lens/LensConfigurator";

export const LENS_OPTIONS: LensChoice[] = [
  { id: "std", label: "Стандартни бели стъкла", addPrice: 25 },
  { id: "hmc", label: "Антирефлекс HMC (за работа с компютър)", addPrice: 30 },

  { id: "rhein_16_ultra_blue", label: "NEW Rhein 1.6 Ultra Blue", addPrice: 81 },
  { id: "rhein_16_uva_allblue", label: "NEW Rhein 1.6 UVA AllBlue (филтър синя светлина)", addPrice: 92 },
  { id: "rhein_as_167_hydro", label: "Rhein As 1.67 Hydro+ (много тънки стъкла)", addPrice: 132 },

  { id: "rhein_156_photo_hmc", label: "Rhein 1.56 Photo HMC Br/Gr", addPrice: 71 },
  { id: "rhein_16_photo_hydro", label: "Rhein 1.6 Photo Hydro+ Br/Gr", addPrice: 138 },
  { id: "rhein_15_photo_transitions", label: "NEW Rhein 1.5 Photo Transitions Br/Gr", addPrice: 142 },
];
