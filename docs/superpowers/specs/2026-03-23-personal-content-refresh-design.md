# Personal Content Refresh Design Spec
**Date:** 2026-03-23
**Branch base:** `feature/content-update`
**Scope:** Homepage positioning copy · Portfolio biography and structured profile data · Contact/identity cleanup · Editorial consistency across EN/PT-BR

---

## 1. Objective

Replace the remaining placeholder and demo information in the personal site with credible, high-signal professional content drawn from the user's CV, LinkedIn profile, and prior personal website.

The site should position Jonathan primarily as a **Senior Embedded Software Engineer** while also supporting adjacent opportunities in:
- senior individual-contributor engineering roles
- technical leadership roles
- R&D manager and related management paths

The final content system should read as **technical-first, leadership-capable**:
- embedded software and systems depth is the headline
- technical leadership and people/project leadership are visible support
- AI and cybersecurity remain part of the broader profile, but are not a homepage headline

---

## 2. Editorial Positioning

### Primary Position

The site should present Jonathan first as a:

**Senior Embedded Software Engineer**

This is the fixed anchor across homepage, portfolio, metadata, and supporting copy.

### Secondary Positioning

The supporting narrative should communicate that Jonathan:
- solves complex embedded software and systems problems
- leads technically as a hands-on engineer
- has real people/project leadership experience
- can credibly fit senior IC, tech lead, and R&D manager trajectories

### Tone

The editorial tone should be:

**Technical and credible, with executive maturity**

That means:
- short, precise wording
- strong nouns and verbs over buzzwords
- clear evidence instead of inflated claims
- visible leadership scope without sounding management-only

The copy should avoid generic language such as:
- "innovative professional"
- "dynamic engineer"
- "results-driven leader"
- "passionate about technology"

Use proof-oriented language instead:
- embedded software
- firmware
- systems engineering
- technical leadership
- project coordination
- R&D
- M.Sc. in Electrical and Computer Engineering

---

## 3. Content Model by Surface

### Homepage

The homepage is a positioning surface, not a full biography.

It should establish three things quickly:
- Jonathan is a Senior Embedded Software Engineer
- he works on complex embedded software and systems challenges
- he brings both technical leadership and people/project leadership

The homepage should not attempt to explain the full profile. It should not foreground AI or cybersecurity. Those belong deeper in the portfolio narrative.

### Portfolio

The portfolio page is the authoritative professional profile.

It should provide the fuller narrative:
- professional summary
- experience timeline
- projects
- publications
- educational background
- domain breadth, including R&D and adjacent technical areas

### Now / Blog / Notes

These sections are supporting surfaces.

They should feel consistent with the main professional positioning, but they do not need to carry the full career summary. Their role is to show current focus and technical thinking rather than resume-style content.

### Footer / Metadata / Identity

These surfaces must stop using placeholders and should consistently reflect Jonathan's real public identity and contact endpoints.

---

## 4. Homepage Content Design

### 4a. Hero Headline

The hero headline should remain short and sharp.

Required headline direction:

**Senior Embedded Software Engineer**

This can appear either as the hero label, the rotating value proposition context, or both, but the visible first impression must clearly anchor to this title.

### 4b. Hero Supporting Line

The hero supporting line should broaden the story without diluting the role.

It should communicate:
- complex problem-solving
- embedded software and systems
- hands-on technical leadership
- project/people leadership range

It should not:
- mention AI or cybersecurity on the homepage
- become a long paragraph
- read like a mission statement

Target style:
- one short sentence or compact phrase
- high information density
- no corporate filler

### 4c. Leadership Signal

The homepage should show a hybrid of:
- technical leadership
- people/project leadership

This signal should be explicit enough to support manager-track readers, but subtle enough that the page still reads as engineering-first.

Appropriate concepts for homepage copy:
- technical leadership
- project coordination
- team leadership
- delivery ownership

Avoid framing that would make the homepage read like a pure management resume.

### 4d. Academic Signal

The homepage should include only a quick academic credibility cue, such as:
- M.Sc. in Electrical and Computer Engineering

Detailed education belongs on the portfolio page.

### 4e. Hero Metrics / Achievement Boxes

The current achievement boxes must be validated against source material before publication.

Rule:
- keep only claims supported by the personal-information source
- soften or remove any unsupported metrics
- prefer credible specifics over inflated numbers

If exact counts remain uncertain, replace quantitative claims with safer signals such as:
- technical leadership
- R&D experience
- systems delivery
- master's degree

---

## 5. Portfolio Narrative Design

### 5a. About Summary

The about section in both English and Portuguese should be rewritten as a sharper professional summary.

Required content themes:
- Senior Embedded Software Engineer as the anchor identity
- hands-on experience in embedded software and systems
- technical leadership plus people/project management experience
- M.Sc. in Electrical and Computer Engineering
- broader R&D and cross-domain scope as supporting context

The about section should not read like a copied CV paragraph. It should read like an authored professional profile.

### 5b. Experience Timeline

The structured experience timeline should be updated from demo data to Jonathan's real profile.

It should represent:
- actual companies or institutional affiliations that Jonathan wants public
- accurate roles and date ranges
- credible summaries of scope and responsibility
- leadership evidence where appropriate

Descriptions should emphasize:
- embedded software/system responsibilities
- ownership and delivery
- technical leadership
- coordination or management scope when real

### 5c. Projects

The projects section should be converted from generic examples to real projects Jonathan wants to showcase publicly.

Project entries should favor:
- representative technical depth
- role clarity
- practical impact
- domain relevance to embedded software and systems

If some real projects are confidential, the site may use generalized descriptions that remain truthful while protecting sensitive details.

### 5d. Publications

The publications section should be updated to real publications, talks, presentations, or other public technical outputs, if available.

If publication volume is low, quality is more important than count. It is acceptable to show a small number of real entries rather than filler.

### 5e. Education

The timeline and supporting copy should accurately reflect:
- M.Sc. in Electrical and Computer Engineering
- Bachelor's degree in Electrical Engineering
- Technical degree in Administration

Education entries should support credibility, not dominate the narrative.

### 5f. Broader Technical Scope

Portfolio copy may mention adjacent areas such as:
- AI
- cybersecurity
- operational technology / information technology intersection
- broader software engineering

These themes should appear as part of the wider professional scope, not as competing homepage identities.

---

## 6. Contact, Identity, and Metadata

All placeholder identity and link data must be replaced with real public information.

This includes, at minimum:
- hero email link
- hero LinkedIn link
- hero GitHub link
- footer LinkedIn link
- footer GitHub/email/RSS data if applicable
- visible display name occurrences
- author name and avatar alt text where needed
- CV link validation

If ORCID or other public profiles remain part of Jonathan's preferred identity, they may be included where the existing layout supports them naturally.

Rule:
- do not leave any `example.com`, `/example`, or placeholder contact strings in the production site

---

## 7. Bilingual Content Strategy

The site supports English and pt-BR. The content refresh should treat the two locales as equivalent first-class surfaces.

### English

English should read as natural professional copy for an international audience. It should not sound like a literal translation from Portuguese.

### Portuguese (pt-BR)

Portuguese should read as native professional Brazilian Portuguese. It should preserve the same positioning, but not mirror the English line-for-line where natural phrasing differs.

### Translation Policy

The two versions should preserve the same professional meaning:
- same role anchor
- same leadership range
- same factual claims

But the wording may differ to sound native in each language.

---

## 8. Source-of-Truth and Evidence Rules

The source material is:
- CV
- LinkedIn
- old website content
- `docs/superpowers/specs/personal-information.md`

When sources differ, use these rules:

1. Prefer the most current and credible version of factual details.
2. Prefer stronger wording only if it remains defensible.
3. Do not invent numbers, responsibilities, or public claims.
4. If a detail is ambiguous, either verify it with the user or omit/soften it.

This content pass must improve persuasion without reducing factual integrity.

---

## 9. Target Files

The implementation should be expected to touch at least these content surfaces:

- `src/components/home/Hero.astro`
- `src/components/site/Footer.astro`
- `src/content/portfolio/about.en.md`
- `src/content/portfolio/about.pt-br.md`
- `src/content/portfolio/experience.ts`
- `src/content/portfolio/projects.ts`
- `src/content/portfolio/publications.ts`
- `src/content/now/index.en.md`
- `src/content/now/index.pt-br.md`

Additional pages or metadata files may also need updates if placeholders are discovered during implementation.

---

## 10. Non-Goals

This content refresh does not change:
- layout structure
- visual design system
- component architecture
- animation behavior
- major information architecture

The goal is to replace placeholder/demo information with a cohesive, persuasive, factual professional narrative using the existing frontend foundation.

---

## 11. Verification Requirements

Implementation should be considered complete only if:
- all obvious placeholder links and identity values are removed
- homepage and portfolio positioning remain consistent
- English and pt-BR both read naturally
- structured content uses real or intentionally generalized-but-true entries
- no unsupported factual claims are introduced
- existing site checks and tests still pass

---

## 12. Recommended Implementation Order

1. Replace placeholder contact and identity information.
2. Rewrite homepage hero copy and credibility signals.
3. Rewrite portfolio about copy in EN and pt-BR.
4. Replace structured experience, projects, and publications data.
5. Refresh `now` content so it reflects current professional reality.
6. Run validation and full site tests.

This order reduces the risk of leaving the site half-generic while content is being updated.
