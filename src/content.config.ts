import { defineCollection, z } from 'astro:content';
import { htmlLoader } from '@/loaders/html';
import { r2Loader } from '@/loaders/r2';

const blog = defineCollection({
  loader: htmlLoader({ base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),          // list previews + meta/OG
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    image: z.string().optional(),     // link preview, 1200×630
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: r2Loader({ dir: 'projects' }),
  schema: z.object({
    title: z.string(),
    outcome: z.string(),              // the one-liner that leads
    role: z.string(),
    timeframe: z.string(),
    status: z.enum(['shipped', 'in-progress', 'archived']),
    stack: z.array(z.string()),
    repo: z.string().url().optional(),
    live: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

export const collections = { blog, projects };
