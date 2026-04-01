# Site Governance, SEO, and Analytics Design Spec
**Date:** 2026-03-31
**Branch base:** `main`
**Scope:** Analytics and lead tracking · Consent and cookies · Privacy policy and terms · Technical SEO hardening · Ongoing governance and maintenance

---

## 1. Objective

Establish a practical, maintainable foundation for operating the personal website as a public professional property rather than a purely static portfolio.

The site should:
- measure meaningful visitor activity
- track lead/contact intent without excessive instrumentation
- present accurate consent and legal disclosures
- improve technical SEO and search discoverability
- remain lightweight enough for a personal static site

This work is explicitly scoped as a **3-phase roadmap** so the implementation can be delivered incrementally without mixing legal, analytics, and SEO concerns into one large change set.

---

## 2. Product Intent

The site is a bilingual personal website and professional portfolio, not a SaaS application.

That affects the design in four ways:
- analytics should answer practical questions, not create a marketing-automation stack
- consent should be clear and visually integrated, not overbuilt
- legal pages should accurately describe a personal website with blog, notes, portfolio, downloads, and contact links
- SEO should focus on discoverability, clarity, and correctness rather than score-chasing

The intended operating posture is:

**Balanced**

Meaning:
- better-than-basic measurement
- explicit lead/contact tracking
- international-lite legal coverage
- technically strong SEO
- low to moderate ongoing maintenance burden

---

## 3. Decision Summary

### 3a. Roadmap Structure

The work will be split into:
- **Phase 1:** Analytics, consent, cookies, and legal foundation
- **Phase 2:** Technical SEO hardening
- **Phase 3:** Optimization, monitoring, and maintenance

This sequence is required because Phase 1 defines what data is collected and disclosed. SEO work in Phase 2 should build on a legally and operationally coherent site foundation.

### 3b. Analytics Recommendation

The default recommendation is a **hosted analytics service** rather than self-hosting.

Reasoning:
- the website is static-first and personal in scope
- hosted analytics avoids introducing unnecessary infrastructure work
- reliability and maintenance overhead matter more here than full infrastructure ownership

Self-hosting remains a valid fallback if the user later decides that data ownership outweighs operational simplicity, but it should not be the default plan.

### 3c. Consent Recommendation

Consent should be implemented through a **small branded consent banner** integrated with the existing visual language of the site.

Requirements:
- compact footprint
- clear choice architecture
- no visual clash with the current design system
- accurate relationship between user choice and analytics activation

### 3d. Legal Baseline

The legal writing should follow an **international-lite** posture.

That means:
- write for global visitors in plain language
- disclose real behaviors and third-party services
- avoid pretending to offer jurisdiction-perfect coverage for every region
- maintain wording that is defensible for a personal portfolio/blog

---

## 4. Non-Goals

The roadmap should not attempt to deliver:
- a full CMP platform with complex vendor management
- enterprise-grade legal compliance coverage for every jurisdiction
- ad-tech style visitor profiling
- CRM, newsletter, or sales pipeline automation
- SEO tactics that depend on heavy plugins or brittle content hacks

If future needs expand beyond the current personal-site scope, those should be specified as a separate follow-up project.

---

## 5. Current State Assessment

The site already includes useful foundations:
- shared layout and SEO head components
- bilingual route structure with EN and PT-BR
- canonical and alternate locale metadata
- footer links for privacy and terms pages
- placeholder privacy and terms pages in both languages
- static architecture suited to predictable metadata generation

The current gaps are:
- privacy and terms pages are placeholders
- SEO metadata is present but still minimal
- no analytics or event tracking foundation is defined
- no consent or cookie management behavior exists
- no governance documentation exists for keeping tracking, disclosures, and SEO aligned over time

This makes the current site a good candidate for an incremental roadmap rather than a redesign.

---

## 6. Architecture Overview

The architecture should keep all cross-cutting behavior centralized.

### 6a. Site-Wide Integration Layer

The global layout should remain the control point for:
- consent initialization
- conditional analytics script loading
- site-wide tracking availability
- any shared legal/consent UI entry points

This keeps analytics and consent behavior out of page-specific templates unless a page has a truly unique tracking need.

### 6b. Event Tracking Layer

Custom events should be defined through a small, explicit interface rather than ad hoc inline snippets.

Tracked actions should be limited to high-signal interactions such as:
- `cv_download`
- `email_click`
- `linkedin_click`
- `github_click`
- `contact_section_view` only if it proves useful and not noisy

The event layer should make it obvious:
- what event names exist
- where they are fired
- which attributes are allowed

### 6c. Legal Content Layer

Privacy and terms should remain regular content pages rendered by the existing site layout and translated for both locales.

They should include:
- effective date
- summary of what the site is
- what data is collected
- third-party services used
- cookie/consent explanation
- contact channel for privacy questions

### 6d. SEO Metadata Layer

SEO generation should continue to be centralized so metadata rules stay consistent across page types.

Enhancements should build on existing metadata generation rather than adding per-page duplication wherever possible.

### 6e. Governance Layer

The roadmap should produce lightweight documentation that explains:
- what is being tracked
- where consent is enforced
- what third parties are active
- how legal pages should be updated when site behavior changes
- what SEO checks must remain true over time

---

## 7. Phase 1: Analytics, Consent, and Legal Foundation

### 7a. Goal

Create a truthful and usable measurement foundation for the site while replacing placeholder legal pages with production-ready content.

At the end of Phase 1, the site should be able to answer:
- how many visitors arrive
- which pages matter most
- where visitors come from
- whether visitors click contact-oriented actions
- what the site discloses about that behavior

### 7b. Scope

Phase 1 includes:
- analytics provider selection
- pageview tracking
- referrer and top-page visibility through the provider
- lead/contact event tracking
- consent banner and consent storage behavior
- cookie disclosure alignment
- bilingual privacy policy v1
- bilingual terms of service v1
- footer and legal-surface cleanup as needed
- implementation notes documenting the final data flows

Phase 1 does not include:
- SEO schema rollout
- deep content optimization
- ongoing reporting automation

### 7c. Functional Requirements

The analytics solution must:
- support pageview tracking for a static site
- provide useful acquisition and content-level reporting
- support custom events for lead/contact actions
- work cleanly with a consent-gated loading model

The site must track the following high-value actions at minimum:
- CV download
- email click
- LinkedIn outbound click
- GitHub outbound click

The consent experience must:
- appear only when needed
- allow a clear accept/reject path
- be visually compact
- match the existing site style
- not enable optional analytics before the appropriate choice is made

The legal pages must:
- reflect the actual behavior of the site
- mention analytics and cookies where applicable
- describe contact methods and downloadable assets
- avoid product/company boilerplate irrelevant to a personal site

### 7d. UX Requirements

The consent banner should feel like part of the site, not an injected widget.

Design direction:
- small footprint
- clear hierarchy
- short copy
- visible but not disruptive
- works on desktop and mobile

Because the site already has a defined visual language, Phase 1 should reuse that system instead of introducing a separate legal/consent aesthetic.

### 7e. Risks

Primary risks:
- selecting a provider whose consent model is more complex than the site needs
- writing legal text that overpromises or describes behavior not yet implemented
- firing contact events inconsistently across locales or components

### 7f. Success Criteria

Phase 1 is complete when:
- analytics is active according to the selected consent model
- lead/contact events are visible in the analytics tool
- privacy and terms pages exist in EN and PT-BR with production-ready content
- the site’s disclosures match its actual analytics and cookies behavior
- a future maintainer can identify the site’s tracking behavior quickly from documentation

---

## 8. Phase 2: Technical SEO Hardening

### 8a. Goal

Improve crawlability, metadata quality, indexing clarity, multilingual search signals, and share-preview quality without changing the editorial identity of the site.

### 8b. Scope

Phase 2 includes:
- metadata rule review by page type
- title and description quality improvements
- canonical verification
- `hreflang` verification across EN and PT-BR
- sitemap and robots review
- structured data where high-value and maintainable
- internal linking improvements across major sections
- SEO quality checklist documentation

Phase 2 does not include:
- content rewriting across all posts
- backlink campaigns
- analytics dashboard reporting work

### 8c. Functional Requirements

The site should expose reliable metadata for:
- homepage
- portfolio
- blog index and article pages
- notes index and note pages
- now page
- legal pages

Structured data should prioritize maintainable, high-signal entities such as:
- `Person`
- `WebSite`
- `Blog`
- `Article`

Any schema choice must map clearly to real site content. If a schema type requires guesswork or filler properties, it should be omitted.

### 8d. Quality Requirements

Phase 2 should verify that:
- canonical URLs match deployed public URLs
- alternate locale links map correctly between translations
- titles and descriptions are distinct and useful
- social preview metadata remains consistent with canonical metadata
- no legal or thin utility pages accidentally degrade metadata quality

### 8e. Risks

Primary risks:
- adding schema that is technically valid but semantically weak
- overcomplicating metadata generation for little search benefit
- introducing locale/canonical mismatches that create indexing ambiguity

### 8f. Success Criteria

Phase 2 is complete when:
- core page types have clear metadata rules
- multilingual canonical and alternate relationships are verified
- structured data is present only where justified
- indexing-oriented configuration is documented and reproducible

---

## 9. Phase 3: Optimization, Monitoring, and Maintenance

### 9a. Goal

Turn the Phase 1 and Phase 2 foundations into a stable operating routine so analytics, consent, legal accuracy, and SEO quality do not drift over time.

### 9b. Scope

Phase 3 includes:
- analytics review routine definition
- event taxonomy refinement based on actual data usefulness
- maintenance rules for updating legal pages when behavior changes
- maintenance rules for updating SEO configuration when new page types are added
- automated verification where low-cost and justified
- long-lived governance documentation

### 9c. Functional Requirements

The maintenance layer should define:
- what to review weekly or monthly
- what changes require legal copy updates
- what changes require consent review
- what changes require metadata/SEO review
- which checks can be automated in CI or tests

Potential candidates for automated verification:
- legal pages exist in both locales
- key metadata tags are present on major page types
- canonical and alternate locale links are generated for translated pages

### 9d. Risks

Primary risks:
- keeping too many rules only in memory instead of documentation
- collecting events that turn out not to be actionable
- allowing site changes to outpace legal or consent updates

### 9e. Success Criteria

Phase 3 is complete when:
- the site has a lightweight maintenance playbook
- unnecessary events have been pruned or clarified
- regression checks exist for high-value SEO/legal surfaces where appropriate
- future changes can be made without rediscovering the whole system

---

## 10. Worktree and Delivery Strategy

Implementation should be done in a dedicated worktree so analytics/legal/SEO changes do not interfere with unrelated site work.

Recommended delivery model:
- create one feature worktree rooted from `main`
- keep the master roadmap spec in the current repository docs
- execute implementation by phase using separate plan documents
- merge phases incrementally rather than waiting for the entire roadmap to finish

This preserves isolation while keeping the roadmap coherent.

---

## 11. Testing and Verification Strategy

Each phase should include verification proportional to its risk.

Phase 1 verification should cover:
- legal page rendering in both locales
- consent UI presence and behavior
- analytics script gating behavior
- lead/contact event firing on the relevant surfaces

Phase 2 verification should cover:
- metadata presence on core page types
- canonical and alternate locale correctness
- structured data output where added

Phase 3 verification should cover:
- maintenance documentation completeness
- any automated SEO/legal regression checks introduced

Manual verification is still important because legal accuracy and analytics usefulness cannot be reduced entirely to test assertions.

---

## 12. Open Decisions for Planning

The implementation plans should resolve these with concrete choices:
- which hosted analytics provider is selected
- whether the consent model uses simple accept/reject or a slightly richer preference model
- whether any additional lead-intent events beyond the core four are worth the added noise
- which structured data types are valuable enough to maintain
- which checks belong in CI versus manual review

These are planning-level decisions, not blockers to approving the roadmap.

---

## 13. Final Recommendation

Proceed with the 3-phase roadmap as specified.

Implementation priority:
1. Phase 1: analytics, consent, legal foundation
2. Phase 2: technical SEO hardening
3. Phase 3: optimization and governance

This roadmap fits the site’s real needs:
- it improves professionalism and operational clarity
- it keeps complexity proportional to a personal site
- it supports measurable lead/contact outcomes
- it preserves the current static-first architecture
