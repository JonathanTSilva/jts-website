import type { ProjectEntry } from "./types";

export const projects: ProjectEntry[] = [
  {
    title: {
      en: "Industrial Connectivity Platform",
      "pt-br": "Plataforma de Conectividade Industrial",
    },
    description: {
      en: "Mission-critical embedded software for industrial switches and PLCs, focusing on peak performance and high availability.",
      "pt-br": "Software embarcado de missão crítica para switches industriais e CLPs, com foco em alto desempenho e disponibilidade.",
    },
    image: "/assets/images/projects/connectivity.png",
    tags: ["Embedded Linux", "VxWorks", "C/C++", "Industrial Protocols"],
    github: "https://github.com/JonathanTSilva",
    featured: true,
  },
  {
    title: {
      en: "L3 Telecommunications Stack",
      "pt-br": "Stack de Telecomunicações L3",
    },
    description: {
      en: "Implementation and optimization of Layer 3 protocols (IP, OSPF, BGP) for high-performance networking devices.",
      "pt-br": "Implementação e otimização de protocolos de Camada 3 (IP, OSPF, BGP) para dispositivos de rede de alta performance.",
    },
    image: "/assets/images/projects/telecom.png",
    tags: ["C/C++", "Python", "Networking", "L3 Protocols"],
    github: "https://github.com/JonathanTSilva",
    featured: true,
  },
  {
    title: {
      en: "Secure OPC UA Framework",
      "pt-br": "Framework Seguro OPC UA",
    },
    description: {
      en: "Research and development of security measures for OPC UA networks, including vulnerability analysis and resilience testing.",
      "pt-br": "Pesquisa e desenvolvimento de medidas de segurança para redes OPC UA, incluindo análise de vulnerabilidades e testes de resiliência.",
    },
    image: "/assets/images/projects/opcua.png",
    tags: ["Cybersecurity", "OPC UA", "M.Sc. Research", "Industrial Security"],
    link: "https://ieeexplore.ieee.org/document/10375053",
    featured: true,
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
    image: "/assets/images/projects/yocto.png",
    tags: ["Yocto Project", "Embedded Linux", "Kernel", "Automation"],
    github: "https://github.com/JonathanTSilva",
  }
];
