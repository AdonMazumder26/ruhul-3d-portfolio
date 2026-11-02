# RUHUL.DEV — Beyond the Interface

Immersive 3D developer portfolio for **Ruhul Ma Ani Mazumder** (Ruhul): a React + Vite front end with React Three Fiber scenes, and a Node.js/Express + MongoDB API for project data and contact submissions.

```
ruhul-3d-portfolio/
  client/   React 19 · Vite 8 · Tailwind CSS 4 · Three.js / R3F / drei · Framer Motion · React Router · react-markdown
  server/   Node 20+ · Express 5 · Mongoose 9 · Zod 4 · Helmet · CORS · express-rate-limit · bcryptjs · jsonwebtoken
```

## Features

- Cinematic hero: a GPU particle cloud (~6k points, custom shader) that morphs between a sphere, a torus knot, a `</>` glyph and your initials, with one clickable marker per featured project orbiting it (click → project page).
- Skills flow field: skill chips (real, focusable buttons) drift along Perlin-noise currents over a canvas of soft streaks; picking a category gathers its chips into a cluster and dims the rest. 2D canvas only, so it runs everywhere; reduced motion gets a static grouped map.
- Graceful degradation: WebGL detection, device-tier heuristics, `prefers-reduced-motion`, error boundaries and CSS/SVG fallbacks. Content never depends on 3D.
- Projects from the API with a local fallback dataset; list page with category/technology filters; detail routes with unique titles.
- Contact form validated on the client and server (Zod), honeypot + rate limiting, persisted privately in MongoDB.
- **Admin panel** at `/admin`: single-owner login (bcrypt + httpOnly JWT cookie), project CRUD with publish/feature toggles and drag-free reordering, private contact inbox, Markdown blog editor with live preview, and a theme editor (colours, fonts, 3D toggles) that restyles the whole site live.
- **Blog** at `/blog`: published posts with tags, reading time and GitHub-flavoured Markdown (raw HTML stripped).
- Semantic HTML, skip link, keyboard-operable navigation, visible focus, 44px touch targets, no horizontal overflow down to 320px.

## Quick start

Prerequisites: Node.js 20+ and a MongoDB instance (local or Atlas).

```bash
# Terminal 1 – API
cd server
cp .env.example .env        # edit MONGODB_URI if needed
npm install
npm run seed                # inserts the three initial projects (safe to re-run)
npm run dev                 # http://localhost:5000

# Terminal 2 – web app
cd client
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

The front end works without the API (it falls back to `client/src/data/fallbackProjects.js` and hides the contact form, blog and admin when `VITE_API_URL` is empty). When the API is reachable but MongoDB is down, the API returns honest `503` responses and the UI shows error states.

### Enable the admin panel

```bash
cd server
npm run admin:hash -- "a strong password of 12+ characters"   # prints ADMIN_PASSWORD_HASH=...
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"   # JWT_SECRET
```

Put `ADMIN_EMAIL`, the printed `ADMIN_PASSWORD_HASH` and `JWT_SECRET` into `server/.env`, restart the API and open `http://localhost:5173/admin`. Leave all three empty to disable admin features entirely (`/api/health` reports `admin: "disabled"`).

## Scripts

| Location | Script | Purpose |
| --- | --- | --- |
| `client` | `npm run dev` | Vite dev server |
| `client` | `npm run build` | Production build to `client/dist` |
| `client` | `npm run preview` | Serve the production build locally |
| `client` | `npm run lint` | ESLint |
| `server` | `npm run dev` | Nodemon dev server |
| `server` | `npm start` | Production start |
| `server` | `npm run seed` | Insert initial projects (skips slugs that already exist) |
| `server` | `npm run seed:force` | Overwrite the three seeded projects with the script data |
| `server` | `npm run admin:hash -- "password"` | Print a bcrypt hash for `ADMIN_PASSWORD_HASH` |
| `server` | `npm test` | API tests against an in-memory MongoDB (`mongodb-memory-server`, dev-only) |

## Environment variables

`client/.env`

| Variable | Example | Notes |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Public API base URL. Leave empty for a static, API-less deployment. Never put secrets in `VITE_` variables. |

`server/.env`

| Variable | Example | Notes |
| --- | --- | --- |
| `PORT` | `5000` | HTTP port |
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ruhul_portfolio` | Required. Use an Atlas URI in production. |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Comma-separated list of allowed CORS origins |
| `ADMIN_EMAIL` | `you@example.com` | Optional. Admin login email. |
| `ADMIN_PASSWORD_HASH` | `$2a$12$…` | Optional. bcrypt hash from `npm run admin:hash`. |
| `JWT_SECRET` | 32+ random chars | Optional. Signs the admin session cookie. |
| `ADMIN_SESSION_DAYS` | `7` | Admin session lifetime in days (1–90). |

The three `ADMIN_*`/`JWT_SECRET` variables must be set together; setting only some of them stops the server with a clear message. Missing or malformed variables stop the server at startup. `.env` files are git-ignored; only `.env.example` is committed.

## API

Base path: `/api`. Every response has the shape `{ success, message, data? | errors? }`.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness. `data.status` is `ok` when MongoDB is connected, `degraded` otherwise. |
| `GET` | `/projects` | Published projects, featured first then by `order`. Optional query: `featured=true|false`, `category`, `technology` (case-insensitive exact match). |
| `GET` | `/projects/:slug` | One published project; `404` if unknown or unpublished; `400` for an invalid slug. |
| `POST` | `/contact` | Body: `{ name, email, subject?, message, website? }`. `website` is a honeypot and must stay empty. `201` on persistence, `400` with `errors[]` on validation failure, `429` after 5 submissions/hour/IP, `503` when the database is down. |
| `GET` | `/posts` | Published blog posts (newest first) without `content`. Query: `tag`, `page`, `limit` (≤50). Returns `{ items, total, page, pages, tags }`. |
| `GET` | `/posts/:slug` | One published post including Markdown `content`. |
| `GET` | `/settings/theme` | Current site theme merged over defaults: `{ theme, customized, updatedAt }`. |

### Admin API (`/api/admin`, cookie session)

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | `{ email, password }` → sets the `ruhul_admin` httpOnly cookie. 10 attempts / 15 min / IP. |
| `POST` | `/auth/logout` · `GET /auth/me` | Clear / inspect the session. |
| `GET` | `/overview` | Counts for projects, posts and inbox plus the five latest messages. |
| `GET` `POST` | `/projects` | All projects (including drafts) · create. |
| `GET` `PUT` `PATCH` `DELETE` | `/projects/:id` | Read · replace · partial update (e.g. `{ published: true }`) · delete. |
| `PUT` | `/projects/order` | `{ ids: [] }` → sets `order` by position. |
| `GET` | `/contacts` | Inbox with `status`, `page`, `limit` filters and per-status counts. |
| `GET` `PATCH` `DELETE` | `/contacts/:id` | Read · set `{ status: new\|reviewed\|archived }` · delete. |
| `GET` `POST` | `/posts` · `GET` `PUT` `PATCH` `DELETE` `/posts/:id` | Blog CRUD. Publishing sets `publishedAt`; `readingMinutes` is derived from content. |
| `GET` `PUT` `DELETE` | `/settings/theme` | Read (with defaults and font options) · save · reset. |

Admin routes return `401` without a valid cookie, `403` for state-changing requests from a non-allowed `Origin`, `409` on duplicate slugs and `503` when admin is not configured. Admin bodies may be up to 512 KB (blog posts); public bodies stay at 32 KB.

There is no public endpoint that reads contact submissions. Security headers (Helmet), explicit CORS with credentials, JSON body limits, general API rate limit (300 req / 15 min) and centralized error handling are applied globally. Stack traces are never sent to clients.

### Project record

```jsonc
{
  "id": "…", "title": "TeamForge", "slug": "teamforge",
  "summary": "…", "description": "…", "purpose": "…",
  "category": "Full-stack platform", "status": "prototype | in-progress | completed",
  "technologies": [], "features": [], "implementationNotes": [], "challenges": [],
  "role": "…", "repositoryUrl": "https://…", "liveUrl": "https://…", "coverImage": "…",
  "featured": true, "published": true, "order": 1,
  "createdAt": "…", "updatedAt": "…"
}
```

## Editing content

Most content is now managed from the admin panel at `/admin`:

| What | Where |
| --- | --- |
| Projects (create, edit, publish, feature, reorder, delete) | Admin → Projects |
| Blog posts (Markdown, tags, cover image, draft/published) | Admin → Blog |
| Contact submissions (read, review, archive, delete) | Admin → Inbox |
| Site colours, fonts, hero eyebrow text, 3D hero / animated skills toggles | Admin → Theme |

Still edited in code (rarely changes):

| What | Where |
| --- | --- |
| Name, headline, about text, education, social links, resume URL, hero initials | `client/src/data/profile.js` |
| Skills and categories | `client/src/data/skills.js` |
| Journey / timeline | `client/src/data/journey.js` |
| Project fallback data (used when the API is unavailable) | `client/src/data/fallbackProjects.js` |
| Project seed data (initial database content) | `server/scripts/seedProjects.js` |
| Profile picture | `client/public/images/profile.png` |
| Default theme values | `client/src/features/theme/themeDefaults.js` and `server/src/modules/settings/settings.schema.js` (keep in sync) |

Links left as empty strings (`email`, `github`, `linkedin`, `resume`, `repositoryUrl`, `liveUrl`) are hidden rather than rendered as dead links.

## Project structure

```
client/src
  app/App.jsx                 routes
  components/layout           Navbar, Footer, Layout, ScrollManager, PageContainer
  components/ui               Button, Badge, SectionHeading, LoadingState, ErrorState, Reveal
  components/three            HeroScene (particle morph), particleShapes, HeroVisual, SceneFallback, SceneErrorBoundary
  features/home               HomePage, HeroSection
  features/projects           ProjectsSection, ProjectsPage, ProjectDetailPage, ProjectCard, ProjectGrid, projectService, useProjects
  features/skills             SkillsSection, SkillsFlowField (canvas + DOM chips)
  features/about              AboutSection, JourneySection
  features/contact            ContactSection, contactSchema, contactService
  features/blog               BlogPage, BlogPostPage, blogService, useBlog
  features/theme              ThemeProvider (applies CSS variables + fonts), themeContext, themeDefaults
  features/admin              AdminApp (lazy /admin/*), AdminAuthProvider, AdminLayout, RequireAdmin, adminApi, pages/, components/
  features/notfound           NotFoundPage
  hooks/                      usePrefersReducedMotion, useDeviceCapability, useInView, useDocumentMeta
  lib/                        api.js (fetch wrapper, sends cookies), scroll.js
  data/                       editable content
  styles/index.css            Tailwind 4 theme + base styles + Markdown typography

server/src
  server.js, app.js
  config/   env.js (Zod-validated), db.js
  middleware/ validate, rateLimit, requireDatabase, requireAdmin, notFound, errorHandler
  modules/auth       login/logout/me · bcrypt + JWT cookie
  modules/projects   model · schema · service · controller · routes · admin controller/routes
  modules/contact    model · schema · service · controller · routes · admin controller/routes
  modules/posts      model · schema · service · controller · routes (public + admin)
  modules/settings   model · schema (theme defaults) · service · routes (public + admin)
  routes/admin.routes.js   mounts every admin router behind requireAdmin
  utils/    ApiError, response
server/scripts/seedProjects.js, hashPassword.js
server/tests/api.test.js
```

## Performance notes

- Three.js, R3F and drei are split into a separate chunk (`three-*.js`, ~319 KB gzipped) that is only downloaded when a scene actually mounts. The content shell is ~81 KB gzipped. Vite reports the large chunk as a warning; this is intentional.
- The admin panel (~14 KB gzipped) and the Markdown renderer (~49 KB gzipped, shared by `/blog/:slug` and the admin editor) are lazy-loaded; normal visitors never download them.
- The hero canvas pauses rendering (`frameloop="never"`) when scrolled out of view; the skills flow field only animates while near the viewport. Particle shapes are generated once per mount (text glyphs are rasterised from an offscreen canvas).
- Device pixel ratio is capped (1.6 desktop / 1.25 constrained). Low-tier devices, `prefers-reduced-motion`, missing WebGL and runtime errors all fall back to CSS/SVG. The owner can also force the fallbacks from Admin → Theme.

## Deployment

**Frontend (Netlify, Vercel, Cloudflare Pages, …)**
- Build command: `npm run build` in `client`; publish `client/dist`.
- Set `VITE_API_URL` to the deployed API, e.g. `https://api.example.com/api`.
- Enable SPA fallback so `/projects/:slug` works when opened directly (Netlify: `/* /index.html 200` in `_redirects`; Vercel: rewrite to `/index.html`).

**Backend (Render, Railway, Fly.io, …)**
- Root: `server`. Build: `npm install`. Start: `npm start`.
- Environment: `PORT` (usually provided), `NODE_ENV=production`, `MONGODB_URI` (Atlas), `CLIENT_ORIGIN=https://your-frontend-domain`, plus `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET` for the admin panel.
- In production the admin cookie is `Secure; SameSite=None`, so both the site and the API must be served over HTTPS (required when they live on different domains).
- Run `npm run seed` once against the production database.

**Database**: MongoDB Atlas with IP access restricted to the API host and a dedicated database user.

After deploying verify: HTTPS on both origins, `GET /api/health` returns `status: ok` and `admin: enabled`, `GET /api/projects` returns data, CORS origin matches, a contact submission is stored, you can sign in at `/admin`, and the 3D hero or its fallback renders on a real phone.

## Testing

- `client`: `npm run lint` and `npm run build` must pass.
- `server`: `npm test` runs 19 integration tests (health, project listing/filters/sorting, unpublished hiding, slug validation, idempotent seeding, contact validation/honeypot/persistence/privacy/rate limiting, CORS, 404s, admin login/session/CSRF-origin check, project CRUD + reorder, inbox, blog publishing, theme save/reset, logout) against an in-memory MongoDB. The first run downloads a `mongod` binary.
