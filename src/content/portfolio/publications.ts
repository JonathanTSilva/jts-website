import type { Publication } from './schema';

export const publications: Publication[] = [
  {
    id: 'publication-opc-ua-survey',
    title: { en: 'A Survey on OPC UA protocol: overview, challenges and opportunities', 'pt-br': 'Um levantamento sobre o protocolo OPC UA: visão geral, desafios e oportunidades' },
    authors: ['Jonathan Tobias da Silva', 'A. L. Dias', 'I. N. da Silva'], venue: 'IEEE Xplore',
    date: { value: '2023-12', precision: 'month' }, type: 'paper', url: 'https://ieeexplore.ieee.org/document/10375053',
    themes: ['research', 'embedded'], priority: 75,
  },
  {
    id: 'publication-pump-fault-diagnosis',
    title: { en: 'An intelligent fault diagnosis for centrifugal pumps based on electric current information', 'pt-br': 'Um diagnóstico inteligente de falhas para bombas centrífugas baseado em informações de corrente elétrica' },
    authors: ['A. L. Dias', 'Jonathan Tobias da Silva', 'A. C. Turcato', 'G. S. Sestito'], venue: 'IEEE Xplore',
    date: { value: '2021-08', precision: 'month' }, type: 'paper', url: 'https://ieeexplore.ieee.org/document/9529678',
    themes: ['research'], priority: 75,
  },
  {
    id: 'publication-industrial-automation-cybersecurity',
    title: { en: 'Strengthening Industrial Automation: Best Practices in Cybersecurity', 'pt-br': 'Fortalecendo a Automação Industrial: Melhores Práticas em Cibersegurança' },
    authors: ['Jonathan Tobias da Silva', 'O. Paschoal'], venue: 'Controle & Instrumentação (Valete)',
    date: { value: '2023-05', precision: 'month' }, type: 'article', url: 'https://issuu.com/editora_valete/docs/ci284',
    themes: ['research', 'embedded'], priority: 75,
  },
  {
    id: 'publication-web-motor-drive-sizing',
    title: { en: 'Development of a WEB application for sizing electric motor drive equipment', 'pt-br': 'Desenvolvimento de uma aplicação WEB para dimensionamento de equipamentos de acionamento de motores elétricos' },
    authors: ['Jonathan Tobias da Silva', 'A. L. Dias', 'N. F. D. F. Filho', 'A. C. Turcato'], venue: 'IFSP',
    date: { value: '2020', precision: 'year' }, type: 'paper',
    themes: ['research'], priority: 75,
  },
];
