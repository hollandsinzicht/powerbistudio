import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    resolve: {
        // Zelfde alias als tsconfig "paths" — nodig voor runtime-imports in tests.
        alias: { '@': path.resolve(__dirname, 'src') },
    },
});
