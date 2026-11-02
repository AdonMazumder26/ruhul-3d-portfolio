/**
 * Central profile content. Edit this file to update personal details.
 * Leave a link as an empty string to hide the related control everywhere.
 */
export const profile = {
  preferredName: 'Ruhul',
  fullName: 'Ruhul Ma Ani Mazumder',
  brand: 'RUHUL.DEV',
  tagline: 'Beyond the Interface',
  role: 'Aspiring full-stack developer',
  education: {
    degree: 'B.Sc. in Computer Science and Engineering',
    institution: 'Mymensingh Engineering College',
    location: 'Bangladesh',
  },
  heroHeadline: 'Building full-stack products that feel alive.',
  heroStatement:
    'I am Ruhul, a Computer Science and Engineering student and aspiring full-stack developer. I design and build web applications end to end: React interfaces, Node.js APIs and MongoDB data models, with a growing interest in 3D on the web.',
  aboutParagraphs: [
    'I am a B.Sc. in Computer Science and Engineering student at Mymensingh Engineering College, Bangladesh, working toward a career as a full-stack developer.',
    'Most of my work lives in the JavaScript ecosystem: React and Vite on the front end, Node.js, Express and MongoDB on the back end. I care about clean data models, honest validation and interfaces that stay readable on every screen.',
    'Alongside web development I keep sharpening fundamentals in Python, C and C++, and I enjoy exploring how 3D and interaction can make information easier to understand rather than just louder.',
  ],
  avatar: {
    src: '/images/profile.png',
    alt: 'Portrait of Ruhul Ma Ani Mazumder',
  },
  // Supply real values to enable these controls. Empty strings hide them.
  links: {
    email: '',
    github: '',
    linkedin: '',
    resume: '',
  },
  availability: 'Open to internships, collaborations and freelance web projects.',
}

export const hasLink = (value) => typeof value === 'string' && /^(https?:\/\/|mailto:)/i.test(value)

export const socialLinks = () =>
  [
    { key: 'github', label: 'GitHub', href: profile.links.github },
    { key: 'linkedin', label: 'LinkedIn', href: profile.links.linkedin },
    {
      key: 'email',
      label: 'Email',
      href: profile.links.email ? `mailto:${profile.links.email}` : '',
    },
  ].filter((item) => hasLink(item.href))
