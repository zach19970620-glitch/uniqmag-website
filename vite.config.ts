import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage } from 'node:http';
import { handleContactRequest } from './api/contact-handler';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function contactApiPlugin(): Plugin {
  return {
    name: 'contact-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/contact') {
          return next();
        }

        const env = loadEnv(server.config.mode, server.config.root, '');
        const body =
          req.method !== 'GET' && req.method !== 'HEAD' ? await readBody(req) : undefined;

        const request = new Request(`http://localhost${req.url}`, {
          method: req.method,
          headers: req.headers as HeadersInit,
          body,
        });

        const response = await handleContactRequest(request, {
          RESEND_API_KEY: env.RESEND_API_KEY,
          FROM_EMAIL: env.FROM_EMAIL || 'UNIQMAG <noreply@uniqmagx.com>',
          TO_EMAIL: env.TO_EMAIL || 'zach@uniqmagx.com',
        });

        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080';

  return {
    plugins: [react(), tailwindcss(), contactApiPlugin()],
    build: {
      outDir: 'uniqmag-www',
    },
    server: {
      proxy: {
        '/app': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
