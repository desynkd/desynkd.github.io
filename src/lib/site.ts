// Single source of truth for placeholder identity/contact content (plan §10).
// Swap these values for the real thing — nothing else in the codebase needs to change.
export const site = {
  name: "Ravindu Peeris",
  role: "Software developer",
  positioning: "I build fast, reliable web apps and APIs for founders and small teams.",
  about: [
    "I'm a 4th-year CS undergrad who ships. I care about small, well-tested systems more than sprawling ones, and I'd rather ship something honest and half-finished than fake a demo.",
    "Outside of client work I build my own projects end to end — infra, backend, frontend — because owning the whole stack is the fastest way to learn where it actually breaks.",
  ],
  available: true,
  email: { user: "ravindupeeris180", domain: "gmail.com" },
  github: "https://github.com/desynkd",
  linkedin: "https://linkedin.com/in/replace-me",
  upwork: "https://upwork.com/freelancers/replace-me",
  resumeHref: "/ravindu-peeris-cv.pdf",
  capabilities: {
    helpWith: "Backend APIs, full-stack web apps, and small automation tools — from a rough idea to something deployed and working.",
    groups: [
      { label: "Languages", items: ["TypeScript", "Python", "Go"] },
      { label: "Frameworks", items: ["Astro", "React", "FastAPI", "Node.js"] },
      { label: "Tools", items: ["Docker", "PostgreSQL", "Git", "Linux"] },
      { label: "Practices", items: ["REST APIs", "CI/CD", "Testing", "Code review"] },
    ],
  },
} as const;
