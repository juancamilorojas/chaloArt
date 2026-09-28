# SEO y dominio canónico

El build genera HTML para las rutas públicas, `sitemap.xml` y `robots.txt`. La URL base se toma de `SITE_URL` o `VITE_SITE_URL`. Si ninguna existe, se usa `https://www.chalorojas.com`. El alias automático `vercel.app` no reemplaza al dominio canónico.

El dominio principal es `https://www.chalorojas.com`. Vercel tiene `www.chalorojas.com` asignado a producción y redirige `chalorojas.com` a `www` con 308. Si ya existe `SITE_URL` o `VITE_SITE_URL` en Vercel, actualízala a `https://www.chalorojas.com` y vuelve a desplegar. Comprueba que el canonical, `og:url`, el sitemap y la línea `Sitemap:` de robots apunten al mismo host. En GoDaddy, usa los registros DNS específicos que indique Vercel para ambos dominios.

El sitemap se publica en `/sitemap.xml` e incluye Inicio, Obra, Fotografía, Dibujos, Biografía y Contacto. `/escritos` muestra contenido de preparación y tiene `noindex` hasta que haya escritos publicados. `/admin` y `/api` no se incluyen.

Para Google Search Console, crea una propiedad de **Dominio** para `chalorojas.com` y verifica el registro TXT indicado por Google en GoDaddy. Después envía `https://www.chalorojas.com/sitemap.xml` y usa Inspección de URL para solicitar la indexación de Inicio, Obra, Biografía y las dos categorías de obra. Antes de solicitarla, confirma que la versión desplegada responde correctamente en todas esas URLs.
