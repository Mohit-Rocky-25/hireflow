import { LayoutTree } from '../layout';

export function renderHtmlPreview(layout: LayoutTree): string {
  const { header, sections, tokens } = layout;

  const sectionsHtml = sections
    .map(
      (sec) => `
    <section class="resume-section" style="margin-top: ${tokens.spacing.section};">
      <h2 style="font-size: ${tokens.fontSizes.sectionHeading}; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 0.5pt solid ${tokens.colors.rule}; padding-bottom: 2pt; margin-bottom: 4pt; color: ${tokens.colors.text};">
        ${sec.title}
      </h2>
      <div style="font-size: ${tokens.fontSizes.body}; line-height: ${tokens.lineHeight}; color: ${tokens.colors.text};">
        ${sec.lines
          .map((line) => {
            if (line.startsWith('• ')) {
              return `<div style="padding-left: 12pt; text-indent: -10pt; margin-bottom: ${tokens.spacing.paragraph};">${line}</div>`;
            }
            return `<div style="margin-bottom: ${tokens.spacing.paragraph};">${line}</div>`;
          })
          .join('\n')}
      </div>
    </section>
  `
    )
    .join('\n');

  return `
    <div class="ats-resume-document" style="font-family: ${tokens.fontFamily}; max-width: 8.5in; margin: 0 auto; padding: ${tokens.margins.topBottom} ${tokens.margins.sides}; background: #ffffff; text-align: ${tokens.alignment}; box-sizing: border-box;">
      <header style="text-align: center; border-bottom: 1.5pt solid ${tokens.colors.text}; padding-bottom: 6pt; margin-bottom: 8pt;">
        <h1 style="font-size: ${tokens.fontSizes.name}; font-weight: bold; text-transform: uppercase; margin: 0; color: ${tokens.colors.text};">
          ${header.name}
        </h1>
        ${header.title ? `<div style="font-size: ${tokens.fontSizes.meta}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${tokens.colors.secondary}; margin-top: 2pt;">${header.title}</div>` : ''}
        ${header.contactLines
          .map(
            (cLine) =>
              `<div style="font-size: ${tokens.fontSizes.meta}; color: ${tokens.colors.secondary}; margin-top: 2pt;">${cLine}</div>`
          )
          .join('')}
      </header>
      <main>
        ${sectionsHtml}
      </main>
    </div>
  `;
}
