import type { Locale } from './locale';

export const HERO_POSITIONING = {
  en: {
    label: '// SENIOR EMBEDDED SOFTWARE ENGINEER',
    name: 'Jonathan Tobias da Silva',
    typewriterPrefix: 'expert in ',
    typewriterPhrases: [
      'embedded software and systems',
      'mission-critical firmware',
      'technical leadership',
      'R&D engineering',
      'solving complex problems'
    ],
    tagline: 'Leading the development of robust, high-performance embedded solutions with a focus on technical excellence and delivery.',
    achievements: [
      { value: '6+', label: 'Years of Experience' },
      { value: 'M.Sc.', label: 'Electrical & Computer Eng.' },
      { value: '10+', label: 'Technical Teams Led/Coordinated' },
      { value: '25+', label: 'Industrial R&D Projects' }
    ],
    profileAlt: 'Jonathan Tobias',
    portfolioCta: 'View Portfolio',
    blogCta: 'Read Blog',
    notesCta: 'Check my notes'
  },
  'pt-br': {
    label: '// ENGENHEIRO SÊNIOR DE SOFTWARE EMBARCADO',
    name: 'Jonathan Tobias da Silva',
    typewriterPrefix: 'especialista em ',
    typewriterPhrases: [
      'sistemas e software embarcado',
      'firmware de missão crítica',
      'liderança técnica',
      'engenharia de P&D',
      'resolução de problemas complexos'
    ],
    tagline: 'Liderando o desenvolvimento de soluções embarcadas robustas e de alta performance, com foco em excelência técnica e entrega.',
    achievements: [
      { value: '6+', label: 'Anos de Experiência' },
      { value: 'M.Sc.', label: 'Eng. Elétrica e de Computação' },
      { value: '10+', label: 'Equipes Técnicas Lideradas' },
      { value: '25+', label: 'Projetos de P&D Industrial' }
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
