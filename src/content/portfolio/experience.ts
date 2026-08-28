import type { Employer, WorkPosition } from './schema';
type Theme = WorkPosition['highlights'][number]['themes'][number];

export const employers: Employer[] = [
  { id: 'act-digital', name: 'Act Digital' },
  { id: 'schneider-electric', name: 'Schneider Electric' },
  { id: 'datacom', name: 'Datacom' },
  { id: 'nova-smar', name: 'Nova Smar', location: { en: 'Sertãozinho, SP, Brazil', 'pt-br': 'Sertãozinho, SP, Brasil' } },
];

const remote = { en: 'Remote', 'pt-br': 'Remoto' } as const;
const novaLocation = { en: 'Sertãozinho, SP, Brazil', 'pt-br': 'Sertãozinho, SP, Brasil' } as const;
const h = (id: string, en: string, pt: string, themes: Theme[], priority: number) =>
  ({ id, webText: { en, 'pt-br': pt }, themes, priority });

export const positions: WorkPosition[] = [
  {
    id: 'act-digital-senior-embedded-software-engineer', employerId: 'act-digital',
    title: { en: 'Senior Embedded Software Engineer', 'pt-br': 'Engenheiro Sênior de Software Embarcado' }, location: remote,
    dates: { start: { value: '2026-02', precision: 'month' } },
    highlights: [
      h('act-schneider-strategic-partnership', 'Serve Schneider Electric, an Act Digital customer, allocated to its Innovation and Technology department on the Network Service Platform team.', 'Atuação para a Schneider Electric, cliente da Act Digital, com alocação no departamento de Innovation and Technology, na equipe Network Service Platform.', ['research', 'embedded'], 95),
      h('act-mission-critical-embedded-software', 'Develop and customize mission-critical software for Embedded Linux and RTOS platforms used in industrial switches and PLCs.', 'Desenvolvimento e customização de software de missão crítica para plataformas Linux embarcado e RTOS usadas em switches industriais e CLPs.', ['embedded'], 95),
      h('act-industrial-protocols', 'Implement EtherNet/IP, RSTP, DLR, OPC UA, and Modbus communication protocols for industrial systems.', 'Implementação dos protocolos de comunicação EtherNet/IP, RSTP, DLR, OPC UA e Modbus para sistemas industriais.', ['embedded'], 90),
      h('act-real-time-latency', 'Optimize real-time behavior and latency for Industrial IoT (IIoT) and critical-infrastructure requirements.', 'Otimização do comportamento em tempo real e da latência para requisitos de IIoT e infraestrutura crítica.', ['embedded'], 85),
    ], tags: ['C/C++', 'Python', 'Rust', 'Embedded Linux', 'VxWorks', 'L2 Protocols', 'Networking', 'EtherNet/IP', 'DLR', 'RSTP', 'OPC UA', 'IIoT', 'Git & CI/CD', 'DevOps', 'Technical Leadership', 'Industrial Automation'], verification: 'verified',
  },
  {
    id: 'datacom-embedded-software-engineer', employerId: 'datacom',
    title: { en: 'Embedded Software Engineer', 'pt-br': 'Engenheiro de Software Embarcado' }, location: remote,
    dates: { start: { value: '2024-09', precision: 'month' }, end: { value: '2026-02', precision: 'month' } },
    highlights: [
      h('datacom-telecom-software', 'Developed and maintained embedded software for high-performance telecommunications devices.', 'Desenvolvimento e manutenção de software embarcado para dispositivos de telecomunicações de alto desempenho.', ['embedded'], 90),
      h('datacom-layer-three-protocols', 'Implemented IP, OSPF, and BGP Layer 3 protocols and improved system stability across hardware platforms.', 'Implementação dos protocolos de Camada 3 IP, OSPF e BGP e melhoria da estabilidade do sistema em diferentes plataformas de hardware.', ['embedded'], 90),
      h('datacom-linux-debugging', 'Developed and debugged Embedded Linux systems, tuning performance and stability across hardware platforms.', 'Desenvolvimento e depuração de sistemas Linux embarcado, com ajustes de desempenho e estabilidade em diferentes plataformas de hardware.', ['embedded'], 85),
      h('datacom-automated-testing', 'Designed unit and automated integration tests to improve code reliability.', 'Criação de testes unitários e de integração automatizados para melhorar a confiabilidade do código.', ['devops'], 80),
    ], tags: ['C/C++', 'Python', 'Shellscript', 'Embedded Linux', 'Buildroot', 'L3 Protocols', 'OSPF', 'BGP', 'QEMU', 'TDD', 'GoogleTest', 'Robot Framework', 'Jenkins', 'Git & CI/CD', 'Telecommunications'], verification: 'verified',
  },
  {
    id: 'nova-smar-rd-engineer', employerId: 'nova-smar',
    title: { en: 'R&D Engineer', 'pt-br': 'Engenheiro de P&D' }, location: novaLocation,
    dates: { start: { value: '2021-01', precision: 'month' }, end: { value: '2024-09', precision: 'month' } },
    highlights: [
      h('nova-product-development-leadership', 'Coordinated embedded-product development with a team of 10 engineers.', 'Coordenação do desenvolvimento de produtos embarcados com uma equipe de 10 engenheiros.', ['leadership', 'embedded'], 95),
      h('nova-industrial-software', 'Designed and implemented embedded software for industrial automation, including PLC and Windows desktop applications.', 'Projeto e implementação de software embarcado para automação industrial, incluindo aplicações para CLPs e desktop Windows.', ['embedded'], 90),
      h('nova-cybersecurity-compliance', 'Applied IEC 62443 and O-PAS cybersecurity practices to improve embedded-system security and integrity.', 'Aplicação de práticas de cibersegurança IEC 62443 e O-PAS para melhorar a segurança e a integridade de sistemas embarcados.', ['embedded', 'research'], 90),
      h('nova-git-cicd-modernization', 'Led the R&D migration from CVS to Git and established CI/CD pipelines, improving the team development workflow.', 'Liderança da migração de CVS para Git em P&D e implantação de pipelines de CI/CD, melhorando o fluxo de desenvolvimento da equipe.', ['devops', 'leadership'], 90),
      h('nova-ml-automation-tools', 'Developed internal machine-learning automation tools that reduced manual testing and improved engineering workflows.', 'Desenvolvimento de ferramentas internas de automação com aprendizado de máquina que reduziram testes manuais e melhoraram os fluxos de engenharia.', ['research', 'devops'], 75),
    ], tags: ['C/C++', 'Python', 'Shellscript', 'Embedded Linux', 'Yocto Project', 'Networking', 'OPC UA', 'Modbus', 'Fieldbus', 'HSE', 'Cybersecurity', 'Technical Leadership', 'Git & CI/CD', 'Industrial Automation', 'Machine Learning'], verification: 'verified',
  },
];
