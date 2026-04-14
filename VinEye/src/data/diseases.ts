export interface Disease {
  id: string;
  name: string;
  type: "fungal" | "bacterial" | "pest" | "abiotic";
  icon: string;
  iconColor: string;
  bgColor: string;
  severity: "high" | "medium" | "low";
  description: string;
  symptoms: string[];
  treatment: string;
  season: string;
}

export const VINE_DISEASES: Disease[] = [
  {
    id: "mildiou",
    name: "diseases.mildiou.name",
    type: "fungal",
    icon: "water-outline",
    iconColor: "#BA7517",
    bgColor: "#FAEEDA",
    severity: "high",
    description: "diseases.mildiou.description",
    symptoms: [
      "diseases.mildiou.symptom1",
      "diseases.mildiou.symptom2",
      "diseases.mildiou.symptom3",
    ],
    treatment: "diseases.mildiou.treatment",
    season: "diseases.mildiou.season",
  },
  {
    id: "oidium",
    name: "diseases.oidium.name",
    type: "fungal",
    icon: "snow-outline",
    iconColor: "#534AB7",
    bgColor: "#EEEDFE",
    severity: "high",
    description: "diseases.oidium.description",
    symptoms: [
      "diseases.oidium.symptom1",
      "diseases.oidium.symptom2",
    ],
    treatment: "diseases.oidium.treatment",
    season: "diseases.oidium.season",
  },
  {
    id: "black_rot",
    name: "diseases.blackRot.name",
    type: "fungal",
    icon: "ellipse",
    iconColor: "#5F5E5A",
    bgColor: "#F1EFE8",
    severity: "high",
    description: "diseases.blackRot.description",
    symptoms: [
      "diseases.blackRot.symptom1",
      "diseases.blackRot.symptom2",
    ],
    treatment: "diseases.blackRot.treatment",
    season: "diseases.blackRot.season",
  },
  {
    id: "esca",
    name: "diseases.esca.name",
    type: "fungal",
    icon: "leaf-outline",
    iconColor: "#993C1D",
    bgColor: "#FAECE7",
    severity: "medium",
    description: "diseases.esca.description",
    symptoms: [
      "diseases.esca.symptom1",
      "diseases.esca.symptom2",
    ],
    treatment: "diseases.esca.treatment",
    season: "diseases.esca.season",
  },
  {
    id: "botrytis",
    name: "diseases.botrytis.name",
    type: "fungal",
    icon: "cloud-outline",
    iconColor: "#185FA5",
    bgColor: "#E6F1FB",
    severity: "medium",
    description: "diseases.botrytis.description",
    symptoms: [
      "diseases.botrytis.symptom1",
      "diseases.botrytis.symptom2",
    ],
    treatment: "diseases.botrytis.treatment",
    season: "diseases.botrytis.season",
  },
  {
    id: "flavescence_doree",
    name: "diseases.flavescence.name",
    type: "bacterial",
    icon: "warning-outline",
    iconColor: "#A32D2D",
    bgColor: "#FCEBEB",
    severity: "high",
    description: "diseases.flavescence.description",
    symptoms: [
      "diseases.flavescence.symptom1",
      "diseases.flavescence.symptom2",
    ],
    treatment: "diseases.flavescence.treatment",
    season: "diseases.flavescence.season",
  },
  {
    id: "chlorose",
    name: "diseases.chlorose.name",
    type: "abiotic",
    icon: "sunny-outline",
    iconColor: "#639922",
    bgColor: "#EAF3DE",
    severity: "low",
    description: "diseases.chlorose.description",
    symptoms: [
      "diseases.chlorose.symptom1",
      "diseases.chlorose.symptom2",
    ],
    treatment: "diseases.chlorose.treatment",
    season: "diseases.chlorose.season",
  },
];
