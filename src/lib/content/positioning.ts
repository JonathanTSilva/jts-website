import type { Locale } from './locale';

const startYear = 2020;
const currentYear = new Date().getFullYear();
const yearsOfExp = `${currentYear - startYear}+`;

const HERO_POSITIONING = {
  en: {
    label: '// SENIOR EMBEDDED SOFTWARE ENGINEER',
    name: 'Jonathan Tobias',
    typewriterPrefix: 'dedicated to ',
    typewriterPhrases: [
      'software engineering',
      'linux environments',
      'CLI and TUI applications',
      'embedded software and systems',
      'scalable and robust firmware',
      'task and process automation',
      'technical leadership',
      'R&D engineering',
      'solving complex problems'
    ],
    tagline: 'Leading the development of software solutions for embedded systems in industrial automation and telecommunications, focusing on technical excellence and delivery. Bridging the gap between hardware and software to solve complex industrial challenges with scalable and robust firmware architecture.',
    achievements: [
      { value: yearsOfExp, label: 'Years of Experience' },
      { value: 'M.Sc.', label: 'Electrical Eng.' },
      { value: '3+', label: 'Technical Teams Led/Coordinated' },
      { value: '30+', label: 'Industrial R&D Projects' }
    ],
    profileAlt: 'Jonathan Tobias',
    portfolioCta: 'View Portfolio',
    blogCta: 'Read Blog',
    notesCta: 'Check my notes'
  },
  'pt-br': {
    label: '// ENGENHEIRO SÊNIOR DE SOFTWARE EMBARCADO',
    name: 'Jonathan Tobias',
    typewriterPrefix: 'dedicado a ',
    typewriterPhrases: [
      'engenharia de software',
      'ambientes linux',
      'aplicativos CLI e TUI',
      'sistemas e software embarcado',
      'firmware escalável e robusto',
      'automação de tarefas e processos',
      'liderança técnica',
      'engenharia de P&D',
      'resolução de problemas complexos'
    ],
    tagline: 'Liderando o desenvolvimento de soluções de software para sistemas embarcados nas áreas de automação industrial e telecomunicações, com foco em excelência técnica e entrega. Unindo hardware e software para resolver desafios industriais complexos por meio de arquiteturas de firmware escaláveis e robustas.',
    achievements: [
      { value: yearsOfExp, label: 'Anos de Experiência' },
      { value: 'M.Sc.', label: 'Eng. Elétrica' },
      { value: '3+', label: 'Equipes Lideradas' },
      { value: '30+', label: 'Projetos de P&D' }
    ],
    profileAlt: 'Jonathan Tobias',
    portfolioCta: 'Ver Portfólio',
    blogCta: 'Ler Blog',
    notesCta: 'Ver minhas notas'
  }
} as const;

export function getHeroPositioning(locale: Locale) {
  return HERO_POSITIONING[locale];
}
