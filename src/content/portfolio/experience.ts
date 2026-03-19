import type { ExperienceEntry } from "./types";

export const experience: ExperienceEntry[] = [
  {
    title: {
      en: "Senior Embedded Software Engineer",
      "pt-br": "Engenheiro Sênior de Software Embarcado",
    },
    company: "Acme Electronics",
    location: {
      en: "São Paulo, Brazil",
      "pt-br": "São Paulo, Brasil",
    },
    startDate: "2020-01",
    description: [
      {
        en: "Lead development of embedded systems for industrial automation.",
        "pt-br": "Liderança no desenvolvimento de sistemas embarcados para automação industrial.",
      },
      {
        en: "Designed and implemented a custom real-time kernel.",
        "pt-br": "Projetei e implementei um kernel de tempo real personalizado.",
      },
    ],
    tags: ["Embedded C", "RTOS", "ARM", "Automation"],
  },
  {
    title: {
      en: "Embedded Software Developer",
      "pt-br": "Desenvolvedor de Software Embarcado",
    },
    company: "Tech Solutions",
    location: {
      en: "Joinville, Brazil",
      "pt-br": "Joinville, Brasil",
    },
    startDate: "2017-06",
    endDate: "2019-12",
    description: [
      {
        en: "Developed firmware for consumer electronics.",
        "pt-br": "Desenvolvi firmware para eletrônicos de consumo.",
      },
    ],
    tags: ["C++", "FreeRTOS", "Bluetooth Low Energy"],
  },
];
