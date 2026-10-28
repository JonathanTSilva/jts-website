import type { Education } from './schema';

export const education: Education[] = [
  {
    id: 'usp-msc-electrical-engineering', institution: 'University of São Paulo (USP)',
    credential: { en: 'M.Sc. in Electrical Engineering', 'pt-br': 'Mestrado em Engenharia Elétrica' },
    location: { en: 'São Carlos, SP, Brazil', 'pt-br': 'São Carlos, SP, Brasil' },
    dates: { start: { value: '2022', precision: 'year' }, end: { value: '2025', precision: 'year' } },
    highlights: [
      { id: 'usp-opc-ua-security-research', webText: { en: 'Research on Industrial Automation Security and OPC UA protocol resilience against cyberattacks.', 'pt-br': 'Pesquisa em Segurança de Automação Industrial e resiliência do protocolo OPC UA contra ataques cibernéticos.' }, themes: ['research', 'embedded'], priority: 90 },
      { id: 'usp-iacs-security-recommendations', webText: { en: 'Develop actionable security recommendations for protecting Industrial Automation and Control Systems (IACS) against evolving threats.', 'pt-br': 'Desenvolvimento de recomendações de segurança acionáveis para proteger Sistemas de Automação e Controle Industrial (IACS) contra ameaças em evolução.' }, themes: ['research'], priority: 80 },
    ], tags: ['OPC UA', 'Cybersecurity', 'IIoT', 'Industrial Automation', 'Network Security'],
  },
  {
    id: 'ifsp-bsc-electrical-engineering', institution: 'Federal Institute of São Paulo (IFSP)',
    credential: { en: 'B.Sc. in Electrical Engineering', 'pt-br': 'Bacharelado em Engenharia Elétrica' },
    location: { en: 'Sertãozinho, SP, Brazil', 'pt-br': 'Sertãozinho, SP, Brasil' },
    dates: { start: { value: '2017', precision: 'year' }, end: { value: '2021', precision: 'year' } },
    highlights: [{ id: 'ifsp-computing-automation-research', webText: { en: 'Specialize in Computer Science and Industrial Automation, completing multiple scientific research projects focused on Digitization and AI.', 'pt-br': 'Especialização em Ciência da Computação e Automação Industrial, com participação em diversos projetos de pesquisa científica focados em Digitalização e IA.' }, themes: ['research', 'embedded'], priority: 75 }],
    tags: ['Software Engineering', 'Automation', 'Embedded Systems', 'Artificial Intelligence', 'Digitalization'],
  },
  {
    id: 'etec-technical-administration', institution: 'State Technical School (ETEC)',
    credential: { en: 'Technical degree in Administration', 'pt-br': 'Técnico em Administração' },
    location: { en: 'Batatais, SP, Brazil', 'pt-br': 'Batatais, SP, Brasil' },
    dates: { start: { value: '2014', precision: 'year' }, end: { value: '2016', precision: 'year' } },
    highlights: [{ id: 'etec-business-leadership-foundation', webText: { en: 'Foundational knowledge in business management and leadership.', 'pt-br': 'Conhecimentos fundamentais em gestão de negócios e liderança.' }, themes: ['leadership'], priority: 55 }],
    tags: ['Leadership', 'Management'],
  },
];
