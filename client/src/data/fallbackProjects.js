/**
 * Local fallback dataset used when the API is unreachable or VITE_API_URL is unset.
 * Keep in sync with server/scripts/seedProjects.js.
 * Only verified facts: no URLs, dates or metrics are included until confirmed.
 */
export const fallbackProjects = [
  {
    slug: 'teamforge',
    title: 'TeamForge',
    category: 'Full-stack platform',
    status: 'in-progress',
    summary:
      'A startup matchmaking platform that helps founders and potential collaborators discover opportunities to work together.',
    description:
      'TeamForge is a platform concept built around the idea that good startups start with the right team. Founders can publish what they are building and who they need, while collaborators can browse listings, apply, and manage their involvement from a single profile.',
    purpose:
      'Discovering early-stage collaborators usually happens through scattered chats and luck. TeamForge brings listings, applications and profiles into one structured workflow.',
    features: [
      'Authentication with JWT and cookie-based sessions',
      'Startup listings with role requirements',
      'Application flow between collaborators and founders',
      'User profiles and dashboards',
      'Image handling through Cloudinary',
    ],
    implementationNotes: [
      'React and Vite front end styled with Tailwind CSS.',
      'Node.js and Express REST API with MongoDB persistence.',
      'Session handling built on JWT delivered through HTTP cookies.',
    ],
    technologies: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Cloudinary'],
    role: 'Design and full-stack development',
    repositoryUrl: '',
    liveUrl: '',
    featured: true,
    order: 1,
  },
  {
    slug: 'ledgerflow',
    title: 'LedgerFlow',
    category: 'Finance application',
    status: 'in-progress',
    summary:
      'A MERN-based ledger and transaction management application focused on modeling accounts, transactions and financial records.',
    description:
      'LedgerFlow models the core of a financial system: accounts, the transactions that move value between them, and the records that keep the ledger consistent. The emphasis is on correctness of the data layer and a clear API.',
    purpose:
      'Personal and small-team finances are often tracked in spreadsheets that silently break. LedgerFlow treats every transaction as validated, structured data.',
    features: [
      'Account and transaction models',
      'Server-side transaction validation',
      'Ledger consistency rules',
      'Authenticated API access',
    ],
    implementationNotes: [
      'MERN stack with Mongoose schemas for accounts and transactions.',
      'Request validation with Zod at the API boundary.',
    ],
    technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'Mongoose', 'Zod'],
    role: 'Full-stack development',
    repositoryUrl: '',
    liveUrl: '',
    featured: true,
    order: 2,
  },
  {
    slug: 'abandoned-but-not-forgotten',
    title: 'Abandoned but not Forgotten',
    category: 'Interactive 3D experience',
    status: 'prototype',
    summary:
      'An interactive 3D experience about human-made equipment left on the Moon and Mars, exploring mission sites and the stories behind the hardware.',
    description:
      'Decades of exploration have left landers, rovers and instruments scattered across the Moon and Mars. This project turns that history into an explorable scene: rotate a planet, pick a landing site, and learn what was left there and why it mattered.',
    purpose:
      'Space history is usually told through text and archival photos. An explorable 3D map makes the geography of exploration tangible and invites curiosity.',
    features: [
      'Rotatable planetary scenes',
      'Clickable landing and mission sites',
      'Source-backed mission information panels',
      '3D hardware models and educational storytelling',
    ],
    implementationNotes: [
      'Scenes are built with Three.js inside a React application.',
      'Content is structured so each site links back to its sources.',
    ],
    technologies: ['React', 'Three.js', 'JavaScript'],
    role: 'Concept, 3D scene and front-end development',
    repositoryUrl: '',
    liveUrl: '',
    featured: true,
    order: 3,
  },
]

export const statusLabels = {
  prototype: 'Prototype',
  'in-progress': 'In progress',
  completed: 'Completed',
}
