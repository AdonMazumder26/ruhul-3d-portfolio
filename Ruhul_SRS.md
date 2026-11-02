# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## RUHUL.DEV — Beyond the Interface
### A new immersive 3D full-stack developer portfolio

**Document version:** 1.0  
**Status:** Implementation-ready requirements baseline  
**Project directory:** `ruhul-3d-portfolio/`  
**Frontend:** `client/`  
**Backend:** `server/`  
**Primary implementation agent:** Claude Fable 5 through GitHub Copilot Agent mode in VS Code

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification defines the functional, non-functional, visual, technical, data, security, testing, and deployment requirements for a completely new 3D portfolio website for **Ruhul Ma Ani Mazumder**, who prefers to be called **Ruhul**.

The website must present Ruhul as a computer science and engineering student and aspiring full-stack developer through an immersive, polished, interactive experience. It must combine a cinematic 3D landing scene with accessible, readable portfolio content and a real backend for project data and contact submissions.

This document is also the implementation contract for the coding agent. The agent must use it as the source of truth, inspect the current workspace before editing, implement the system in tested increments, and not stop after producing a plan.

## 1.2 Project identity

- **Product name:** RUHUL.DEV
- **Creative direction:** Beyond the Interface
- **Project type:** Personal developer portfolio and project showcase
- **Target audience:** Recruiters, internship reviewers, potential collaborators, developers, clients, and educators
- **Primary objective:** Present skills, projects, background, and contact options in a memorable experience without sacrificing performance or usability.

## 1.3 Scope

The application includes:
- A responsive portfolio frontend built with React and Vite.
- A cinematic 3D hero scene with interactive objects and graceful fallbacks.
- Project exploration with 3D landmarks/cards and dedicated project details.
- A skills constellation or interactive skills visualization.
- About, journey, experience/education, and contact sections.
- A backend API built with Node.js and Express.
- MongoDB persistence for project records and contact submissions.
- Server-side validation, security controls, error handling, and health checks.
- Search-engine metadata, accessibility, reduced-motion support, and responsive layouts.
- Documentation and deployment instructions.

The application does not include user accounts, a public admin dashboard, payments, social-network features, or fabricated project analytics. These may be considered only as future enhancements.

## 1.4 Existing setup and strict repository boundary

The project is a **new, separate repository**. The existing portfolio repository must not be used as the implementation base and must not be modified.

The following commands have already been used from the parent workspace:

```bash
mkdir ruhul-3d-portfolio
cd ruhul-3d-portfolio
git init
npm create vite@latest client -- --template react
cd client
npm install
```

During Vite setup, the selected options were **React, JavaScript, and ESLint**. The user may also have installed the following dependencies already:

```bash
npm install three @react-three/fiber @react-three/drei
npm install framer-motion react-router-dom axios react-icons
npm install tailwindcss @tailwindcss/vite
```

A `server/` folder may already have been initialized with:

```bash
npm init -y
npm install express mongoose dotenv cors helmet express-rate-limit zod
npm install -D nodemon
```

The agent must inspect actual files and `package.json` before assuming any command or dependency is complete. Do not blindly repeat installations, replace configuration unnecessarily, or delete working files. If the `server/` folder does not exist, create it.

**Repository rule:** Do not open, alter, commit to, or push changes to `AdonMazumder26/portfolio-client` or any other existing portfolio repository. Work only inside `ruhul-3d-portfolio/`.

## 1.5 Definitions

- **R3F:** React Three Fiber, a React renderer for Three.js.
- **Drei:** Helpers and abstractions for React Three Fiber.
- **API:** Application Programming Interface.
- **CTA:** Call to action.
- **SRS:** Software Requirements Specification.
- **MVP:** Minimum Viable Product.
- **Progressive enhancement:** Core content remains usable even when optional 3D effects cannot run.

---

# 2. Product Overview

## 2.1 Product vision

Create a portfolio that feels like exploring a small digital universe rather than scrolling through a generic template. The visitor should quickly understand who Ruhul is, what he builds, which technologies he uses, and how to contact him.

The visual experience should be distinctive but not so elaborate that it hides the content, drains laptop batteries, or turns mobile browsing into a slideshow.

## 2.2 User goals

Visitors should be able to:
1. Identify Ruhul and his professional direction within a few seconds.
2. Explore selected projects and understand each project's purpose, role, stack, and current status.
3. Review technical skills without relying on arbitrary skill percentages.
4. Learn about Ruhul's education and development journey.
5. Open relevant source-code or live-demo links when verified URLs exist.
6. Send a message through a validated contact form.
7. Use the website on desktop, tablet, or mobile, with keyboard navigation and reduced-motion support.

## 2.3 Primary user groups

- **Recruiters and internship reviewers:** Need fast access to skills, projects, resume, and contact details.
- **Developers and collaborators:** Want technical summaries, architecture highlights, and repository links.
- **Potential clients:** Need to understand capabilities and reach out easily.
- **General visitors:** May explore the 3D scene and learn about the projects.

## 2.4 Design principles

1. Content first, spectacle second.
2. 3D interaction must have a clear purpose.
3. Never invent personal details, achievements, project metrics, testimonials, client names, or URLs.
4. Motion must be restrained, performant, and optional.
5. Mobile and accessibility are requirements, not afterthoughts.
6. Reusable components and clean architecture take priority over one-file demos.
7. The interface should feel cohesive and deliberate rather than like a collection of unrelated effects.

---

# 3. Personal and Portfolio Content

## 3.1 Confirmed profile details

Use only the following confirmed information unless the user later supplies more:
- Preferred name: **Ruhul**
- Full name: **Ruhul Ma Ani Mazumder**
- Education: **B.Sc. in Computer Science and Engineering student at Mymensingh Engineering College, Bangladesh**
- Professional direction: **Aspiring full-stack developer**
- Relevant technologies and learning areas include JavaScript, React, Node.js, Express, MongoDB, Python, C, and C++.

Do not invent a graduation year, GPA, work history, awards, client list, job title, years of experience, or proficiency level.

## 3.2 Featured projects

Use these as initial project records. Treat descriptions as editable content and do not claim a feature is complete unless confirmed.

### TeamForge
- **Type:** Startup matchmaking platform
- **Summary:** A platform concept that helps startup founders and potential collaborators discover opportunities to work together.
- **Potential focus areas:** Authentication, startup listings, applications, profiles, dashboards, and collaboration workflows.
- **Stack:** Use only verified implementation details. Known work has involved React, Vite, Tailwind CSS, Node.js, Express, MongoDB, JWT/cookie-based authentication, and Cloudinary.
- **Status:** Mark as “In progress” unless the user confirms it is completed.
- **Links:** Leave repository/demo URLs absent until supplied and verified.

### LedgerFlow
- **Type:** Financial ledger / transaction management application
- **Summary:** A MERN-based application focused on modeling accounts, transactions, and financial records.
- **Potential focus areas:** Transaction validation, account models, ledger consistency, API design, and authentication.
- **Stack:** MERN-related technologies, with Mongoose and Zod where actually used.
- **Status:** Mark as “In progress” unless confirmed otherwise.
- **Links:** Leave absent until supplied and verified.

### Abandoned but not Forgotten
- **Type:** Interactive educational space-history experience
- **Summary:** An interactive 3D experience about human-made equipment left on the Moon and Mars, helping visitors explore mission sites and the stories behind hardware.
- **Potential focus areas:** Rotatable planetary scenes, clickable landing sites, source-backed mission information, 3D hardware models, and educational storytelling.
- **Stack:** Show only technologies actually used in the implementation.
- **Status:** Use “Prototype” or “In progress” unless the user confirms a different state.
- **Links:** Leave absent until supplied and verified.

## 3.3 Content integrity rules

- Use placeholders such as `YOUR_GITHUB_URL`, `YOUR_LINKEDIN_URL`, and `YOUR_EMAIL` only in configuration or clearly marked editable content.
- Do not render placeholder URLs as live links.
- Hide unavailable fields instead of displaying empty labels.
- Do not create fake reviews, fake company logos, fake employment history, fake project metrics, or fake testimonials.
- Provide a central content/config file or backend seed data so the user can update portfolio content without hunting through components.

---

# 4. Functional Requirements

Requirements are assigned identifiers to make implementation and testing traceable.

## 4.1 Global navigation

**FR-001:** The application shall provide a clear primary navigation with links to Home, Projects, Skills, About, and Contact.

**FR-002:** Navigation shall support smooth section navigation on the landing page and proper route navigation for project details.

**FR-003:** The active section or route should have a visible state, but not an excessively animated one.

**FR-004:** Mobile navigation shall be usable with touch, keyboard, and screen readers. It must close after route selection and on Escape.

**FR-005:** The navigation shall include a visible brand mark or wordmark using `RUHUL.DEV`.

**FR-006:** A resume link may appear only if a real resume file or verified URL is available. If not available, omit the control rather than linking to a broken file.

## 4.2 Hero and 3D introduction

**FR-010:** The homepage shall contain a clear hero headline identifying Ruhul and his focus as an aspiring full-stack developer.

**FR-011:** The hero shall include a short supporting statement, a primary “Explore Projects” CTA, and a secondary “Contact Me” CTA.

**FR-012:** The hero shall include a 3D scene built with Three.js through React Three Fiber. The default concept is a small stylized digital planet or orbital environment with a central focal object, subtle stars, rings/orbits, and controlled lighting.

**FR-013:** The scene shall support restrained pointer parallax or object rotation on capable devices. Interaction must not prevent reading or clicking the hero content.

**FR-014:** The scene shall avoid unnecessary heavy assets. Prefer procedural geometry and lightweight materials for the first version.

**FR-015:** The 3D scene shall have a loading state and an error/fallback state. If WebGL fails, reduced-motion is enabled, or the device is constrained, display a lightweight CSS/SVG alternative while preserving the hero text and CTAs.

**FR-016:** The hero must not trap the cursor, block page scrolling, or create unexpected full-screen interactions.

**FR-017:** The first viewport shall make the name, professional direction, and primary CTA understandable without requiring the visitor to interact with the 3D scene.

## 4.3 Projects universe and project cards

**FR-020:** The Projects section shall display the featured projects TeamForge, LedgerFlow, and Abandoned but not Forgotten.

**FR-021:** Each project shall have a title, concise summary, category, status, stack tags, and a details action.

**FR-022:** Project cards may use 3D-inspired shapes, orbital markers, depth, or lightweight R3F landmarks. The information itself must remain normal semantic HTML.

**FR-023:** Project exploration shall not require 3D. Provide an accessible list/grid alternative.

**FR-024:** The section shall support filtering by category or technology if this can be implemented without adding unnecessary complexity. Empty filter results must be handled clearly.

**FR-025:** Project data shall be sourced from the backend API, with a local fallback dataset if the API is unavailable during development or the site is configured for static fallback mode.

**FR-026:** Clicking a project shall open a dedicated route such as `/projects/teamforge`, `/projects/ledgerflow`, or `/projects/abandoned-but-not-forgotten`.

**FR-027:** A project detail page shall include overview, problem/purpose, key features, implementation notes, technology stack, status, and available external links. Omit unknown information.

**FR-028:** Project pages shall provide a clear way back to the project list.

## 4.4 Skills visualization

**FR-030:** The Skills section shall group technologies into sensible categories such as Frontend, Backend, Languages, Database, and Tools.

**FR-031:** A constellation/orbit visualization may represent skill groups, but the same information must be available in accessible HTML lists.

**FR-032:** Skill levels must not be represented as precise percentages unless the user provides meaningful, defensible measurements. Prefer categories such as “Currently using,” “Learning,” or “Familiar with,” where appropriate and confirmed.

**FR-033:** Hover and focus states shall expose labels and short explanations without relying on color alone.

## 4.5 About and journey

**FR-040:** The About section shall introduce Ruhul in a concise, professional voice using confirmed profile information.

**FR-041:** The Journey section may show education, learning milestones, and selected project milestones. Only confirmed dates and events may be displayed.

**FR-042:** Use a responsive timeline or modular cards. Avoid invented employment history.

**FR-043:** The page shall not imply that a student project is a commercial product or production deployment unless verified.

## 4.6 Contact

**FR-050:** The Contact section shall provide a form with name, email, subject (optional), and message fields.

**FR-051:** The frontend shall validate required fields and email syntax, display accessible inline errors, disable duplicate submission while sending, and show success/error feedback.

**FR-052:** The backend shall independently validate all submitted data using Zod or an equivalent defined schema. Client-side validation is not a security boundary.

**FR-053:** Valid contact submissions shall be stored in MongoDB with timestamps and a status field such as `new`.

**FR-054:** The API shall not expose private contact submissions through public read endpoints.

**FR-055:** The application shall include basic abuse prevention, including rate limiting and a honeypot field or equivalent lightweight spam control. Do not claim the form sends email unless an email provider has actually been configured.

**FR-056:** If MongoDB or the API is unavailable, the form shall show a clear failure message and shall not falsely claim that the message was sent.

**FR-057:** Email, GitHub, and LinkedIn links shall be configurable and omitted until real values are supplied.

## 4.7 Loading, error, and empty states

**FR-060:** API-driven sections shall include loading, success, empty, and error states as appropriate.

**FR-061:** Errors must be useful to the visitor but must not expose stack traces, environment variables, database details, or internal implementation information.

**FR-062:** The application shall log actionable diagnostic details on the server without exposing secrets to the client.

---

# 5. Information Architecture and Routes

## 5.1 Required routes

- `/` — Home and portfolio landing page.
- `/projects` — Complete project list.
- `/projects/:slug` — Project detail page.
- `*` — Not-found page.

Sections on the homepage:
1. Hero
2. Selected Projects
3. Skills
4. About
5. Journey / Education
6. Contact
7. Footer

The agent may choose a single-page layout for sections while retaining dedicated project routes.

## 5.2 Suggested frontend structure

```text
client/
  public/
    favicon.svg
    images/
  src/
    app/
      App.jsx
      router.jsx
    components/
      layout/
        Navbar.jsx
        Footer.jsx
        PageContainer.jsx
      ui/
        Button.jsx
        SectionHeading.jsx
        Badge.jsx
        LoadingState.jsx
        ErrorState.jsx
      three/
        HeroScene.jsx
        ProjectUniverse.jsx
        SkillsConstellation.jsx
        SceneFallback.jsx
    features/
      home/
        HomePage.jsx
        HeroSection.jsx
      projects/
        ProjectsPage.jsx
        ProjectCard.jsx
        ProjectDetailPage.jsx
        projectService.js
      skills/
        SkillsSection.jsx
      about/
        AboutSection.jsx
        JourneySection.jsx
      contact/
        ContactSection.jsx
        contactService.js
        contactSchema.js
    hooks/
    lib/
      api.js
    data/
      fallbackProjects.js
      profile.js
      skills.js
    styles/
      index.css
    main.jsx
  .env.example
  package.json
  vite.config.js
```

This is a target structure, not a reason to create empty files for every imaginable future feature. Add components when they serve a real purpose.

## 5.3 Suggested backend structure

```text
server/
  src/
    app.js
    server.js
    config/
      env.js
      db.js
    middleware/
      errorHandler.js
      notFound.js
      rateLimit.js
    modules/
      projects/
        project.model.js
        project.schema.js
        project.service.js
        project.controller.js
        project.routes.js
      contact/
        contact.model.js
        contact.schema.js
        contact.service.js
        contact.controller.js
        contact.routes.js
    utils/
      ApiError.js
  scripts/
    seedProjects.js
  .env.example
  package.json
```

The implementation may adapt this structure if a simpler organization is more appropriate, but routes, models, validation, and configuration must remain clearly separated.

---

# 6. Visual Design System

## 6.1 Art direction

The site should feel like a calm, cinematic digital universe: dark, precise, technical, and slightly futuristic. Avoid the generic “developer portfolio template” look, excessive glass panels, constant glowing borders, random gradients, and decorative effects that compete with the content.

## 6.2 Core palette

- **Background:** `#0B0D12`
- **Surface:** `#171B24`
- **Elevated surface:** `#202633`
- **Primary text:** `#F3F4F6`
- **Secondary text:** `#A1A8B5`
- **Accent cyan:** `#67E8F9`
- **Accent orange:** `#FF9D65`
- **Border:** use a subtle low-contrast neutral derived from the surface palette.

Cyan is the primary interactive accent. Orange is reserved for selected highlights, active markers, or small details. Do not apply every accent to every component.

## 6.3 Typography

- **Display/headings:** Space Grotesk
- **Body:** Inter
- **Technical labels:** JetBrains Mono

Use a clear type scale with strong heading hierarchy, comfortable body line length, and readable mobile sizes. External font loading must have sensible system-font fallbacks.

## 6.4 Layout and spacing

- Use a consistent spacing scale and a centered content container.
- Keep text lines readable, avoid oversized body paragraphs, and leave enough negative space around major sections.
- Use responsive CSS grid/flex layouts.
- Keep decorative 3D layers behind content and ensure they never block pointer interactions with buttons or links.
- Use rounded corners deliberately and consistently rather than on every element by default.

## 6.5 Motion language

- Use Framer Motion for small entrance transitions, section reveals, hover feedback, and navigation transitions.
- Keep animations short, purposeful, and consistent.
- Avoid animating large amounts of text, every card, and the background simultaneously.
- Respect `prefers-reduced-motion`.
- Disable or simplify continuous 3D animation when the visitor requests reduced motion or when performance conditions warrant it.

## 6.6 Responsive behavior

- Desktop: full hero composition and richer 3D scene.
- Tablet: reduce scene complexity and adjust content layout.
- Mobile: prioritize content and controls; use simplified geometry or a static fallback if necessary.
- Ensure no horizontal overflow at 320 CSS pixels.
- Touch targets should be comfortably usable and preferably around 44 × 44 CSS pixels.

## 6.7 Accessibility

- Use semantic landmarks and heading order.
- All controls must be keyboard accessible with visible focus indicators.
- Use descriptive link labels and accessible names.
- Forms must associate labels and errors with fields.
- Do not communicate meaning only through color or animation.
- Add a skip-to-content link.
- Decorative canvas elements should not produce noisy or confusing screen-reader output.
- Provide equivalent text content for any information conveyed in a 3D scene.
- Maintain strong text contrast and test the final palette.

---

# 7. 3D Experience Requirements

## 7.1 Technology

Use:
- Three.js
- `@react-three/fiber`
- `@react-three/drei`

Use compatible versions and inspect the installed package versions before making changes. Do not downgrade or replace the existing Vite/React setup without a specific compatibility reason.

## 7.2 Scene architecture

- Keep each 3D scene isolated in a dedicated component.
- Use React Three Fiber Canvas only where it adds value.
- Use procedural geometry for initial scenes instead of large downloaded models.
- Separate scene content, lighting, camera behavior, and interaction logic.
- Use Suspense and explicit loading/fallback states where assets are loaded.
- Dispose of event listeners and external resources correctly.
- Avoid storing unnecessary high-frequency pointer updates in React state if refs or frame-loop logic are more appropriate.

## 7.3 Performance requirements

- Lazy-load 3D components where practical.
- Use compressed, appropriately sized assets if external models are added later.
- Avoid unnecessarily high device pixel ratios; cap rendering resolution where appropriate.
- Limit particle counts and expensive post-processing.
- Avoid heavy real-time shadows unless they materially improve the scene.
- Do not render multiple large canvases simultaneously without a clear need.
- Provide a static fallback for WebGL failures and constrained devices.
- Aim for smooth interaction on a typical modern laptop and acceptable usability on mid-range mobile devices.
- Test production builds, not just the Vite development server.

## 7.4 Interaction requirements

- Pointer movement may create gentle parallax, not violent camera motion.
- Interactive objects must have clear hover/focus states and accessible HTML alternatives.
- Clicking a project landmark must lead to the relevant project details or reveal a clear summary.
- No required content may be hidden exclusively inside a 3D object.
- The page must remain scrollable and usable if the scene fails to load.

---

# 8. Technology Stack and Engineering Constraints

## 8.1 Frontend

- React with the installed Vite setup.
- JavaScript (ES modules); do not migrate to TypeScript unless explicitly approved.
- ESLint for code quality.
- Tailwind CSS 4 with `@tailwindcss/vite`.
- Three.js, React Three Fiber, and Drei.
- Framer Motion for UI animation.
- React Router for routing.
- Axios for HTTP requests, or native `fetch` if the agent can justify keeping the dependency set smaller.
- React Icons for iconography.

## 8.2 Tailwind CSS 4 setup

Tailwind CSS 4 uses its Vite plugin and CSS import. The expected setup is approximately:

`client/vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

The main stylesheet should include:

```css
@import "tailwindcss";
```

The agent must inspect the existing configuration and merge only the required changes. Do not add obsolete Tailwind v3 configuration patterns unless a specific compatibility requirement demands them.

## 8.3 Backend

- Node.js
- Express
- MongoDB Atlas or another MongoDB deployment
- Mongoose
- dotenv for environment variables
- Zod for request/environment validation
- CORS with an explicit allowed-origin configuration
- Helmet for security headers
- express-rate-limit for abuse prevention
- Nodemon for development only

## 8.4 Code standards

- Use clear names and small, cohesive modules.
- Keep controllers thin; put reusable business logic in services.
- Validate incoming data at API boundaries.
- Centralize error handling.
- Avoid deeply nested ternaries and giant components.
- Avoid unnecessary state libraries; React state/context is sufficient unless complexity proves otherwise.
- Do not leave fake functionality, dead buttons, empty links, or “TODO” placeholders for core MVP requirements.
- Use comments to explain non-obvious decisions, not to narrate every line.
- Keep secrets out of source control.
- Do not add dependencies without a clear use case.

---

# 9. Backend API Requirements

All endpoints should use a consistent JSON response shape and meaningful HTTP status codes.

## 9.1 Health check

`GET /api/health`

Success example:

```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "ok"
  }
}
```

The health route should indicate whether the API process is responding. If database status is included, report it accurately rather than claiming the database is healthy when it is disconnected.

## 9.2 Projects

`GET /api/projects`
- Return published projects.
- Support optional query parameters such as `featured=true`, `category`, or `technology` only if implemented correctly.
- Return stable sorting, preferably featured projects first and then an explicit order field.

`GET /api/projects/:slug`
- Return one published project by slug.
- Return 404 for unknown or unpublished projects.

Project records may include:
- `title`
- `slug`
- `summary`
- `description`
- `category`
- `status`
- `technologies` (array)
- `features` (array)
- `role` (optional)
- `challenges` (optional)
- `repositoryUrl` (optional)
- `liveUrl` (optional)
- `image` or `coverImage` (optional)
- `featured` (boolean)
- `published` (boolean)
- `order` (number)
- `createdAt`
- `updatedAt`

Validate slugs and external URLs. Omit missing optional URLs in the UI.

## 9.3 Contact

`POST /api/contact`

Request example:

```json
{
  "name": "Example Visitor",
  "email": "visitor@example.com",
  "subject": "Internship opportunity",
  "message": "I would like to discuss a project."
}
```

Requirements:
- Validate and normalize inputs.
- Apply sensible maximum lengths.
- Reject empty or malformed data.
- Apply rate limiting.
- Use a honeypot or equivalent lightweight spam check.
- Store accepted submissions with `status: "new"` and timestamps.
- Return a success response only after persistence succeeds.
- Do not return stored contact messages publicly.
- Do not log full message contents unnecessarily.
- Do not claim an email notification was sent unless a real email provider is configured.

## 9.4 Error response

A consistent error shape may be:

```json
{
  "success": false,
  "message": "The request could not be completed.",
  "errors": []
}
```

In production, avoid exposing internal stack traces or database error details. Log diagnostic information on the server.

## 9.5 API versioning

Use the `/api` prefix consistently. Full versioning such as `/api/v1` is optional for this personal portfolio, but the route structure must be consistent and documented.

---

# 10. Database Design

## 10.1 Project model

Use a Mongoose model with validation and timestamps. Recommended fields:
- `title`: required string
- `slug`: required unique string
- `summary`: required bounded string
- `description`: optional string or structured content
- `category`: required string or controlled enum
- `status`: controlled enum such as `prototype`, `in-progress`, `completed`
- `technologies`: string array
- `features`: string array
- `role`: optional string
- `repositoryUrl`: optional validated URL
- `liveUrl`: optional validated URL
- `coverImage`: optional string
- `featured`: boolean, default false
- `published`: boolean, default false
- `order`: number, default 0
- timestamps enabled

Never expose unpublished records from public endpoints.

## 10.2 Contact model

Recommended fields:
- `name`: required, trimmed, bounded string
- `email`: required, normalized, validated string
- `subject`: optional bounded string
- `message`: required bounded string
- `status`: enum such as `new`, `reviewed`, `archived`, default `new`
- timestamps enabled

No public endpoint should list contact submissions. A separate admin system is out of scope.

## 10.3 Seed data

Provide a safe seed script for the three initial project records. The script must be idempotent or clearly document whether it replaces records. It must not overwrite user-edited project data unexpectedly.

Do not seed invented repository URLs, demo URLs, metrics, or dates. Use optional fields and accurate status labels.

---

# 11. Configuration and Environment Variables

## 11.1 Frontend `.env.example`

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Only variables intentionally exposed to the browser may use the `VITE_` prefix. Never put MongoDB credentials, private API keys, or secrets in frontend variables.

## 11.2 Backend `.env.example`

```dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ruhul_portfolio
CLIENT_ORIGIN=http://localhost:5173
```

Use a real MongoDB Atlas connection string only in the local `.env` or deployment environment. Do not commit real credentials.

## 11.3 Environment handling

- Validate required environment variables at startup.
- Fail with a clear, safe message if a required variable is missing.
- Do not silently use a production secret or database URL fallback.
- Include `.env` in `.gitignore`.
- Commit `.env.example`, never actual secrets.
- Keep frontend and backend environment variables separate.

---

# 12. Security and Privacy

**NFR-SEC-001:** Apply Helmet and configure CORS with explicit allowed origins.

**NFR-SEC-002:** Validate all incoming request bodies, query parameters, and route parameters.

**NFR-SEC-003:** Rate-limit the contact endpoint and consider a general API limit.

**NFR-SEC-004:** Enforce maximum field lengths and reject unexpected payload shapes.

**NFR-SEC-005:** Never expose environment variables, MongoDB credentials, stack traces, or private contact submissions to visitors.

**NFR-SEC-006:** Use secure deployment settings and HTTPS in production.

**NFR-SEC-007:** Do not collect analytics or tracking data without a clear need and appropriate disclosure.

**NFR-SEC-008:** Avoid storing visitor IP addresses or other personal data unless required for a specific abuse-prevention purpose. If stored, document retention and access controls.

**NFR-SEC-009:** Treat contact form text as untrusted input. Render it as text, never as executable HTML.

**NFR-SEC-010:** Keep dependency versions and audit issues reasonably current; do not blindly apply major-version upgrades during feature implementation.

---

# 13. Non-Functional Requirements

## 13.1 Performance

- The site should load meaningful hero text and navigation before the 3D scene has fully loaded.
- Lazy-load non-critical scenes and project detail media.
- Avoid unnecessary re-renders and oversized bundles.
- Optimize images and 3D assets.
- Aim for good Core Web Vitals under realistic deployment conditions.
- Set a practical performance budget and inspect bundle size after the MVP is implemented.
- Do not add large libraries merely for decorative effects.

## 13.2 Reliability

- Frontend failure to reach the API must not crash the whole application.
- The projects section should use a clear loading/error state and, where configured, a safe local fallback.
- The contact form must report persistence failures honestly.
- Backend startup must handle database connection failures clearly.
- Add a not-found route and centralized API error handling.

## 13.3 Maintainability

- Use modular components and feature-based organization.
- Separate UI from API calls and business logic.
- Keep content editable in a clear location.
- Document setup, environment variables, scripts, API routes, seeding, and deployment.
- Keep the frontend and backend independently runnable.

## 13.4 Compatibility

- Support current stable versions of Chrome, Edge, Firefox, and Safari.
- Handle mobile browsers and touch input.
- Provide a useful fallback when WebGL is unavailable.
- Do not assume a mouse, wide screen, or powerful GPU.

## 13.5 Accessibility

Target WCAG 2.2 AA principles where practical:
- Keyboard operation
- Visible focus
- Semantic HTML
- Adequate contrast
- Form labels and error associations
- Reduced-motion support
- Alternatives for visual-only information
- No interaction available only through hover

## 13.6 SEO and social sharing

- Set meaningful page titles and descriptions.
- Add Open Graph metadata and a social preview image if a real asset is available.
- Use canonical URLs only after the production domain is known.
- Add a sitemap and robots file if appropriate for the final deployment.
- Give project detail routes unique titles and descriptions.
- Do not invent a production domain.

---

# 14. Testing and Quality Assurance

## 14.1 Frontend checks

- `npm run dev` starts without errors.
- `npm run build` completes successfully.
- `npm run lint` completes successfully if the script is configured.
- Navigation works across all required routes.
- The 3D scene renders or falls back gracefully.
- Project cards work with both API data and fallback data.
- Project detail pages handle unknown slugs.
- Contact form validates fields and displays submission states.
- Mobile layout has no horizontal overflow.
- Keyboard navigation and visible focus work.
- Reduced-motion preference disables or simplifies non-essential motion.
- Buttons and links do not lead to empty or placeholder destinations.

## 14.2 Backend checks

- `GET /api/health` responds correctly.
- `GET /api/projects` returns published projects.
- `GET /api/projects/:slug` returns the correct record or 404.
- `POST /api/contact` accepts valid data.
- Invalid email, empty message, oversized input, and malformed payloads are rejected.
- Rate limiting works.
- Database failure produces a safe error response.
- Contact submissions are not publicly readable.
- CORS permits the configured frontend origin and rejects unapproved origins.

## 14.3 Manual visual QA

Test at approximately:
- 320–375 px mobile width
- 390–430 px mobile width
- 768 px tablet width
- 1024 px laptop/tablet width
- 1440 px desktop width

Check:
- Text hierarchy and spacing
- Hero legibility over the 3D scene
- Navigation and CTA visibility
- Project card alignment
- Canvas layering and pointer interaction
- Reduced-motion behavior
- Loading and error states
- Footer and contact form on small screens

## 14.4 Required completion report

At the end, the coding agent must report:
- Features implemented
- Important files created or changed
- Commands executed
- Build/lint/test results
- Required environment variables
- Remaining limitations or manual setup steps
- Any real URLs, credentials, images, or profile assets still needed from the user

Never claim a test passed unless it was actually run and passed.

---

# 15. Implementation Plan

The agent must implement incrementally and verify each phase before continuing.

## Phase 0: Workspace audit
1. Inspect the project root, `client/package.json`, Vite config, CSS, ESLint config, and installed dependencies.
2. Check whether `server/` exists and inspect its package configuration.
3. Identify what is already configured.
4. Preserve working setup and avoid destructive changes.
5. Summarize the initial state briefly, then begin implementation.

**Exit criteria:** The agent understands the actual workspace and has not modified any unrelated repository.

## Phase 1: Foundation
1. Configure Tailwind CSS 4 correctly.
2. Establish global styles, typography, palette, layout primitives, and responsive containers.
3. Add routing and shared layout components.
4. Create the homepage sections with real semantic structure and initial content.
5. Add lint/build checks.

**Exit criteria:** A coherent responsive shell works without 3D.

## Phase 2: Visual identity and hero
1. Implement the hero composition and CTA hierarchy.
2. Create the first lightweight 3D scene.
3. Add loading, error, and fallback states.
4. Add restrained motion and reduced-motion support.
5. Test mobile layout and WebGL fallback.

**Exit criteria:** Hero is legible, interactive where supported, and usable without WebGL.

## Phase 3: Project experience
1. Build project cards and project list.
2. Add accessible filters if useful.
3. Add project detail routes.
4. Add API service and fallback data handling.
5. Ensure missing links and content are omitted rather than fabricated.

**Exit criteria:** Three project entries are displayed accurately, with functional details pages.

## Phase 4: Skills, About, and Journey
1. Build categorized skills.
2. Add accessible constellation visualization only if it performs well.
3. Add About and education/journey content.
4. Avoid unverified dates, experience, and proficiency claims.

**Exit criteria:** All informational sections are complete and responsive.

## Phase 5: Backend foundation
1. Configure Express app and server entry point.
2. Add environment validation and MongoDB connection handling.
3. Add Helmet, CORS, rate limiting, not-found middleware, and centralized error handling.
4. Add the health endpoint.

**Exit criteria:** Server starts safely and health checks work.

## Phase 6: Projects API and data
1. Implement project model, schema, service, controller, and routes.
2. Add seed script for initial project data.
3. Add public list/detail endpoints.
4. Test invalid slugs and unpublished projects.
5. Connect frontend project components to the API.

**Exit criteria:** Project pages work from backend data and have a sensible failure state.

## Phase 7: Contact pipeline
1. Implement contact schema, model, service, controller, and route.
2. Add rate limiting and spam protection.
3. Connect the form to the API.
4. Test valid and invalid submissions.
5. Ensure no public read endpoint exposes submissions.

**Exit criteria:** Valid messages persist; errors are handled honestly.

## Phase 8: Polish, performance, and accessibility
1. Review responsive layouts.
2. Review focus states, keyboard operation, contrast, labels, and reduced motion.
3. Inspect the production bundle and optimize heavy scene elements.
4. Add metadata and not-found states.
5. Run frontend and backend checks.

**Exit criteria:** No known critical build, route, form, or responsive failures.

## Phase 9: Documentation and deployment readiness
1. Add root README with setup instructions.
2. Add `.env.example` files.
3. Document API routes and seed command.
4. Explain frontend and backend deployment options.
5. Verify production build.
6. Produce the completion report.

**Exit criteria:** Another developer can clone, configure, run, test, and deploy the project using the documentation.

---

# 16. Root Scripts and Developer Experience

The agent should configure scripts appropriate to the actual project.

Frontend scripts should include, at minimum:
- `dev`
- `build`
- `preview`
- `lint`

Backend scripts should include:
- `dev` using Nodemon
- `start`
- `seed` if the seed script exists

Optionally, configure root-level scripts or a small README section to run the client and server in separate terminals. Do not introduce a monorepo orchestration dependency unless it provides real value.

Document typical local development commands, for example:

Terminal 1:
```bash
cd client
npm run dev
```

Terminal 2:
```bash
cd server
npm run dev
```

The exact scripts must match the actual `package.json` files.

---

# 17. Deployment Requirements

## 17.1 Frontend

The frontend must be deployable to a static hosting service such as Netlify or Vercel. Configure the production API base URL through `VITE_API_URL`.

## 17.2 Backend

The backend must be deployable to a Node-compatible hosting service such as Render or another appropriate platform. Configure `PORT`, `MONGODB_URI`, `CLIENT_ORIGIN`, and `NODE_ENV` through the hosting environment.

## 17.3 Database

Use MongoDB Atlas or another properly configured MongoDB instance for production. Apply network access restrictions and secure credentials. Never embed the database URI in frontend code.

## 17.4 Deployment verification

After deployment, verify:
- Frontend loads over HTTPS.
- API health endpoint responds.
- CORS matches the deployed frontend origin.
- Project endpoints return expected data.
- Contact submissions persist.
- Production secrets are configured outside source control.
- Client-side routes work when opened directly.
- The 3D scene and fallback work on a real mobile browser.

---

# 18. Acceptance Criteria

The project is accepted when all critical items below are true.

- [ ] A new, independent `ruhul-3d-portfolio/` project exists.
- [ ] The existing portfolio repository has not been modified.
- [ ] React/Vite/JavaScript/ESLint setup is preserved and functional.
- [ ] Tailwind CSS 4 is configured using the Vite plugin.
- [ ] The homepage has a clear, polished hero with working CTAs.
- [ ] The 3D scene has loading and fallback behavior.
- [ ] The Projects section displays TeamForge, LedgerFlow, and Abandoned but not Forgotten.
- [ ] Project detail routes work.
- [ ] Skills, About, Journey, Contact, navigation, and footer are implemented.
- [ ] Frontend works without the backend being available, at least with configured project fallback data.
- [ ] Express health and project endpoints work.
- [ ] Contact form validates on both client and server.
- [ ] Contact submissions persist privately in MongoDB.
- [ ] Environment secrets are not committed.
- [ ] Mobile layout, keyboard navigation, and reduced-motion behavior are tested.
- [ ] Frontend production build passes.
- [ ] Lint checks pass, or any remaining failures are explicitly reported.
- [ ] README and environment examples are complete.
- [ ] The agent provides an accurate implementation and test report.

---

# 19. Explicit Out-of-Scope Items

Do not implement these unless the user separately approves them:
- User registration, login, or account management
- Admin dashboard or CMS
- Public access to contact submissions
- Payments, e-commerce, or subscriptions
- Fake analytics or visitor counters
- Fake testimonials or client logos
- Unverified resume, GitHub, LinkedIn, or live-demo links
- Large cinematic video backgrounds
- Complex custom shaders or post-processing that materially harms performance
- Unnecessary state-management frameworks
- TypeScript migration
- Reworking or importing the old portfolio repository

---

# 20. Master Instruction for Claude Fable 5 / GitHub Copilot Agent

The following instruction is the operational prompt. Follow it together with this SRS.

## Role

Act as a senior full-stack engineer, 3D web developer, UI/UX designer, accessibility reviewer, and pragmatic technical lead. Build a production-minded portfolio, not a disposable demo.

## Objective

Implement **RUHUL.DEV — Beyond the Interface**, a new, immersive 3D portfolio for Ruhul Ma Ani Mazumder, inside the existing `ruhul-3d-portfolio/` workspace. Use this SRS as the source of truth for scope, architecture, design, behavior, and acceptance criteria.

## Non-negotiable rules

1. Inspect the current workspace and package files before editing.
2. Work only inside `ruhul-3d-portfolio/`. Do not modify or import the old portfolio repository.
3. Preserve the existing Vite React JavaScript ESLint setup.
4. Use JavaScript, not TypeScript.
5. Respect the installed dependency versions and configure Tailwind CSS 4 correctly.
6. Do not invent biography details, achievements, metrics, testimonials, project URLs, or work experience.
7. Do not create dead buttons, broken links, fake form success, or placeholder features presented as finished.
8. Build the application in small phases and verify each phase.
9. Use semantic HTML and provide accessible alternatives to 3D-only information.
10. Implement loading, error, empty, reduced-motion, and WebGL fallback behavior.
11. Never expose secrets or private contact submissions.
12. Run available lint and build commands. Report actual results; never fabricate successful tests.
13. Do not stop after an implementation plan. After a brief workspace audit, begin building.
14. Avoid large destructive rewrites. Modify the smallest set of files necessary and explain significant architectural choices.
15. If a required external value is missing, isolate it in configuration or omit the related control. Continue with all work that can be completed safely.

## Required workflow

**Step A:** Inspect the workspace and summarize the current setup in a few bullet points.

**Step B:** Establish the design system, routing, global layout, and responsive static sections.

**Step C:** Implement the 3D hero with fallback and reduced-motion support.

**Step D:** Implement project list/detail pages, skills, About, Journey, Contact, navigation, and footer.

**Step E:** Implement Express configuration, database connection, health check, project endpoints, and contact endpoint.

**Step F:** Connect frontend services to the API and handle API failure gracefully.

**Step G:** Test responsive behavior, accessibility basics, API validation, build, and lint.

**Step H:** Document setup, environment variables, scripts, API endpoints, seeding, and deployment.

After each phase, briefly report changed files and verification results, then continue to the next phase unless a real blocker requires user input.

## Final deliverable

The final result must be a runnable, documented full-stack project with a distinct visual identity, useful 3D interaction, accurate project content, a working projects API, a validated contact submission pipeline, responsive layouts, and production-build verification.

Start by inspecting the actual files now. Then implement Phase 1. Do not merely explain how you would build it.
