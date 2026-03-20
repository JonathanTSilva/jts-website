import type { ExperienceEntry } from "./types";

export const experience: ExperienceEntry[] = [
  {
    type: 'work',
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
    type: 'work',
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
  {
    type: 'education',
    title: {
      en: "B.Sc. Computer Engineering",
      "pt-br": "Bacharelado em Engenharia de Computação",
    },
    company: "Federal University of Technology",
    location: {
      en: "Brazil",
      "pt-br": "Brasil",
    },
    startDate: "2013-02",
    endDate: "2017-12",
    description: [
      {
        en: "Focus on embedded systems, digital electronics, and real-time operating systems.",
        "pt-br": "Foco em sistemas embarcados, eletrônica digital e sistemas operacionais de tempo real.",
      },
    ],
    tags: ["Embedded Systems", "Digital Electronics", "RTOS"],
  },
];
