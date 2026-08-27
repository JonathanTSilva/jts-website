import type { Project as CanonicalProject } from './schema';
import type { Project as LegacyProject } from './types';

export const canonicalProjects: CanonicalProject[] = [
  {
    id: 'project-forgenv',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva/forgenv' }],
    highlights: [], themes: ['general'], priority: 90,
    featured: true,
    status: "In Progress",
    role: {
      en: "Creator and Lead Developer",
      "pt-br": "Criador e Desenvolvedor Principal",
    }
  },
  {
    id: 'project-qemulab',
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
    links: [], highlights: [], themes: ['general', 'embedded', 'devops'], priority: 60,
    featured: false,
    status: "Private",
  },
  {
    id: 'project-dlr-supervisor-simulator',
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
    links: [], highlights: [], themes: ['general', 'embedded'], priority: 60,
    featured: false,
    status: "Private",
  },
  {
    id: 'project-uanalyzer',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva/uanalyser' }],
    highlights: [], themes: ['general', 'embedded', 'research'], priority: 90,
    featured: true,
    status: "Featured",
  },
  {
    id: 'project-leetsheet',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva/leetsheet' }],
    highlights: [], themes: ['general'], priority: 90,
    featured: true,
    status: "Featured",
  },
  {
    id: 'project-scriptize',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva/scriptize' }],
    highlights: [], themes: ['general', 'devops'], priority: 60,
    status: "Active",
  },
  {
    id: 'project-custom-embedded-linux-yocto',
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
    links: [], highlights: [], themes: ['general', 'embedded'], priority: 60,
    status: "Private",
  },
  {
    id: 'project-sentminer',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva' }],
    highlights: [], themes: ['general'], priority: 60,
    status: "In Progress",
  },
  {
    id: 'project-cloudcavitation',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva/FP-CloudCavitation' }],
    highlights: [], themes: ['general', 'embedded', 'research'], priority: 60,
    featured: false,
    status: "Archived",
  },
  {
    id: 'project-pump-diagnostics-machine-learning',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva/SI-Cavitation' }],
    highlights: [], themes: ['general', 'embedded', 'research'], priority: 60,
    featured: false,
    status: "Active",
  },
  {
    id: 'project-ifsp-latex-template',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva/TP-IFSP' }],
    highlights: [], themes: ['general', 'research'], priority: 60,
    status: "Active",
  },
  {
    id: 'project-dimfot',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva/Dimfot' }],
    highlights: [], themes: ['general'], priority: 60,
    status: "Archived",
  },
  {
    id: 'project-sizer',
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
    links: [{ kind: 'github', label: 'GitHub', url: 'https://github.com/JonathanTSilva/SI-Sizer' }],
    legacyLinks: [{ label: 'Historical live site', url: 'http://sizer.ti.srt.ifsp.edu.br/' }],
    highlights: [], themes: ['general'], priority: 60,
    status: "Archived",
  }
];

// TODO(Task 3): delete after Astro consumers read canonical display/link fields directly.
export const projects: LegacyProject[] = canonicalProjects.map(project => {
  const github = project.links.find(link => link.kind === 'github')?.url;
  const link = project.legacyLinks?.[0]?.url ?? project.links.find(item => item.kind === 'website')?.url;
  return { ...project, ...(github ? { github } : {}), ...(link ? { link } : {}) };
});
