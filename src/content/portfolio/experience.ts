import type { ExperienceEntry } from "./types";

export const experience: ExperienceEntry[] = [
  {
    type: 'work',
    title: {
      en: "Senior Embedded Software Engineer",
      "pt-br": "Engenheiro Sênior de Software Embarcado",
    },
    company: "Act Digital | Schneider Electric",
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
        en: "Develop and customize mission-critical embedded software for Embedded Linux and RTOS, focusing on industrial switches and PLCs.",
        "pt-br": "Desenvolvimento e customização de software embarcado de missão crítica para Linux Embarcado e RTOS, com foco em switches industriais e CLPs.",
      },
      {
        en: "Implement industrial communication protocols, including EtherNet/IP, RSTP, DLR, OPC UA and Modbus.",
        "pt-br": "Implementação de protocolos de comunicação industrial, incluindo EtherNet/IP, RSTP, DLR, OPC UA e Modbus.",
      },
      {
        en: "Optimize real-time system behavior and latency to meet the rigorous standards of Industrial IoT (IIoT) and critical infrastructure.",
        "pt-br": "Otimização do comportamento de sistemas em tempo real e latência para atender aos rigorosos padrões de IIoT e infraestrutura crítica.",
      }
    ],
    tags: ["C/C++", "Python", "Rust", "Embedded Linux", "VxWorks", "L2 Protocols", "Networking", "EtherNet/IP", "DLR", "RSTP", "OPC UA", "IIoT", "Git & CI/CD", "DevOps", "Technical Leadership", "Industrial Automation"],
  },
  {
    type: 'work',
    title: {
      en: "Embedded Software Engineer",
      "pt-br": "Engenheiro de Software Embarcado",
    },
    company: "Datacom",
    location: {
      en: "Remote",
      "pt-br": "Remoto",
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
      },
      {
        en: "Develop and debug embedded Linux systems, with a focus on performance tuning and system stability across various hardware platforms.",
        "pt-br": "Desenvolvimento e depuração de sistemas Linux embarcado, com foco em melhorias de performance e estabilidade do sistema em diversas plataformas de hardware.",
      },
      {
        en: "Enhance code reliability through the design and execution of unit tests and automated integration tests.",
        "pt-br": "Aprimoramento da confiabilidade do código por meio do design e execução de testes unitários e testes de integração automatizados.",
      },

    ],
    tags: ["C/C++", "Python", "Shellscript", "Embedded Linux", "Buildroot", "L3 Protocols", "OSPF", "BGP", "QEMU", "TDD", "GoogleTest", "Robot Framework", "Jenkins", "Git & CI/CD", "Telecommunications"],
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
        en: "Coordinate product development initiatives, managing a team of 10 engineers for embedded solutions.",
        "pt-br": "Coordenação de iniciativas de desenvolvimento de produtos, gerenciando uma equipe de 10 engenheiros para soluções embarcadas.",
      },
      {
        en: "Design and implement embedded software for industrial automation, including PLCs and Windows Desktop applications.",
        "pt-br": "Design e implementação de software embarcado para automação industrial, incluindo PLCs e aplicações para desktop Windows.",
      },
      {
        en: "Apply cybersecurity measures for IEC 62443 compliance and O-PAS standards, enhancing the security and integrity of embedded systems.",
        "pt-br": "Aplicação de medidas de cibersegurança para conformidade com a IEC 62443 e padrão O-PAS, melhorando a segurança e integridade dos sistemas embarcados.",
      },
      {
        en: "Modernize the R&D workflow by leading the migration from CVS to Git and establishing CI/CD pipelines, increasing team development velocity.",
        "pt-br": "Modernização do fluxo de trabalho de P&D liderando a migração do CVS para Git e estabelecendo pipelines de CI/CD, aumentando a velocidade de desenvolvimento da equipe.",
      },
      {
        en: "Develop a suite of internal Machine Learning automation tools in that reduced manual testing time and optimized engineering workflows.",
        "pt-br": "Desenvolvimento de uma suíte de ferramentas de automação interna com Machine Learning que reduziram o tempo de teste manual e otimizaram os fluxos de trabalho de engenharia."
      }
    ],
    tags: ["C/C++", "Python", "Shellscript", "Embedded Linux", "Yocto Project", "Networking", "OPC UA", "Modbus", "Fieldbus", "HSE", "Cybersecurity", "Technical Leadership", "Git & CI/CD", "Industrial Automation", "Machine Learning"],
  },
  {
    type: 'education',
    title: {
      en: "M.Sc. in Electrical Engineering",
      "pt-br": "Mestrado em Engenharia Elétrica",
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
      {
        en: "Develop actionable security recommendations for protecting Industrial Automation and Control Systems (IACS) against evolving threats.",
        "pt-br": "Desenvolvimento de recomendações de segurança acionáveis para proteger Sistemas de Automação e Controle Industrial (IACS) contra ameaças em evolução.",
      }
    ],
    tags: ["OPC UA", "Cybersecurity", "IIoT", "Industrial Automation", "Network Security"],
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
        en: "Specialize in Computer Science and Industrial Automation, completing multiple scientific research projects focused on Digitization and AI.",
        "pt-br": "Especialização em Ciência da Computação e Automação Industrial, com participação em diversos projetos de pesquisa científica focados em Digitalização e IA.",
      },
    ],
    tags: ["Software Engineering", "Automation", "Embedded Systems", "Artificial Intelligence", "Digitalization"],
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
    tags: ["Leadership", "Management"],
  },
];
