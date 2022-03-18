import { UserConfig, defineConfig } from 'vite';
import { resolve } from 'path';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import timeReporter from 'vite-plugin-time-reporter';

const production = process.env.NODE_ENV === 'production';

const configuration: UserConfig = {
    base: '/dist/',

    plugins: [
        viteCommonjs(),
        timeReporter(),
    ],

    build: {
        cssCodeSplit: production ? 'terser' : false,
        minify: production ? 'terser' : false,
        outDir: resolve(__dirname, './dist'),
        target: 'esnext',
        emptyOutDir: true,
        manifest: true,
        sourcemap: true,
        watch: {
            include: './src/**'
        },
        rollupOptions: {
            input: ['./src/index'],
            output: {
                entryFileNames: 'cookiebox.js',
                chunkFileNames: 'cookiebox.vendor.js',
                assetFileNames: ({ name }) => {
                    if (name && name.endsWith('.css')) {
                        return 'cookiebox.css';
                    }

                    return 'media/[name].[ext]';
                },
            },
        },
    },

    // HMR server-port which is exposed by ddev-local in .ddev/docker-compose.hmr.yaml
    server: {
        port: 3000,

        // WSL2 support
        watch: {
            usePolling: true,
        },

        // Avoid browser caches CSS/JS files
        headers: {
            'Cache-Control': 'no-store'
        },
    },
};

export default defineConfig(configuration);
