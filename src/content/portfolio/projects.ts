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
    // icon: "🛠️",
    tags: ["Rust", "Linux"],
    github: "https://github.com/JonathanTSilva/forgenv",
    featured: true,
    status: "In Progress",
    role: {
      en: "Creator and Lead Developer",
      "pt-br": "Criador e Desenvolvedor Principal",
    }
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
    // icon: "🧪",
    tags: ["Python", "Automation", "QEMU", "TUI"],
    featured: false,
    status: "Private",
  },
  {
    title: {
      en: "DLR Supervisor Simulator",
      "pt-br": "DLR Supervisor Simulator",
    },
    description: {
      en: "A CLI and GUI Device Level Ring (DLR) supervisor simulator for testing and development of industrial network applications.",
      "pt-br": "Simulador de supervisor Device Level Ring (DLR) em CLI e GUI para teste e desenvolvimento de aplicações de redes industriais.",
    },
    // icon: "💍",
    tags: ["Python", "L2 Protocols", "DLR", "Industrial Automation"],
    featured: false,
    status: "Private",
  },
  {
    title: {
      en: "UAnalyzer",
      "pt-br": "UAnalyzer",
    },
    description: {
      en: "Traffic analyzer for intrusion detection in industrial OPC UA networks.",
      "pt-br": "Analisador de tráfego para detecção de intrusão em redes OPC UA industriais.",
    },
    // icon: "🛡️",
    tags: ["Python", "OPC UA", "Cybersecurity", "Industrial Automation"],
    github: "https://github.com/JonathanTSilva/uanalyser",
    featured: true,
    status: "Featured",
  },
  {
    title: {
      en: "Leetsheet",
      "pt-br": "Leetsheet",
    },
    description: {
      en: "A TUI-based LeetCode cheatsheet for quick problem walkthroughs in your terminal.",
      "pt-br": "Uma TUI que fornece um cheatsheet para resolução rápida de problemas LeetCode no seu terminal.",
    },
    // icon: "📝",
    tags: ["Go", "TUI"],
    github: "https://github.com/JonathanTSilva/leetsheet",
    featured: true,
    status: "Featured",
  },
  {
    title: {
      en: "Scriptize",
      "pt-br": "Scriptize",
    },
    description: {
      en: "Improve the maintainability, readability, and efficiency of your scripts by standardizing the scripting environment.",
      "pt-br": "Melhore a manutenibilidade, legibilidade e eficiência de seus scripts padronizando o ambiente de script.",
    },
    // icon: "📜",
    tags: ["Shellscript", "Python"],
    github: "https://github.com/JonathanTSilva/scriptize",
    status: "Active",
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
    // icon: "🐧",
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
    // icon: "⛏️",
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
      "pt-br": "Plataforma baseada em nuvem para detecção de falhas em bombas hidráulicas usando aprendizado de máquina.",
    },
    // icon: "☁️",
    tags: ["Node.js", "JavaScript", "Python", "Machine Learning", "Cloud Computing", "Industrial Automation"],
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
    // icon: "🩺",
    tags: ["Matlab", "Python", "Machine Learning", "Industrial Automation"],
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
    // icon: "🎓",
    tags: ["LaTeX"],
    github: "https://github.com/JonathanTSilva/TP-IFSP",
    status: "Active",
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
    // icon: "☀️",
    tags: ["Android", "Kotlin"],
    github: "https://github.com/JonathanTSilva/Dimfot",
    status: "Archived",
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
    // icon: "📏",
    image: "/assets/images/projects/sizer.png",
    tags: ["Web Development", "JavaScript", "React", "Node.js", "Data Engineering"],
    github: "https://github.com/JonathanTSilva/SI-Sizer",
    link: "http://sizer.ti.srt.ifsp.edu.br/",
    status: "Archived",
  }
];
