import type { Project } from "./types";

export const projects: Project[] = [
  {
    title: {
      en: "Embedded RTOS Kernel",
      "pt-br": "Kernel RTOS Embarcado",
    },
    description: {
      en: "A real-time operating system kernel for ARM Cortex-M microcontrollers.",
      "pt-br": "Um kernel de sistema operacional de tempo real para microcontroladores ARM Cortex-M.",
    },
    tags: ["C", "RTOS", "ARM", "Cortex-M"],
    year: 2023,
    github: "https://github.com/example/rtos-kernel",
    role: {
      en: "Lead Developer",
      "pt-br": "Desenvolvedor Principal",
    },
    icon: "⚙️",
    status: "Active",
    featured: true,
  },
  {
    title: {
      en: "Automated Test Harness",
      "pt-br": "Harness de Teste Automatizado",
    },
    description: {
      en: "Distributed testing framework for firmware validation.",
      "pt-br": "Framework de testes distribuídos para validação de firmware.",
    },
    tags: ["Python", "CI/CD", "Firmware", "Automation"],
    year: 2024,
    link: "https://example.com/test-harness",
    role: {
      en: "Architect",
      "pt-br": "Arquiteto",
    },
    icon: "🧪",
    status: "Active",
  },
  {
    title: {
      en: 'Firmware OTA Update System',
      'pt-br': 'Sistema de Atualização OTA de Firmware',
    },
    description: {
      en: 'Secure over-the-air firmware update pipeline for IoT edge devices.',
      'pt-br': 'Pipeline seguro de atualização de firmware OTA para dispositivos IoT de borda.',
    },
    tags: ['C', 'MQTT', 'TLS', 'IoT'],
    year: 2025,
    role: {
      en: 'Tech Lead',
      'pt-br': 'Tech Lead',
    },
  },
];
