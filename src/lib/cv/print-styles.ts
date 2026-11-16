export const cvPrintStyles = `
@page { size: A4; margin: 12mm 14mm 13mm; }
* { box-sizing: border-box; }
html { font-family: 'Geist CV', Arial, sans-serif; color: #111; background: #fff; }
body { margin: 0; font-size: 9.75pt; line-height: 1.32; }
.cv { display: block; }
.identity { margin-bottom: 10pt; }
h1, h2, h3, p, ul { margin-top: 0; }
h1 { margin-bottom: 2pt; font-size: 18pt; line-height: 1.15; }
h2 { margin: 10pt 0 4pt; border-bottom: 0.5pt solid #111; font-size: 11pt; line-height: 1.2; }
h3 { margin-bottom: 1pt; font-size: 10pt; line-height: 1.25; }
p { margin-bottom: 3pt; }
ul { margin-bottom: 5pt; padding-left: 15pt; }
li { margin-bottom: 1pt; }
.contact-list, .skill-list { padding: 0; list-style: none; }
.contact-list li, .skill-list li { display: inline; }
.contact-list li + li::before, .skill-list li + li::before { content: ' | '; }
a { color: #111; text-decoration: underline; }
section { break-inside: auto; }
h2, .role-heading, .education-item { break-after: avoid; }
.role { break-inside: avoid-page; margin-bottom: 6pt; }
.role-heading { display: block; }
.meta { margin-bottom: 2pt; }
`;
