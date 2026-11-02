# RUHUL.DEV

> **Beyond the interface.**

Personal portfolio and content platform for **Ruhul Ma Ani Mazumder** — a Computer Science and Engineering student and aspiring full-stack developer.

RUHUL.DEV combines a cinematic React frontend with a Node.js API, MongoDB-backed content, a protected admin workspace, a Markdown blog, and a live theme editor.

## What is inside

### Public experience

- Particle-morph hero: a custom GPU shader morphs thousands of points through a sphere, torus knot, `</>` glyph, and personal initials.
- Clickable project markers orbit the hero particle cloud and link to project detail pages.
- Perlin-noise skills flow field with glowing, keyboard-focusable skill chips.
- Project listing with category and technology filters.
- Markdown blog with tags, reading time, pagination, and safe rendering with raw HTML disabled.
- Contact form with client/server validation, honeypot protection, rate limiting, and private MongoDB persistence.
- Reduced-motion, low-tier-device, WebGL-error, and no-API fallbacks.
- Accessible navigation, skip links, visible focus states, semantic HTML, and responsive layouts down to 320px.

### Private admin workspace

Open `/admin` after configuring the server credentials:

- **Overview** — content counts and recent contact messages.
- **Projects** — create, edit, publish, feature, reorder, and delete.
- **Blog** — write Markdown, preview it, save drafts, publish, and add tags or cover image URLs.
- **Inbox** — read, review, archive, reply by email, and delete contact submissions.
- **Theme** — edit colours, fonts, hero text, 3D/animation toggles, and preview changes live.

The admin account uses a bcrypt password hash and an HTTP-only JWT cookie. Admin features remain disabled unless all required authentication variables are configured.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, React Router, Tailwind CSS 4, Framer Motion |
| Visuals | Three.js, React Three Fiber, custom GLSL particle shader, Canvas 2D flow field |
| Content | `react-markdown`, `remark-gfm` |
| Backend | Node.js 20+, Express 5, Mongoose 9, Zod 4 |
| Security | Helmet, explicit CORS, rate limiting, bcryptjs, JWT, HTTP-only cookies |
| Testing | Node test runner, MongoDB Memory Server |

## Project structure

```text
ruhul-3d-portfolio/
├── client/                 React + Vite frontend
│   ├── public/              Static assets and profile image
│   └── src/
│       ├── app/             Application routes
│       ├── components/      Layout, UI, particle hero, fallbacks
│       ├── data/             Profile, skills, journey, fallback projects
│       ├── features/
│       │   ├── admin/        Protected admin application
│       │   ├── blog/         Public blog pages and data hooks
│       │   ├── projects/     Public project pages and API integration
│       │   ├── skills/       Flow-field skills visualization
│       │   └── theme/        Runtime theme provider and defaults
│       └── styles/           Tailwind theme and global styles
├── server/                 Express + MongoDB API
│   ├── scripts/             Seed and password-hash utilities
│   ├── src/
│   │   ├── config/           Environment and database configuration
│   │   ├── middleware/       Validation, auth, rate limits, errors
│   │   └── modules/          Auth, projects, contacts, posts, settings
│   └── tests/               API integration tests
├── profile.png             Source profile image
├── Ruhul_SRS.md             Product requirements document
└── README.md
```

## Local development

### Prerequisites

- Node.js 20 or newer
- MongoDB locally or a MongoDB Atlas cluster

### 1. Start the API

```powershell
cd server
Copy-Item .env.example .env
npm install
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Start the frontend

Open a second terminal:

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

The site runs at `http://localhost:5173`.

For the frontend to use the API, `client/.env` should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

If `VITE_API_URL` is empty, the portfolio still renders using local fallback project data. API-dependent features — contact submission, blog, theme synchronisation, and admin — are hidden or show an explicit unavailable state.

## Configure the admin panel

Generate a password hash:

```powershell
cd server
npm run admin:hash -- "your strong password of at least 12 characters"
```

Generate a signing secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Add the resulting values to `server/.env`:

```env
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD_HASH=$2b$12$...
JWT_SECRET=your-32-character-or-longer-random-secret
ADMIN_SESSION_DAYS=7
```

Restart the API and visit `http://localhost:5173/admin`.

Leave `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `JWT_SECRET` empty to disable admin access. Never commit `.env` files.

## Environment variables

### Frontend: `client/.env`

| Variable | Example | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Public API base URL. Leave empty for a static frontend-only deployment. |

### Backend: `server/.env`

| Variable | Example | Description |
| --- | --- | --- |
| `PORT` | `5000` | HTTP port. |
| `NODE_ENV` | `development` | `development`, `test`, or `production`. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ruhul_portfolio` | MongoDB connection string. |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Comma-separated allowed frontend origins. |
| `ADMIN_EMAIL` | `you@example.com` | Optional admin login email. |
| `ADMIN_PASSWORD_HASH` | `$2b$12$...` | Optional bcrypt password hash. |
| `JWT_SECRET` | random 32+ character string | Optional JWT signing secret. |
| `ADMIN_SESSION_DAYS` | `7` | Admin cookie lifetime, from 1 to 90 days. |

The three admin authentication values must be configured together. Invalid or incomplete configuration stops the server with a readable error.

## Available commands

Run each command from its listed directory.

| Directory | Command | Purpose |
| --- | --- | --- |
| `client` | `npm run dev` | Start the Vite development server. |
| `client` | `npm run lint` | Run ESLint. |
| `client` | `npm run build` | Create the production build in `client/dist`. |
| `client` | `npm run preview` | Preview the production build locally. |
| `server` | `npm run dev` | Start the API with Nodemon. |
| `server` | `npm start` | Start the API without Nodemon. |
| `server` | `npm run seed` | Insert the initial projects without overwriting existing records. |
| `server` | `npm run seed:force` | Replace the seeded project records. |
| `server` | `npm run admin:hash -- "password"` | Generate a bcrypt admin password hash. |
| `server` | `npm test` | Run the 19 API integration tests. |

## API overview

All responses use:

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": {}
}
```

### Public routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API and database health. |
| `GET` | `/api/projects` | Published projects with optional filters. |
| `GET` | `/api/projects/:slug` | One published project. |
| `POST` | `/api/contact` | Validate and persist a contact submission. |
| `GET` | `/api/posts` | Published blog posts with tag and pagination filters. |
| `GET` | `/api/posts/:slug` | One published Markdown post. |
| `GET` | `/api/settings/theme` | Current public theme settings. |

### Protected admin routes

All routes below require the `ruhul_admin` HTTP-only cookie:

| Area | Routes |
| --- | --- |
| Auth | `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me` |
| Overview | `GET /api/admin/overview` |
| Projects | `GET/POST /api/admin/projects`, `GET/PUT/PATCH/DELETE /api/admin/projects/:id`, `PUT /api/admin/projects/order` |
| Inbox | `GET /api/admin/contacts`, `GET/PATCH/DELETE /api/admin/contacts/:id` |
| Blog | `GET/POST /api/admin/posts`, `GET/PUT/PATCH/DELETE /api/admin/posts/:id` |
| Theme | `GET/PUT/DELETE /api/admin/settings/theme` |

There is deliberately no public endpoint for reading contact submissions. The API applies Helmet, explicit credentialed CORS, body-size limits, general rate limiting, contact rate limiting, login rate limiting, validation, and centralized error handling.

## Content management

| Content | Manage it from |
| --- | --- |
| Projects | Admin → Projects |
| Blog posts | Admin → Blog |
| Contact submissions | Admin → Inbox |
| Colours, fonts, hero settings | Admin → Theme |
| Profile name, bio, education, social links | `client/src/data/profile.js` |
| Hero initials | `client/src/data/profile.js` |
| Skills and categories | `client/src/data/skills.js` |
| Journey timeline | `client/src/data/journey.js` |
| API-offline project fallback | `client/src/data/fallbackProjects.js` |
| Profile image | `client/public/images/profile.png` |

## Deployment

### Frontend on Vercel

The repository includes a root [`vercel.json`](./vercel.json), so it can be imported directly into Vercel without moving the project files:

1. Import the GitHub repository into Vercel.
2. Keep the project root set to the repository root.
3. Add the environment variable `VITE_API_URL` with the deployed API base URL, for example `https://api.example.com/api`.
4. Deploy.

The configuration installs dependencies from `client/package-lock.json`, builds `client`, publishes `client/dist`, and rewrites client-side routes such as `/projects/:slug`, `/blog/:slug`, and `/admin/*` to `index.html`.

The frontend is also compatible with a Vercel project whose **Root Directory** is set to `client`; in that setup use:

- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: `Vite`

### Backend

Vercel hosts the frontend configuration in this repository. Deploy the Express/MongoDB API as a separate Node service (Render, Railway, Fly.io, or another Node host), then set that public HTTPS URL in Vercel as `VITE_API_URL`.

- Install command: `npm install`
- Start command: `npm start`
- Set `NODE_ENV=production`.
- Set `MONGODB_URI`, `CLIENT_ORIGIN` to the Vercel URL, and all three admin authentication variables.
- Run `npm run seed` once against the production database.

### Backend

Deploy `server` to Render, Railway, Fly.io, or another Node host:

- Install command: `npm install`
- Start command: `npm start`
- Set `NODE_ENV=production`.
- Set `MONGODB_URI`, `CLIENT_ORIGIN`, and all three admin authentication variables.
- Run `npm run seed` once against the production database.

In production, the admin cookie is `Secure` and `SameSite=None`. The frontend and API must therefore use HTTPS when deployed on different domains. Restrict MongoDB Atlas network access to the API host and use a dedicated database user.

After deployment, verify:

1. `/api/health` returns `status: ok` and `admin: enabled`.
2. `/api/projects` returns seeded content.
3. CORS allows only the deployed frontend origin.
4. `/admin` accepts the configured credentials.
5. A contact submission appears in the private inbox.
6. `/blog` and a published post load directly.
7. The particle hero and skills field or their fallbacks render on a real phone.

## Performance and accessibility

- Three.js is lazy-loaded and split into its own chunk.
- The admin application and Markdown renderer are lazy-loaded.
- The hero pauses when outside the viewport.
- The skills flow field animates only while near the viewport.
- Device pixel ratio is capped for constrained devices.
- Reduced-motion users receive static particle and skill layouts.
- WebGL failures fall back without hiding content.
- Raw HTML is disabled when rendering Markdown.
- Interactive skill chips remain keyboard-focusable.

## Validation

The current project passes:

```text
client: npm run lint
client: npm run build
server: npm test — 19 passed, 0 failed
```

## License

No license has been selected yet. All rights reserved by the project owner unless a license is added to the repository.
