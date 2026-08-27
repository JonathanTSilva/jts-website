import type { Employer, Theme, WorkPosition } from './types';
import type { ExperienceEntry } from './types';
import { education } from './education';

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
      h('act-schneider-strategic-partnership', 'Strategic partnership with Schneider Electric on R&D projects for Industrial Automation and Industry 4.0.', 'Parceria estratégica com a Schneider Electric em projetos de P&D para Automação Industrial e Indústria 4.0.', ['research', 'embedded'], 95),
      h('act-mission-critical-embedded-software', 'Develop and customize mission-critical embedded software for Embedded Linux and RTOS, focusing on industrial switches and PLCs.', 'Desenvolvimento e customização de software embarcado de missão crítica para Linux Embarcado e RTOS, com foco em switches industriais e CLPs.', ['embedded'], 95),
      h('act-industrial-protocols', 'Implement industrial communication protocols, including EtherNet/IP, RSTP, DLR, OPC UA and Modbus.', 'Implementação de protocolos de comunicação industrial, incluindo EtherNet/IP, RSTP, DLR, OPC UA e Modbus.', ['embedded'], 90),
      h('act-real-time-latency', 'Optimize real-time system behavior and latency to meet the rigorous standards of Industrial IoT (IIoT) and critical infrastructure.', 'Otimização do comportamento de sistemas em tempo real e latência para atender aos rigorosos padrões de IIoT e infraestrutura crítica.', ['embedded'], 85),
    ], tags: ['C/C++', 'Python', 'Rust', 'Embedded Linux', 'VxWorks', 'L2 Protocols', 'Networking', 'EtherNet/IP', 'DLR', 'RSTP', 'OPC UA', 'IIoT', 'Git & CI/CD', 'DevOps', 'Technical Leadership', 'Industrial Automation'],
  },
  {
    id: 'datacom-embedded-software-engineer', employerId: 'datacom',
    title: { en: 'Embedded Software Engineer', 'pt-br': 'Engenheiro de Software Embarcado' }, location: remote,
    dates: { start: { value: '2024-09', precision: 'month' }, end: { value: '2026-02', precision: 'month' } },
    highlights: [
      h('datacom-telecom-software', 'Developed and maintained software for high-performance telecommunications devices.', 'Desenvolvimento e manutenção de software para dispositivos de telecomunicações de alta performance.', ['embedded'], 90),
      h('datacom-layer-three-protocols', 'Implemented Layer 3 protocols (IP, OSPF, BGP) and optimized system stability across hardware platforms.', 'Implementação de protocolos de Camada 3 (IP, OSPF, BGP) e otimização da estabilidade do sistema em diversas plataformas de hardware.', ['embedded'], 90),
      h('datacom-linux-debugging', 'Develop and debug embedded Linux systems, with a focus on performance tuning and system stability across various hardware platforms.', 'Desenvolvimento e depuração de sistemas Linux embarcado, com foco em melhorias de performance e estabilidade do sistema em diversas plataformas de hardware.', ['embedded'], 85),
      h('datacom-automated-testing', 'Enhance code reliability through the design and execution of unit tests and automated integration tests.', 'Aprimoramento da confiabilidade do código por meio do design e execução de testes unitários e testes de integração automatizados.', ['devops'], 80),
    ], tags: ['C/C++', 'Python', 'Shellscript', 'Embedded Linux', 'Buildroot', 'L3 Protocols', 'OSPF', 'BGP', 'QEMU', 'TDD', 'GoogleTest', 'Robot Framework', 'Jenkins', 'Git & CI/CD', 'Telecommunications'],
  },
  {
    id: 'nova-smar-rd-electronic-intelligence-analyst', employerId: 'nova-smar',
    title: { en: 'R&D Electronic Intelligence Analyst', 'pt-br': 'Analista de Inteligência Eletrônica de P&D' }, location: novaLocation,
    dates: { start: { value: '2023', precision: 'year' }, end: { value: '2024', precision: 'year' } },
    highlights: [
      h('nova-product-development-leadership', 'Coordinate product development initiatives, managing a team of 10 engineers for embedded solutions.', 'Coordenação de iniciativas de desenvolvimento de produtos, gerenciando uma equipe de 10 engenheiros para soluções embarcadas.', ['leadership', 'embedded'], 95),
      h('nova-industrial-software', 'Design and implement embedded software for industrial automation, including PLCs and Windows Desktop applications.', 'Design e implementação de software embarcado para automação industrial, incluindo PLCs e aplicações para desktop Windows.', ['embedded'], 90),
      h('nova-cybersecurity-compliance', 'Apply cybersecurity measures for IEC 62443 compliance and O-PAS standards, enhancing the security and integrity of embedded systems.', 'Aplicação de medidas de cibersegurança para conformidade com a IEC 62443 e padrão O-PAS, melhorando a segurança e integridade dos sistemas embarcados.', ['embedded', 'research'], 90),
      h('nova-git-cicd-modernization', 'Modernize the R&D workflow by leading the migration from CVS to Git and establishing CI/CD pipelines, increasing team development velocity.', 'Modernização do fluxo de trabalho de P&D liderando a migração do CVS para Git e estabelecendo pipelines de CI/CD, aumentando a velocidade de desenvolvimento da equipe.', ['devops', 'leadership'], 90),
      h('nova-ml-automation-tools', 'Develop a suite of internal Machine Learning automation tools in that reduced manual testing time and optimized engineering workflows.', 'Desenvolvimento de uma suíte de ferramentas de automação interna com Machine Learning que reduziram o tempo de teste manual e otimizaram os fluxos de trabalho de engenharia.', ['research', 'devops'], 75),
    ], tags: ['C/C++', 'Python', 'Shellscript', 'Embedded Linux', 'Yocto Project', 'Networking', 'OPC UA', 'Modbus', 'Fieldbus', 'HSE', 'Cybersecurity', 'Technical Leadership', 'Git & CI/CD', 'Industrial Automation', 'Machine Learning'],
  },
  { id: 'nova-smar-rd-electronic-intelligence-assistant', employerId: 'nova-smar', title: { en: 'R&D Electronic Intelligence Assistant', 'pt-br': 'Assistente de Inteligência Eletrônica de P&D' }, location: novaLocation, dates: { start: { value: '2022', precision: 'year' }, end: { value: '2023', precision: 'year' } }, highlights: [], tags: [] },
  { id: 'nova-smar-rd-intern', employerId: 'nova-smar', title: { en: 'R&D Intern', 'pt-br': 'Estagiário de P&D' }, location: novaLocation, dates: { start: { value: '2021', precision: 'year' }, end: { value: '2021', precision: 'year' } }, highlights: [], tags: [] },
];

// TODO(Task 3): delete after all Astro consumers use the canonical adapter.
export const experience: readonly ExperienceEntry[] = [
  ...positions.map(position => ({ type: 'work' as const, title: position.title, company: employers.find(({ id }) => id === position.employerId)!.name, location: position.location ?? remote, startDate: position.dates.start.value, ...(position.dates.end ? { endDate: position.dates.end.value } : {}), description: position.highlights.map(({ webText }) => webText), tags: [...position.tags] })),
  ...education.map(item => ({ type: 'education' as const, title: item.credential, company: item.institution, location: item.location ?? remote, startDate: item.dates.start.value, ...(item.dates.end ? { endDate: item.dates.end.value } : {}), description: item.highlights.map(({ webText }) => webText), tags: [...item.tags] })),
];
