import type { Employer, WorkPosition } from './schema';
type Theme = WorkPosition['highlights'][number]['themes'][number];

export const employers: Employer[] = [
  { id: 'act-digital', name: 'Act Digital' },
  { id: 'datacom', name: 'Datacom' },
  { id: 'nova-smar', name: 'Nova Smar', location: { en: 'Sertãozinho, SP, Brazil', 'pt-br': 'Sertãozinho, SP, Brasil' } },
];

const remote = { en: 'Remote', 'pt-br': 'Remoto' } as const;
const novaLocation = { en: 'Sertãozinho, SP, Brazil', 'pt-br': 'Sertãozinho, SP, Brasil' } as const;
const h = (id: string, en: string, pt: string, themes: Theme[], priority: number, cvText?: string) =>
  ({ id, webText: { en, 'pt-br': pt }, themes, priority, ...(cvText ? { cvText } : {}) });

export const positions: WorkPosition[] = [
  {
    id: 'act-digital-senior-embedded-software-engineer', employerId: 'act-digital',
    title: { en: 'Senior Embedded Software Engineer', 'pt-br': 'Engenheiro Sênior de Software Embarcado' }, location: remote,
    dates: { start: { value: '2026-02', precision: 'month' } },
    highlights: [
      h('act-schneider-strategic-partnership', "Work as an Act Digital engineer assigned to Schneider Electric's Innovation and Technology department on the Network Service Platform team.", 'Atuação como engenheiro da Act Digital alocado no departamento de Innovation and Technology da Schneider Electric, na equipe Network Service Platform.', ['research', 'embedded'], 95),
      h('act-ethernet-ip-stack-upgrade', "Led an EtherNet/IP stack upgrade and improved the update process from a manual two-way merge to an automated Git three-way workflow, reducing one engineer's merge-and-update effort from at least 30 engineer-days to fewer than five — more than an 80% reduction.", 'Liderei a atualização de uma stack EtherNet/IP e aprimorei o processo de atualização, substituindo um merge manual de 2-way por um fluxo automatizado de 3-way com Git. Com isso, reduzi o esforço de merge e atualização de um engenheiro de pelo menos 30 dias de trabalho para menos de cinco — uma redução superior a 80%.', ['embedded', 'devops', 'leadership'], 95, 'Led an EtherNet/IP stack upgrade, replacing a manual two-way merge with an automated Git three-way workflow and cutting merge-and-update effort from 30+ engineer-days to under five (over 80%).'),
      h('act-mission-critical-embedded-software', 'Develop and customize Embedded Linux and VxWorks software for industrial switches and PLCs, with attention to availability, deterministic behavior, and performance.', 'Desenvolvo e customizo software em Embedded Linux e VxWorks para switches industriais e PLCs, com foco em disponibilidade, comportamento determinístico e desempenho.', ['embedded'], 95),
      h('act-industrial-protocols', 'Implement and maintain industrial and networking protocols including EtherNet/IP, DLR, RSTP, OPC UA, Modbus, TCP/IP, and UDP.', 'Implemento e mantenho protocolos industriais e de rede, incluindo EtherNet/IP, DLR, RSTP, OPC UA, Modbus, TCP/IP e UDP.', ['embedded'], 90),
      h('act-substation-requirements', 'Adapt software solutions to meet strict industrial and substation requirements, ensuring high availability, determinism, and peak performance.', 'Adapto soluções de software para atender a requisitos rigorosos de ambientes industriais e de subestações, garantindo alta disponibilidade, determinismo e alto desempenho.', ['embedded'], 85),
      h('act-scrum-adoption', 'Introduced Scrum practices for a service team embedded with Schneider Electric, improving stakeholder visibility into priorities, progress, and blockers.', 'Introduzi práticas de Scrum em uma equipe de serviços integrada à Schneider Electric, ampliando a visibilidade dos stakeholders sobre prioridades, progresso e impedimentos.', ['leadership'], 80),
      h('act-cross-functional-collaboration', 'Collaborate with cross-functional teams in the United States and Brazil on hardware integration, DevOps practices, CI/CD, and complex troubleshooting.', 'Colaboro com equipes multifuncionais nos Estados Unidos e no Brasil em integração de hardware, práticas de DevOps, CI/CD e diagnóstico de problemas complexos.', ['devops', 'leadership'], 75),
    ], tags: ['C/C++', 'Python', 'Rust', 'Embedded Linux', 'VxWorks', 'L2 Protocols', 'Networking', 'EtherNet/IP', 'DLR', 'RSTP', 'OPC UA', 'IIoT', 'Git & CI/CD', 'DevOps', 'Technical Leadership', 'Industrial Automation', 'Modbus', 'TCP/IP', 'UDP', 'Scrum'], verification: 'verified',
  },
  {
    id: 'datacom-embedded-software-engineer', employerId: 'datacom',
    title: { en: 'Embedded Software Engineer', 'pt-br': 'Engenheiro de Software Embarcado' }, location: remote,
    dates: { start: { value: '2024-09', precision: 'month' }, end: { value: '2026-02', precision: 'month' } },
    highlights: [
      h('datacom-metaswitch-stack-upgrade', 'Led and executed the three-month upgrade of a five-year-old Metaswitch networking stack to its newest release, resolving more than 20,000 merge conflicts and coordinating the responsible Layer 2 and Layer 3 domain teams on dependency-specific issues.', 'Liderei e executei, em três meses, a atualização de uma stack de redes Metaswitch já com cinco anos para a versão mais recente, resolvendo mais de 20 mil conflitos de merge e coordenando as equipes de domínio de Camada 2 e Camada 3 para resolver questões específicas de dependências.', ['embedded', 'leadership'], 95, 'Led the three-month upgrade of a five-year-old Metaswitch networking stack to its newest release, resolving 20,000+ merge conflicts and coordinating the Layer 2 and Layer 3 domain teams.'),
      h('datacom-upgrade-automation', 'Automated repeatable migration steps and documented the upgrade process for future releases; there were no known regressions following validation.', 'Automatizei etapas repetíveis da migração e documentei o processo de atualização para versões futuras. Após a validação da atualização, não houve regressões conhecidas.', ['devops'], 85),
      h('datacom-layer-three-protocols', 'Developed and maintained C/C++ and Python software on Embedded Linux and Buildroot, including Layer 3 work with OSPF and BGP.', 'Desenvolvi e mantive software em C/C++ e Python para Embedded Linux, usando Buildroot, incluindo trabalho de Camada 3 com OSPF e BGP.', ['embedded'], 90),
      h('datacom-automated-testing', 'Designed and ran unit and automated integration tests with GoogleTest and Robot Framework to strengthen reliability across hardware platforms.', 'Projetei e executei testes unitários e de integração automatizados com GoogleTest e Robot Framework para fortalecer a confiabilidade em diferentes plataformas de hardware.', ['devops'], 80),
      h('datacom-telecom-troubleshooting', 'Troubleshot complex telecommunications systems, resolving critical software issues and supporting system stability.', 'Diagnostiquei sistemas complexos de telecomunicações, solucionando problemas críticos de software e contribuindo para a estabilidade dos sistemas.', ['embedded'], 85),
    ], tags: ['C/C++', 'Python', 'Shellscript', 'Embedded Linux', 'Buildroot', 'L3 Protocols', 'OSPF', 'BGP', 'QEMU', 'TDD', 'GoogleTest', 'Robot Framework', 'Jenkins', 'Git & CI/CD', 'Telecommunications', 'Embedded Software', 'L2 Protocols', 'Automation'], verification: 'verified',
  },
  {
    id: 'nova-smar-rd-engineer', employerId: 'nova-smar',
    title: { en: 'R&D Engineer', 'pt-br': 'Engenheiro de P&D' }, location: novaLocation,
    dates: { start: { value: '2021-01', precision: 'month' }, end: { value: '2024-09', precision: 'month' } },
    highlights: [
      h('nova-test-automation', 'Automated test execution across more than 25 repositories that had depended on manual testing, reducing manual test effort by more than 90% and eliminating nearly one engineer-day of manual work per release.', 'Automatizei a execução de testes em mais de 25 repositórios que dependiam da execução manual de testes, reduzindo esse esforço em mais de 90% e eliminando quase um dia de trabalho de um engenheiro por release.', ['devops'], 95),
      h('nova-git-cicd-modernization', "Led the R&D organization's migration from CVS to Git and established CI/CD pipelines for its software workflows.", 'Liderei a migração da organização de P&D de CVS para Git e estabeleci pipelines de CI/CD para seus fluxos de desenvolvimento de software.', ['devops', 'leadership'], 90),
      h('nova-product-development-leadership', 'Coordinated a team of ten engineers and developers on embedded product initiatives.', 'Coordenei uma equipe de dez engenheiros e desenvolvedores em iniciativas de produtos embarcados.', ['leadership', 'embedded'], 95),
      h('nova-yocto-embedded-linux', 'Developed and maintained Embedded Linux operating systems and kernels with the Yocto Project for industrial products.', 'Desenvolvi e mantive sistemas e kernels Linux embarcados com Yocto Project para produtos industriais.', ['embedded'], 90),
      h('nova-cybersecurity-compliance', 'Applied cybersecurity measures aligned with IEC 62443 and O-PAS requirements to strengthen embedded-system security and integrity.', 'Apliquei medidas de cibersegurança alinhadas aos requisitos da IEC 62443 e do O-PAS para fortalecer a segurança e a integridade de sistemas embarcados.', ['embedded', 'research'], 90, 'Applied cybersecurity measures aligned with IEC 62443 and O-PAS requirements to strengthen the security and integrity of embedded systems.'),
      h('nova-industrial-software', 'Developed Windows desktop and Embedded Linux applications for System302, plus internal workflow tools using C/C++, Python, Java, and shell scripting.', 'Desenvolvi aplicações desktop para Windows e aplicações em Embedded Linux para o System302, além de ferramentas internas de fluxo de trabalho com C/C++, Python, Java e shell scripting.', ['embedded'], 85),
      h('nova-system302-quality-assurance', 'Coordinated System302 quality assurance by defining test plans, test cases, priorities, milestones, and issue follow-up.', 'Coordenei a garantia de qualidade do System302, definindo planos e casos de teste, prioridades, marcos e acompanhamento de problemas.', ['devops', 'leadership'], 80),
      h('nova-security-ai-research', 'Researched cybersecurity and artificial intelligence for industrial automation and built proof-of-concept solutions that supported approved project proposals.', 'Pesquisei cibersegurança e inteligência artificial para automação industrial e desenvolvi provas de conceito que contribuíram para propostas de projetos aprovadas.', ['research'], 75),
    ], tags: ['C/C++', 'Python', 'Shellscript', 'Embedded Linux', 'Yocto Project', 'Networking', 'OPC UA', 'Modbus', 'Fieldbus', 'HSE', 'Cybersecurity', 'Technical Leadership', 'Git & CI/CD', 'Industrial Automation', 'Machine Learning', 'Embedded Software', 'Kernel', 'Java', 'Artificial Intelligence', 'Automation', 'Quality Assurance', 'Technical Documentation', 'Research and Development (R&D)', 'GitLab', 'Jira', 'Confluence', 'Bitbucket', 'Trello', 'Mantis Bug Tracker', 'Scrum', 'Kanban', 'OKR'], verification: 'verified',
  },
];
