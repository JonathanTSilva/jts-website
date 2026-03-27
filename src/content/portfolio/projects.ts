import { fa } from "zod/v4/locales";
import type { ProjectEntry } from "./types";

export const projects: ProjectEntry[] = [
  {
    title: {
      en: "Forgenv",
      "pt-br": "Forgenv",
    },
    description: {
      en: "A cross-platform dotfiles and environment manager with a beautiful TUI, designed for developers who want to manage their development environments with style and efficiency.",
      "pt-br": "Um gerenciador de dotfiles e ambientes de desenvolvimento multiplataforma com uma TUI bonita, projetado para desenvolvedores que desejam gerenciar seus ambientes de desenvolvimento com estilo e eficiência.",
    },
    tags: ["Rust", "Linux"],
    github: "https://github.com/JonathanTSilva/forgenv",
    featured: true,
    status: "In Progress",
  },
  {
    title: {
      en: "Qemulab",
      "pt-br": "Qemulab",
    },
    description: {
      en: "A modern TUI for managing QEMU development environments with style and efficiency.",
      "pt-br": "Uma TUI moderna para gerenciar ambientes de desenvolvimento QEMU com estilo e eficiência.",
    },
    tags: ["Python", "Automation", "QEMU", "TUI"],
    featured: false,
    status: "Private",
  },
  {
    title: {
      en: "DLR-INSPector",
      "pt-br": "DLR-INSPector",
    },
    description: {
      en: "A CLI and GUI Device Level Ring (DLR) supervisor simulator for testing and development of industrial network applications.",
      "pt-br": "Simulador de supervisor Device Level Ring (DLR) em CLI e GUI para teste e desenvolvimento de aplicações de redes industriais.",
    },
    tags: ["Python"],
    featured: false,
    status: "Private",
  },
  {
    title: {
      en: "UAnalyzer",
      "pt-br": "UAnalyzer",
    },
    description: {
      en: "Traffic analyser for intrusion detection in industrial OPC UA networks.",
      "pt-br": "Analisador de tráfego para detecção de intrusão em redes OPC UA industriais.",
    },
    tags: ["Python", "OPC UA", "Cybersecurity"],
    github: "https://github.com/JonathanTSilva/uanalyser",
    featured: true,
    status: "Featured",
  },
  {
    title: {
      en: "Custom Embedded Linux (Yocto)",
      "pt-br": "Linux Embarcado Customizado (Yocto)",
    },
    description: {
      en: "Development and maintenance of optimized Linux distributions for industrial automation systems using the Yocto Project.",
      "pt-br": "Desenvolvimento e manutenção de distribuições Linux otimizadas para sistemas de automação industrial usando Yocto Project.",
    },
    tags: ["Yocto Project", "Embedded Linux", "Kernel", "Kernel Module", "Industrial Automation"],
    status: "Private",
  },
  {
    title: {
      en: "Sentminer",
      "pt-br": "Sentminer",
    },
    description: {
      en: "Anki add-on for mining sentences in English.",
      "pt-br": "Add-on para mineração de sentenças em inglês.",
    },
    tags: ["Python", "Qt"],
    github: "https://github.com/JonathanTSilva",
    status: "In Progress",
  },
  {
    title: {
      en: "CloudCavitation",
      "pt-br": "CloudCavitation",
    },
    description: {
      en: "Cloud-based platform for failure detection in hydraulic pumps using machine learning.",
      "pt-br": "Plataforma baseada em nuvem para detecção de falhas bombas hidráulicas usando aprendizado de máquina.",
    },
    tags: ["Node.js", "JavaScript", "Python", "Machine Learning", "Cloud Computing"],
    github: "https://github.com/JonathanTSilva/FP-CloudCavitation",
    featured: false,
    status: "Archived",
  },
  {
    title: {
      en: "Pump Diagnostics with Machine Learning",
      "pt-br": "Diagnóstico de Bombas com Aprendizado de Máquina",
    },
    description: {
      en: "Diagnostic system for hydraulic pump failures by means of electric current analysis and machine learning tools.",
      "pt-br": "Sistema de diagnóstico para falhas em bombas hidráulicas por meio de análise de corrente elétrica e ferramentas de aprendizado de máquina.",
    },
    tags: ["Matlab", "Python", "Machine Learning"],
    github: "https://github.com/JonathanTSilva/SI-Cavitation",
    featured: false,
    status: "Active",
  },
  {
    title: {
      en: "Official LaTeX Template for IFSP",
      "pt-br": "Template LaTeX Oficial para IFSP",
    },
    description: {
      en: "Creation and maintenance of an official LaTeX template for academic documents at IFSP, including theses, dissertations, and reports.",
      "pt-br": "Criação e manutenção de um template LaTeX oficial para documentos acadêmicos no IFSP, incluindo teses, dissertações e relatórios.",
    },
    tags: ["LaTeX"],
    github: "https://github.com/JonathanTSilva/TP-IFSP",
  },
  {
    title: {
      en: "Dimfot",
      "pt-br": "Dimfot",
    },
    description: {
      en: "Android application for sizing photovoltaic systems.",
      "pt-br": "Aplicação Android para dimensionamento de sistemas fotovoltaicos.",
    },
    tags: ["Android", "Kotlin"],
    github: "https://github.com/JonathanTSilva/Dimfot",
  },
  {
    title: {
      en: "Sizer",
      "pt-br": "Sizer",
    },
    description: {
      en: "Web application for sizing equipment for electric motor drives.",
      "pt-br": "Aplicação web para dimensionamento de equipamentos para acionamentos de motores elétricos.",
    },
    image: "/assets/images/projects/sizer.png",
    tags: ["Web Development", "JavaScript", "React", "Node.js", "Data Engineering"],
    github: "https://github.com/JonathanTSilva/SI-Sizer",
    link: "http://sizer.ti.srt.ifsp.edu.br/",
    status: "Archived",
  }
];
