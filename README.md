# JaviLabarumDJ Hub

Web oficial de [@javilabarumdj](https://javilabarumdj.github.io): apps DJ, mixes, agenda y panel de administración.

**Stack:** Vite · React · TypeScript · Tailwind CSS v4 · Motion. Desplegada en GitHub Pages con GitHub Actions.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Cómo funciona

- Todo el contenido vive en `src/content/site.json` (perfil, redes, apps, mixes y agenda).
- La versión, el tamaño del APK, las descargas y el changelog de cada app se leen **en vivo** de las releases de GitHub (`repo` + `assetPattern` en el JSON). Ya no hace falta tocar la web al publicar una release.
- `/admin` es un panel que edita ese JSON desde el navegador y hace commit vía la API de GitHub. Cada commit en `main` dispara `.github/workflows/deploy.yml` y la web se actualiza en ~1 minuto.
- `scripts/postbuild.mjs` genera una página por ruta con su título y Open Graph, `404.html`, `sitemap.xml`, `robots.txt` y redirecciones de las URLs antiguas (`mixxx.html`, etc.).

## Acceso al panel

Crea un [fine-grained token](https://github.com/settings/personal-access-tokens/new) solo para este repositorio con **Contents: Read and write** y **Actions: Read** (opcional **Administration: Read** en los repos de las apps para ver visitas). El token se queda en tu navegador.
