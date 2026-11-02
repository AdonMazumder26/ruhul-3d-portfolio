/**
 * Skills grouped by category. `note` is a short, defensible description;
 * no percentages or proficiency scores are used.
 * `focus`: 'project' = used in shipped/in-progress project work,
 *          'learning' = active learning area.
 */
export const skillGroups = [
  {
    id: 'frontend',
    label: 'Frontend',
    color: 'cyan',
    skills: [
      { name: 'React', note: 'Component architecture, hooks and routing', focus: 'project' },
      { name: 'Vite', note: 'Fast dev server and production bundling', focus: 'project' },
      { name: 'Tailwind CSS', note: 'Utility-first responsive styling', focus: 'project' },
      { name: 'Three.js', note: 'Procedural 3D scenes with React Three Fiber', focus: 'project' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    color: 'orange',
    skills: [
      { name: 'Node.js', note: 'Server runtime for REST APIs', focus: 'project' },
      { name: 'Express', note: 'Routing, middleware and error handling', focus: 'project' },
      { name: 'JWT auth', note: 'Cookie-based sessions and protected routes', focus: 'project' },
      { name: 'Zod', note: 'Schema validation at API boundaries', focus: 'project' },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    color: 'cyan',
    skills: [
      { name: 'MongoDB', note: 'Document modeling and queries', focus: 'project' },
      { name: 'Mongoose', note: 'Schemas, validation and indexes', focus: 'project' },
      { name: 'Cloudinary', note: 'Media storage and delivery', focus: 'project' },
    ],
  },
  {
    id: 'languages',
    label: 'Languages',
    color: 'orange',
    skills: [
      { name: 'JavaScript', note: 'Primary language across the stack', focus: 'project' },
      { name: 'Python', note: 'Scripting and problem solving', focus: 'learning' },
      { name: 'C', note: 'Systems fundamentals and memory', focus: 'learning' },
      { name: 'C++', note: 'Data structures and algorithms', focus: 'learning' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    color: 'cyan',
    skills: [
      { name: 'Git & GitHub', note: 'Version control and collaboration', focus: 'project' },
      { name: 'VS Code', note: 'Daily editor and debugging', focus: 'project' },
      { name: 'npm', note: 'Dependency and script management', focus: 'project' },
    ],
  },
]

export const focusLabels = {
  project: 'Used in projects',
  learning: 'Learning area',
}
