import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { pageSeo, structuredData } from '../seo'
import { useLanguage } from '../context/LanguageContext'

function setMeta(selector, attributes, content) {
  let node = document.head.querySelector(selector)
  if (!node) {
    node = document.createElement('meta')
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value)
    document.head.appendChild(node)
  }
  node.content = content
}

export default function Seo() {
  const { pathname } = useLocation()
  const { lang } = useLanguage()

  useEffect(() => {
    const base = document.querySelector('meta[name="site-url"]')?.content || window.location.origin
    const page = pageSeo(pathname, base)
    document.title = page.title
    document.documentElement.lang = lang
    setMeta('meta[name="description"]', { name: 'description' }, page.description)
    setMeta('meta[name="robots"]', { name: 'robots' }, page.noindex ? 'noindex, follow' : 'index, follow')
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = page.url
    if (!canonical.parentNode) document.head.appendChild(canonical)
    for (const [property, content] of Object.entries({
      'og:type': 'website', 'og:site_name': 'Chalo Rojas', 'og:locale': 'es_CO',
      'og:title': page.title, 'og:description': page.description,
      'og:url': page.url, 'og:image': page.imageUrl, 'og:image:alt': page.imageAlt,
    })) setMeta(`meta[property="${property}"]`, { property }, content)
    for (const [name, content] of Object.entries({
      'twitter:card': 'summary_large_image', 'twitter:title': page.title,
      'twitter:description': page.description, 'twitter:image': page.imageUrl,
      'twitter:image:alt': page.imageAlt,
    })) setMeta(`meta[name="${name}"]`, { name }, content)
    let jsonLd = document.head.querySelector('script[type="application/ld+json"]')
    if (!jsonLd) {
      jsonLd = document.createElement('script')
      jsonLd.type = 'application/ld+json'
      document.head.appendChild(jsonLd)
    }
    jsonLd.textContent = JSON.stringify(structuredData(pathname, base))
  }, [pathname, lang])

  return null
}
