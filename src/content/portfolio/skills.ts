import type { SkillGroup, Theme } from './types';

const skill = (id: string, name: string, themes: Theme[], priority: number) => ({ id, name, themes, priority });

export const skillGroups: SkillGroup[] = [
  { id: 'languages', name: { en: 'Languages', 'pt-br': 'Linguagens' }, priority: 95, skills: [
    skill('skill-c-cpp', 'C/C++', ['embedded'], 100), skill('skill-python', 'Python', ['embedded', 'devops', 'research'], 95),
    skill('skill-rust', 'Rust', ['embedded'], 80), skill('skill-go', 'Go', ['devops'], 65), skill('skill-shellscript', 'Shellscript', ['devops'], 85),
    skill('skill-javascript', 'JavaScript', ['general'], 65), skill('skill-kotlin', 'Kotlin', ['general'], 55), skill('skill-matlab', 'Matlab', ['research'], 60),
  ]},
  { id: 'embedded-platforms', name: { en: 'Embedded & Platforms', 'pt-br': 'Embarcados e Plataformas' }, priority: 100, skills: [
    skill('skill-embedded-linux', 'Embedded Linux', ['embedded'], 100), skill('skill-vxworks', 'VxWorks', ['embedded'], 85), skill('skill-yocto-project', 'Yocto Project', ['embedded'], 90),
    skill('skill-buildroot', 'Buildroot', ['embedded'], 80), skill('skill-qemu', 'QEMU', ['embedded', 'devops'], 80), skill('skill-kernel', 'Kernel', ['embedded'], 85),
    skill('skill-kernel-module', 'Kernel Module', ['embedded'], 80), skill('skill-linux', 'Linux', ['embedded'], 90),
    skill('skill-embedded-systems', 'Embedded Systems', ['embedded'], 95), skill('skill-qt', 'Qt', ['embedded'], 65), skill('skill-android', 'Android', ['general'], 50),
  ]},
  { id: 'networking-protocols', name: { en: 'Networking & Protocols', 'pt-br': 'Redes e Protocolos' }, priority: 95, skills: [
    skill('skill-networking', 'Networking', ['embedded'], 95), skill('skill-l2-protocols', 'L2 Protocols', ['embedded'], 90), skill('skill-l3-protocols', 'L3 Protocols', ['embedded'], 90),
    skill('skill-ethernet-ip', 'EtherNet/IP', ['embedded'], 90), skill('skill-dlr', 'DLR', ['embedded'], 90), skill('skill-rstp', 'RSTP', ['embedded'], 85),
    skill('skill-opc-ua', 'OPC UA', ['embedded', 'research'], 95), skill('skill-modbus', 'Modbus', ['embedded'], 85), skill('skill-ospf', 'OSPF', ['embedded'], 80),
    skill('skill-bgp', 'BGP', ['embedded'], 80), skill('skill-fieldbus', 'Fieldbus', ['embedded'], 80), skill('skill-hse', 'HSE', ['embedded'], 70),
  ]},
  { id: 'devops-tooling', name: { en: 'DevOps & Tooling', 'pt-br': 'DevOps e Ferramentas' }, priority: 90, skills: [
    skill('skill-git-cicd', 'Git & CI/CD', ['devops'], 100), skill('skill-devops', 'DevOps', ['devops'], 95), skill('skill-tdd', 'TDD', ['devops'], 90),
    skill('skill-googletest', 'GoogleTest', ['devops'], 80), skill('skill-robot-framework', 'Robot Framework', ['devops'], 80), skill('skill-jenkins', 'Jenkins', ['devops'], 85),
    skill('skill-automation', 'Automation', ['devops'], 85), skill('skill-tui', 'TUI', ['general'], 55), skill('skill-web-development', 'Web Development', ['general'], 55),
    skill('skill-react', 'React', ['general'], 55), skill('skill-nodejs', 'Node.js', ['general'], 55), skill('skill-data-engineering', 'Data Engineering', ['research'], 55),
  ]},
  { id: 'leadership', name: { en: 'Leadership', 'pt-br': 'Liderança' }, priority: 90, skills: [
    skill('skill-technical-leadership', 'Technical Leadership', ['leadership'], 100), skill('skill-leadership', 'Leadership', ['leadership'], 95), skill('skill-management', 'Management', ['leadership'], 80),
  ]},
  { id: 'research', name: { en: 'Research', 'pt-br': 'Pesquisa' }, priority: 85, skills: [
    skill('skill-cybersecurity', 'Cybersecurity', ['research', 'embedded'], 95), skill('skill-machine-learning', 'Machine Learning', ['research'], 90),
    skill('skill-artificial-intelligence', 'Artificial Intelligence', ['research'], 80), skill('skill-industrial-automation', 'Industrial Automation', ['embedded', 'research'], 100),
    skill('skill-iot', 'IIoT', ['embedded', 'research'], 90), skill('skill-network-security', 'Network Security', ['research'], 90),
    skill('skill-software-engineering', 'Software Engineering', ['general'], 85), skill('skill-digitalization', 'Digitalization', ['research'], 65),
    skill('skill-cloud-computing', 'Cloud Computing', ['research'], 65), skill('skill-latex', 'LaTeX', ['research'], 60),
    skill('skill-telecommunications', 'Telecommunications', ['embedded'], 85),
  ]},
];
