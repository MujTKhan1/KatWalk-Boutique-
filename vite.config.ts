import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Dev-only helper: lets the app POST a rendered still of the 3D hero
 * (used as the static / reduced-motion / no-WebGL fallback) into public/media.
 * Never included in production builds.
 */
function heroStillCapture(): Plugin {
  return {
    name: 'katwalk-hero-still-capture',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__capture', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        const name = new URL(req.url ?? '', 'http://x').searchParams.get('name') ?? 'hero-still';
        const safe = name.replace(/[^a-z0-9-]/gi, '');
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => {
          const file = resolve(process.cwd(), 'public/media', `${safe}.webp`);
          writeFileSync(file, Buffer.concat(chunks));
          res.end(JSON.stringify({ ok: true, file, bytes: Buffer.concat(chunks).length }));
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), heroStillCapture()],
});
