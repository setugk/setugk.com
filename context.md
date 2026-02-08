# setugk.com — Project Context

> **Read `../../Claude Code/constitution/constitution.md` first** for universal conventions (content system, git rules, design standards, session startup).
> Then use this file for everything specific to setugk.com.

## What is setugk.com?
A dark, minimalist, typography-driven personal resume site. Single page, no framework, static HTML/CSS/JS. Positions Setu as an AI-ready product designer for senior/staff-level roles.

## Repo
- GitHub: https://github.com/setugk/setugk.com
- Branch: `main`
- Single committer, no CI/CD — push directly to main
- Hosted on Cloudflare Pages, auto-deploys from GitHub main branch
- Domain: setugk.com (DNS on Cloudflare)

## File structure
```
setugk.com/
  index.html              # Single-page resume
  css/
    styles.css            # All styling (dark theme, responsive, print)
  context/
    resume/
      setu-kathawate-resume.pdf
      setu-kathawate-resume.txt
    case-studies/
      TEMPLATE.md         # Template for case studies
      data-intelligence.md
      driver-support.md
  context.md              # This file
```

## Tech
- Static HTML/CSS/JS — no build step, no framework
- Google Fonts (Inter: 400, 500, 600, 700)
- Intersection Observer for fade-in animations on scroll
- Print stylesheet for PDF export (light theme, compact layout)

## Design tokens
```
Background: #111111
Body text: #aaa
Headings: #e0e0e0 / #ddd
Accent: #e08a5e (warm copper)
Emphasis: font-weight 500, color #ddd
Dividers: #1e1e1e
Font: Inter
Type scale: 2.25rem/700 (name), 0.9375rem/400 (body), 0.8125rem/400 (small)
```

## Design principles
- Hierarchy through font size, weight, and color — not visual containers
- No cards, boxes, or unnecessary elements
- `text-wrap: pretty` and `&nbsp;` for orphan prevention
- Fade-in animations on scroll, hero fade-in on load

## Key links in the page
- Portfolio: https://www.setumadhava.com
- Northstar: https://northstar.s37u.com
- Seafile MCP: https://github.com/setugk/seafile-mcp
- Resume PDF: /context/resume/setu-kathawate-resume.pdf

## Positioning
Setu is positioning himself as an AI-ready designer for senior/staff-level roles in 2026. The core narrative:
- A designer who can prototype, validate, and ship end-to-end — no longer limited by the design-to-dev handoff.
- AI is an amplifier of his existing UX instincts, not a separate skill.
- He doesn't just use AI tools — he builds and publishes them (Seafile MCP Server).
- Leading AI integration efforts within his design studio at Amazon.
- The resume should read like a senior/staff designer who operates in ambiguity, defines problems, and influences at the director level.

## Resume content sources
- Original resume: `Setu Kathawate Resume [2025] .docx` (in parent folder)
- Amazon end-of-year performance review (provided in conversation, not saved as file)
- Seafile MCP project: https://github.com/setugk/seafile-mcp

## Skills (current)
1. AI-Native Design & Agentic UX — includes prompt engineering, constitution design, trust frameworks
2. Full-Stack Prototyping & Development — React, Node.js, AWS Bedrock, Cursor, Claude Code, Vercel V0, Lovable, Kiro
3. Security & Privacy for AI — prompt injection, transparency policy, defense-in-depth
4. Design & Collaboration Tools — Figma, GitHub, Vercel, Python, HTML/CSS/JS
5. Product Thinking & UX Strategy
6. Design Operations & Leadership — 45-person design studio, documentation-as-code

## Open items
- Data Intelligence platform bullet needs outcomes (active project)
- Case study pages — at least one deep dive (Driver Support or Data Intelligence)
- Home Depot bullets could use more specifics if Setu remembers product/user details
- Resume PDF needs to be re-saved after today's content changes
- May migrate to Astro or Next.js when blog/case study content is added

## Project-specific conventions
- No version number — this isn't a versioned app
- Resume PDF must be re-saved manually when HTML content changes
