// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';

// https://astro.build/config
export default defineConfig({
	markdown: {
		shikiConfig: {
			theme: 'nord',
		},
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeMathjax],
	},
});
