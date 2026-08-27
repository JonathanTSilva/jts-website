import type { Person } from './schema';

export const person: Person = {
  id: 'jonathan-tobias-da-silva',
  fullName: 'Jonathan Tobias da Silva',
  location: { en: 'São Paulo, Brazil', 'pt-br': 'São Paulo, Brasil' },
  headline: {
    en: 'Senior Embedded/R&D Engineer | Technical Leadership | DevOps',
    'pt-br': 'Engenheiro Sênior de Sistemas Embarcados/P&D | Liderança Técnica | DevOps',
  },
  summary: {
    en: 'Senior software engineer specializing in embedded software and systems across operational and information technology domains.',
    'pt-br': 'Engenheiro de software sênior especializado em software e sistemas embarcados nos domínios de tecnologia operacional e da informação.',
  },
  links: [
    { kind: 'email', label: 'jonathantosilva@hotmail.com', url: 'mailto:jonathantosilva@hotmail.com' },
    { kind: 'website', label: 'jontobias.com', url: 'https://www.jontobias.com' },
    { kind: 'linkedin', label: 'linkedin.com/in/jonathantsilva', url: 'https://www.linkedin.com/in/jonathantsilva/' },
    { kind: 'github', label: 'github.com/JonathanTSilva', url: 'https://github.com/JonathanTSilva' },
    { kind: 'orcid', label: '0000-0002-2511-259X', url: 'https://orcid.org/0000-0002-2511-259X' },
  ],
};
