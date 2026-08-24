// Single source of truth for placeholder identity/contact content (plan §10).
// Swap these values for the real thing — nothing else in the codebase needs to change.
export const site = {
  name: "Ravindu Peeris",
  role: "Software developer",
  positioning: "Software developer. I ship things. They usually don't break. Usually.",
  about: [
    "I'm a 4th-year CS undergraduate who learning far better by building things that actually work.",
    "Outside of client work I build my own projects end to end and end up doing random things like designing and editing.",
  ],
  available: true,
  email: { user: "ravindupeeris180", domain: "gmail.com" },
  github: "https://github.com/desynkd",
  linkedin: "https://www.linkedin.com/in/ravindupeeris/",
  upwork: "https://www.upwork.com/freelancers/~0125d7da76fcef473a?mp_source=share",
  resumeHref: "/ravindu-peeris-cv.pdf",
  capabilities: {
    helpWith: "Backend APIs, full-stack web apps, and small automation tools. From a rough idea to something deployed and working.",
    groups: [
      { label: "Languages", items: ["TypeScript", "Python"] },
      { label: "Frameworks", items: ["Next.js", "React", "NestJS", "Node.js"] },
      { label: "Tools", items: ["MongoDb", "PostgreSQL"] },
      { label: "Practices", items: ["REST APIs", "CI/CD", "Testing", "Code review"] },
    ],
  },
} as const;
