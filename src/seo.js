export const publicPaths = ['/', '/obra', '/obra/fotografia', '/obra/dibujos', '/biografia', '/contacto']

export const seoPages = {
  '/': {
    title: 'Hernando «Chalo» Rojas Rentería | Artista plástico',
    description: 'Conoce la obra, biografía y trayectoria de Hernando «Chalo» Rojas Rentería: pintura, dibujo y fotografía desde Cali, Colombia.',
    image: '/images/artworks/artwork_001.jpg',
    imageAlt: 'El sueño de Mauricio Babilonia, obra de Chalo Rojas',
  },
  '/obra': {
    title: 'Obras de Chalo Rojas | Pintura, dibujo y fotografía',
    description: 'Explora las pinturas, dibujos rápidos y fotografías de Hernando «Chalo» Rojas Rentería en su galería de obra.',
    image: '/images/artworks/artwork_001.jpg',
    imageAlt: 'El sueño de Mauricio Babilonia, obra de Chalo Rojas',
  },
  '/obra/fotografia': {
    title: 'Fotografías de Chalo Rojas | Cali y su memoria',
    description: 'Explora las fotografías de Hernando «Chalo» Rojas Rentería: escenas de Cali, arquitectura y memoria en blanco y negro.',
    image: '/images/photos/photo_001.jpg',
    imageAlt: 'El oficio entre espejos, fotografía de Chalo Rojas',
  },
  '/obra/dibujos': {
    title: 'Dibujos rápidos de Chalo Rojas | Galería de obra',
    description: 'Descubre los dibujos rápidos de Hernando «Chalo» Rojas Rentería: retratos, figuras y exploraciones de línea y color.',
    image: '/images/fast_paintings/sketch_001.jpg',
    imageAlt: 'Perfil de luz naranja, dibujo de Chalo Rojas',
  },
  '/biografia': {
    title: 'Biografía y trayectoria de Hernando «Chalo» Rojas Rentería',
    description: 'Conoce la biografía de Chalo Rojas: su formación artística en Cali, trayectoria en dibujo, pintura y fotografía, y exposiciones.',
    image: '/assets/profile.jpg',
    imageAlt: 'Retrato de Hernando «Chalo» Rojas Rentería',
  },
  '/contacto': {
    title: 'Contacto | Hernando «Chalo» Rojas Rentería',
    description: 'Contacta a Chalo Rojas para consultar sobre sus obras o conversar sobre un proyecto artístico mediante WhatsApp.',
    image: '/assets/profile.jpg',
    imageAlt: 'Retrato de Hernando «Chalo» Rojas Rentería',
  },
  '/escritos': {
    title: 'Escritos de Chalo Rojas | Próximamente',
    description: 'La sección de anécdotas y cuentos de Hernando «Chalo» Rojas Rentería está en preparación.',
    image: '/images/artworks/artwork_001.jpg',
    imageAlt: 'Obra de Chalo Rojas',
    noindex: true,
  },
}

export function siteUrl(value) {
  return (value || 'https://www.chalorojas.com').replace(/\/+$/, '')
}

export function pageSeo(path, base) {
  const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '')
  const page = seoPages[normalizedPath] || seoPages['/']
  const origin = siteUrl(base)
  return { ...page, url: `${origin}${normalizedPath}`, imageUrl: `${origin}${page.image}` }
}

export function structuredData(path, base) {
  const origin = siteUrl(base)
  const { url, title, description } = pageSeo(path, origin)
  const personId = `${origin}/#artist`
  const websiteId = `${origin}/#website`
  const pageId = `${url}#webpage`
  const graph = [
    {
      '@type': 'Person',
      '@id': personId,
      name: 'Hernando Rojas Rentería',
      alternateName: 'Chalo Rojas',
      description: 'Artista plástico dedicado al dibujo, la pintura y la fotografía.',
      url: `${origin}/biografia`,
      image: `${origin}/assets/profile.jpg`,
      sameAs: ['https://www.instagram.com/chalorojas_/'],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${origin}/`,
      name: 'Chalo Rojas',
      inLanguage: 'es',
    },
    {
      '@type': 'WebPage',
      '@id': pageId,
      url,
      name: title,
      description,
      inLanguage: 'es',
      isPartOf: { '@id': websiteId },
      about: { '@id': personId },
    },
  ]
  return { '@context': 'https://schema.org', '@graph': graph }
}
