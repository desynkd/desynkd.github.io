// Single source of truth for placeholder identity/contact content (plan §10).
// Swap these values for the real thing — nothing else in the codebase needs to change.
export const site = {
  name: "Ravindu Peeris",
  role: "Software developer",
  positioning: "Software developer. I like building stuff with code.",
  about: [
    "I'm a 4th-year CS undergraduate who learning far better by building things that actually work.",
    "Outside of client work I build my own projects end to end and end up doing random things like designing and editing.",
  ],
  available: true,
  email: { user: "ravindupeeris180", domain: "gmail.com" },
  github: "https://github.com/desynkd",
  linkedin: "https://www.linkedin.com/in/ravindupeeris/",
  upwork: "https://www.upwork.com/freelancers/~0125d7da76fcef473a?mp_source=share",
  resumeHref: "/resume.pdf",
  // What I'm up to right now. Bump `updated` whenever the items change.
  now: {
    updated: "2026-10",
    items: [
      { label: "Building", text: "This site, and whatever side project has my attention this month." },
      { label: "Studying", text: "Final year of my CS degree." },
      { label: "Into", text: "Design and video editing, when I'm away from the code." },
    ],
  },
} as const;
