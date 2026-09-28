import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import { pageSeo, publicPaths, siteUrl, structuredData } from '../src/seo.js'

const base = siteUrl(process.env.SITE_URL || process.env.VITE_SITE_URL)
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const template = await readFile('dist/index.html', 'utf8')
try {
  await build({ build: { ssr: 'src/entry-server.jsx', outDir: 'dist-ssr', emptyOutDir: true } })
  const { render } = await import(pathToFileURL(join(process.cwd(), 'dist-ssr/entry-server.js')).href)
  for (const path of [...publicPaths, '/escritos']) {
    const seo = pageSeo(path, base)
    const tags = [
      `<meta name="site-url" content="${escapeHtml(base)}">`,
      `<meta name="robots" content="${seo.noindex ? 'noindex, follow' : 'index, follow'}">`,
      `<link rel="canonical" href="${escapeHtml(seo.url)}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="Chalo Rojas">`,
      `<meta property="og:locale" content="es_CO">`,
      ...Object.entries({ title: seo.title, description: seo.description, url: seo.url, image: seo.imageUrl, 'image:alt': seo.imageAlt })
        .map(([key, value]) => `<meta property="og:${key}" content="${escapeHtml(value)}">`),
      ...Object.entries({ card: 'summary_large_image', title: seo.title, description: seo.description, image: seo.imageUrl, 'image:alt': seo.imageAlt })
        .map(([key, value]) => `<meta name="twitter:${key}" content="${escapeHtml(value)}">`),
      `<script type="application/ld+json">${JSON.stringify(structuredData(path, base)).replace(/</g, '\\u003c')}</script>`,
    ].join('\n    ')
    const html = template
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(seo.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(seo.description)}" />`)
      .replace('</head>', `    ${tags}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${render(path)}</div>`)
    const destination = path === '/' ? 'dist/index.html' : join('dist', path.slice(1), 'index.html')
    if (path !== '/') await mkdir(join('dist', path.slice(1)), { recursive: true })
    await writeFile(destination, html)
  }
} finally {
  await rm('dist-ssr', { recursive: true, force: true })
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths.map(path => `  <url><loc>${escapeHtml(pageSeo(path, base).url)}</loc></url>`).join('\n')}\n</urlset>\n`
await writeFile('dist/sitemap.xml', sitemap)
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`)
console.log(`Prerendered ${publicPaths.length + 1} pages and sitemap for ${base}`)
