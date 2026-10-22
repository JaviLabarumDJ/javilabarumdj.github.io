// Genera un index.html por ruta (con su título/OG) para que GitHub Pages sirva 200 y buenas previsualizaciones,
// un 404.html como fallback SPA, redirecciones de las URLs antiguas *.html y el sitemap.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const SITE = 'https://javilabarumdj.github.io'
const dist = new URL('../dist/', import.meta.url)
const content = JSON.parse(readFileSync(new URL('../src/content/site.json', import.meta.url), 'utf8'))
const shell = readFileSync(new URL('index.html', dist), 'utf8')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const abs = (p) => (/^https?:/.test(p) ? p : `${SITE}/${p.replace(/^\//, '')}`)

function page({ title, description, path, image, noindex }) {
  let html = shell
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${SITE}${path}`)
  if (image) html = html.replace(/(<meta property="og:image" content=")[^"]*/, `$1${abs(image)}`)
  if (noindex) html = html.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>')
  return html
}

function write(path, html) {
  const dir = new URL(`.${path}`, dist)
  mkdirSync(dir, { recursive: true })
  writeFileSync(new URL('index.html', dir), html)
}

const apps = content.apps.filter((a) => a.published)
const routes = ['/', '/apps/']

write('/apps/', page({ title: `Catálogo de apps · ${content.profile.name}`, description: 'Software libre hecho por y para DJs.', path: '/apps/' }))
for (const a of apps) {
  const path = `/${a.slug}/`
  routes.push(path)
  write(path, page({ title: `${a.name} · ${a.tagline} | ${content.profile.name}`, description: a.summary, path, image: a.cover }))
}
write('/admin/', page({ title: 'Panel · JaviLabarumDJ', description: 'Panel de administración', path: '/admin/', noindex: true }))
writeFileSync(new URL('404.html', dist), page({ title: content.profile.name, description: 'Página no encontrada', path: '/', noindex: true }))

// URLs antiguas del sitio estático
for (const [from, to] of [['mixxx.html', '/mixxx/'], ['tidownloader.html', '/tidownloader/'], ['apps.html', '/apps/']]) {
  writeFileSync(new URL(from, dist), `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${SITE}${to}"><title>Redirigiendo…</title>`)
}

writeFileSync(new URL('sitemap.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((r) => `  <url><loc>${SITE}${r}</loc></url>`).join('\n')}\n</urlset>\n`)
writeFileSync(new URL('robots.txt', dist), `User-agent: *\nDisallow: /admin/\nSitemap: ${SITE}/sitemap.xml\n`)
writeFileSync(new URL('.nojekyll', dist), '')
console.log(`postbuild: ${routes.length} rutas + admin + 404 + redirecciones`)
