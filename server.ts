import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

interface RouteSeoMeta {
  path: string;
  title: string;
  description: string;
  image: string;
  changefreq: string;
  priority: string;
}

const ROUTE_SEO: RouteSeoMeta[] = [
  {
    path: '/',
    title: 'Arteria – Monitoreo IoT 3D de Ductos, Agua y Redes Eléctricas',
    description:
      'Monitoreo IoT en 3D para oleoductos, gasoductos, acueductos y redes eléctricas: sensores en vivo, diagrama unifilar, detección de fugas y órdenes de trabajo.',
    image: '/assets/aistudio/og_c39f3180.jpg',
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    path: '/soluciones/oleoductos-api-1130',
    title: 'Monitoreo de Oleoductos 3D y Detección de Fugas API 1130 | Arteria',
    description:
      'Supervise oleoductos y gasoductos en 3D con balance de masa API 1130, control de espesor UT API 570 y protección catódica NACE SP0169 sin cambiar su SCADA.',
    image: '/assets/aistudio/ducto_42a94bfc.jpg',
    changefreq: 'monthly',
    priority: '0.9',
  },
  {
    path: '/soluciones/agua-no-contabilizada-acueductos',
    title: 'Software para Reducir Agua No Contabilizada (IANC) y Calidad en Acueductos | Arteria',
    description:
      'Calcule el agua no contabilizada en tiempo real, detecte fugas nocturnas y vigile pH, turbiedad y cloro bajo Resolución 2115/2007 y 0631/2015.',
    image: '/assets/aistudio/agua_e86174d9.jpg',
    changefreq: 'monthly',
    priority: '0.9',
  },
  {
    path: '/soluciones/integracion-scada-modbus-dnp3',
    title: 'Conectar SCADA Modbus, Profibus y DNP3 a la Nube sin Cambiar PLC | Arteria',
    description:
      'Conecte sus PLC y sensores industriales actuales (Modbus, DNP3, Profibus, OPC UA, LoRaWAN) a Arteria mediante gateways de solo lectura con buffer local.',
    image: '/assets/aistudio/sensor_dc223657.jpg',
    changefreq: 'monthly',
    priority: '0.9',
  },
  {
    path: '/soluciones/redes-electricas-subestaciones-3d',
    title: 'Monitoreo de Redes Eléctricas, Subestaciones y Parques Solares en 3D | Arteria',
    description:
      'Supervise líneas de transmisión 230/115 kV, circuitos 13,2 kV, parques solares, centrales hidroeléctricas y subestaciones con diagrama unifilar en vivo, DGA y SF6.',
    image: '/assets/aistudio/image_1b05e468.png',
    changefreq: 'monthly',
    priority: '0.9',
  },
];

function getBaseUrl(req: express.Request): string {
  const configured = (process.env.SITE_URL || process.env.APP_URL || '').trim();
  if (configured && !configured.includes('MY_APP_URL') && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, '');
  }
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol || 'https';
  const host = req.get('x-forwarded-host')?.split(',')[0]?.trim() || req.get('host') || `localhost:${PORT}`;
  return `${proto}://${host}`.replace(/\/+$/, '');
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectRouteSeoHtml(html: string, req: express.Request): string {
  const baseUrl = getBaseUrl(req);
  const cleanPath = req.path === '/' ? '/' : req.path.replace(/\/+$/, '');
  const meta = ROUTE_SEO.find((r) => r.path === cleanPath) ?? ROUTE_SEO[0];
  const canonicalUrl = meta.path === '/' ? `${baseUrl}/` : `${baseUrl}${meta.path}`;
  const imageUrl = `${baseUrl}${meta.image}`;
  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeUrl = escapeHtmlAttr(canonicalUrl);
  const safeImage = escapeHtmlAttr(imageUrl);

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${safeDesc}" />`
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${safeUrl}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${safeUrl}" />`
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${safeImage}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:image" content="${safeImage}" />`
    );
}

async function startServer() {
  const app = express();

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'arteria-landing' });
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const today = new Date().toISOString().slice(0, 10);
    const urls = ROUTE_SEO.map((route) => {
      const loc = route.path === '/' ? `${baseUrl}/` : `${baseUrl}${route.path}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`;
    }).join('\n');

    res
      .type('application/xml')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexHtmlPath = path.join(distDir, 'index.html');
    const baseHtml = fs.existsSync(indexHtmlPath) ? fs.readFileSync(indexHtmlPath, 'utf-8') : '';

    app.use(express.static(distDir, { index: false }));
    app.get('*', (req, res) => {
      if (baseHtml) {
        res.type('html').send(injectRouteSeoHtml(baseHtml, req));
        return;
      }
      res.sendFile(indexHtmlPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arteria server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
