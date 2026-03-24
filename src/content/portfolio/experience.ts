import type { ExperienceEntry } from "./types";

export const experience: ExperienceEntry[] = [
  {
    type: 'work',
    title: {
      en: "Senior Embedded Software Engineer",
      "pt-br": "Engenheiro Sênior de Software Embarcado",
    },
    company: "act digital | Schneider Electric",
    location: {
      en: "Remote",
      "pt-br": "Remoto",
    },
    startDate: "2026-02",
    description: [
      {
        en: "Strategic partnership with Schneider Electric on R&D projects for Industrial Automation and Industry 4.0.",
        "pt-br": "Parceria estratégica com a Schneider Electric em projetos de P&D para Automação Industrial e Indústria 4.0.",
      },
      {
        en: "Develop and customize mission-critical embedded software for Embedded Linux and RTOS (VxWorks), focusing on industrial switches and PLCs.",
        "pt-br": "Desenvolvimento e customização de software embarcado de missão crítica para Linux Embarcado e RTOS (VxWorks), com foco em switches industriais e CLPs.",
      },
      {
        en: "Implement industrial communication protocols, including OPC UA, EtherNet/IP, and Modbus.",
        "pt-br": "Implementação de protocolos de comunicação industrial, incluindo OPC UA, EtherNet/IP e Modbus.",
      }
    ],
    tags: ["Embedded Linux", "VxWorks", "OPC UA", "C/C++", "IIoT"],
  },
  {
    type: 'work',
    title: {
      en: "Embedded Software Engineer",
      "pt-br": "Engenheiro de Software Embarcado",
    },
    company: "Datacom",
    location: {
      en: "Eldorado do Sul, RS, Brazil",
      "pt-br": "Eldorado do Sul, RS, Brasil",
    },
    startDate: "2024-09",
    endDate: "2026-02",
    description: [
      {
        en: "Developed and maintained software for high-performance telecommunications devices.",
        "pt-br": "Desenvolvimento e manutenção de software para dispositivos de telecomunicações de alta performance.",
      },
      {
        en: "Implemented Layer 3 protocols (IP, OSPF, BGP) and optimized system stability across hardware platforms.",
        "pt-br": "Implementação de protocolos de Camada 3 (IP, OSPF, BGP) e otimização da estabilidade do sistema em diversas plataformas de hardware.",
      }
    ],
    tags: ["C/C++", "Python", "L3 Protocols", "OSPF/BGP", "GoogleTest"],
  },
  {
    type: 'work',
    title: {
      en: "R&D Engineer",
      "pt-br": "Engenheiro de P&D",
    },
    company: "Nova Smar",
    location: {
      en: "Sertãozinho, SP, Brazil",
      "pt-br": "Sertãozinho, SP, Brasil",
    },
    startDate: "2021-01",
    endDate: "2024-09",
    description: [
      {
        en: "Coordinated product development initiatives, managing a team of 10 engineers for embedded solutions.",
        "pt-br": "Coordenação de iniciativas de desenvolvimento de produtos, gerenciando uma equipe de 10 engenheiros para soluções embarcadas.",
      },
      {
        en: "Applied cybersecurity measures for IEC 62443 compliance and developed Linux kernels using Yocto Project.",
        "pt-br": "Aplicação de medidas de cibersegurança para conformidade com a IEC 62443 e desenvolvimento de kernels Linux usando Yocto Project.",
      }
    ],
    tags: ["Yocto Project", "IEC 62443", "Technical Leadership", "Git/CI", "Clean Code"],
  },
  {
    type: 'education',
    title: {
      en: "M.Sc. in Electrical and Computer Engineering",
      "pt-br": "Mestrado em Engenharia Elétrica e de Computação",
    },
    company: "University of São Paulo (USP)",
    location: {
      en: "São Carlos, SP, Brazil",
      "pt-br": "São Carlos, SP, Brasil",
    },
    startDate: "2022",
    endDate: "2025",
    description: [
      {
        en: "Research on Industrial Automation Security and OPC UA protocol resilience against cyberattacks.",
        "pt-br": "Pesquisa em Segurança de Automação Industrial e resiliência do protocolo OPC UA contra ataques cibernéticos.",
      },
    ],
    tags: ["OPC UA", "Cybersecurity", "Industrial Automation", "Research"],
  },
  {
    type: 'education',
    title: {
      en: "B.Sc. in Electrical Engineering",
      "pt-br": "Bacharelado em Engenharia Elétrica",
    },
    company: "Federal Institute of São Paulo (IFSP)",
    location: {
      en: "Sertãozinho, SP, Brazil",
      "pt-br": "Sertãozinho, SP, Brasil",
    },
    startDate: "2017",
    endDate: "2021",
    description: [
      {
        en: "Degree completed with focus on computer science, industrial automation, and software engineering.",
        "pt-br": "Bacharelado concluído com foco em ciência da computação, automação industrial e engenharia de software.",
      },
    ],
    tags: ["Software Engineering", "Automation", "Embedded Systems"],
  },
  {
    type: 'education',
    title: {
      en: "Technical degree in Administration",
      "pt-br": "Técnico em Administração",
    },
    company: "State Technical School (ETEC)",
    location: {
      en: "Batatais, SP, Brazil",
      "pt-br": "Batatais, SP, Brasil",
    },
    startDate: "2014",
    endDate: "2016",
    description: [
      {
        en: "Foundational knowledge in business management and leadership.",
        "pt-br": "Conhecimentos fundamentais em gestão de negócios e liderança.",
      },
    ],
    tags: ["Leadership", "Management", "Soft Skills"],
  },
];
