import type { Publication as CanonicalPublication } from './schema';
import type { LegacyPublicationFields } from './types';

const sourcePublications: LegacyPublicationFields[] = [
  {
    title: {
      en: "A Survey on OPC UA protocol: overview, challenges and opportunities",
      "pt-br": "Um levantamento sobre o protocolo OPC UA: visão geral, desafios e oportunidades",
    },
    publisher: "IEEE Xplore",
    date: "2023-12",
    link: "https://ieeexplore.ieee.org/document/10375053",
    type: "paper",
  },
  {
    title: {
      en: "An intelligent fault diagnosis for centrifugal pumps based on electric current information",
      "pt-br": "Um diagnóstico inteligente de falhas para bombas centrífugas baseado em informações de corrente elétrica",
    },
    publisher: "IEEE Xplore",
    date: "2021-08",
    link: "https://ieeexplore.ieee.org/document/9529678",
    type: "paper",
  },
  {
    title: {
      en: "Strengthening Industrial Automation: Best Practices in Cybersecurity",
      "pt-br": "Fortalecendo a Automação Industrial: Melhores Práticas em Cibersegurança",
    },
    publisher: "Controle & Instrumentação (Valete)",
    date: "2023-05",
    link: "https://issuu.com/editora_valete/docs/ci284",
    type: "article",
  },
  {
    title: {
      en: "Development of a WEB application for sizing electric motor drive equipment",
      "pt-br": "Desenvolvimento de uma aplicação WEB para dimensionamento de equipamentos de acionamento de motores elétricos",
    },
    publisher: "IFSP",
    date: "2019-10",
    link: "http://ocs.ifsp.edu.br/index.php/conict/xconict/paper/view/5795/1289",
    type: "paper",
  }
];

const publicationDetails = [
  { id: 'publication-opc-ua-survey', authors: ['Jonathan Tobias da Silva', 'A. L. Dias', 'I. N. da Silva'], themes: ['research', 'embedded'] as const },
  { id: 'publication-pump-fault-diagnosis', authors: ['A. L. Dias', 'Jonathan Tobias da Silva', 'A. C. Turcato', 'G. S. Sestito'], themes: ['research'] as const },
  { id: 'publication-industrial-automation-cybersecurity', authors: ['Jonathan Tobias da Silva', 'O. Paschoal'], themes: ['research', 'embedded'] as const },
  { id: 'publication-web-motor-drive-sizing', authors: ['Jonathan Tobias da Silva', 'A. L. Dias', 'N. F. D. F. Filho', 'A. C. Turcato'], themes: ['research'] as const },
] as const;

// TODO(Task 3): publisher/link/date aliases keep current Astro consumers compiling.
export const publications = sourcePublications.map((publication, index) => ({
  ...publication,
  id: publicationDetails[index]!.id,
  authors: [...publicationDetails[index]!.authors],
  venue: publication.publisher,
  themes: [...publicationDetails[index]!.themes],
  priority: 75,
}));

export const canonicalPublications: CanonicalPublication[] = publications.map(publication => ({
  id: publication.id,
  title: publication.title,
  authors: publication.authors,
  venue: publication.venue,
  date: { value: publication.date, precision: 'month' },
  type: publication.type,
  ...(publication.link?.startsWith('https://') ? { url: publication.link } : {}),
  themes: publication.themes,
  priority: publication.priority,
}));
