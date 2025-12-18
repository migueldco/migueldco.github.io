import { defineCollection, z } from 'astro:content';

import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		author: z.string(),
		description: z.string(),
		date: z.string(),
		tags: z.array(z.string()).optional(),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		tags: z.array(z.string()),
		link: z.string().optional(),
		image: z.string().optional(),
		featured: z.boolean().optional(),
	}),
});

export const collections = { blog, projects };
