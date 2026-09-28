import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router'
import { useEffect, useRef, useMemo } from 'react'
import allArtworks from '../data/artworks.json'
import allSketches from '../data/sketches.json'
import allPhotos from '../data/photos.json'
import ProtectedArtworkImage from '../components/ProtectedArtworkImage'
import './Home.css'

function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

export default function Home() {
  const { t, lang } = useLanguage()

  const paintings = useMemo(() =>
    allArtworks
      .filter(a => a.category === 'pintura original')
      .sort((a, b) => (a.categoryOrder ?? a.order ?? 999) - (b.categoryOrder ?? b.order ?? 999)),
    []
  )

  const sketchThumbs = useMemo(() =>
    allSketches
      .sort((a, b) => (a.categoryOrder ?? a.order ?? 999) - (b.categoryOrder ?? b.order ?? 999))
      .map(s => s.thumb || s.image),
    []
  )

  const photoItems = useMemo(() =>
    allPhotos
      .sort((a, b) => (a.categoryOrder ?? a.order ?? 999) - (b.categoryOrder ?? b.order ?? 999))
      .slice(0, 12),
    []
  )

  const trajRef = useFadeIn()
  const paintRef = useFadeIn()
  const sketchRef = useFadeIn()
  const photoRef = useFadeIn()
  const ctaRef = useFadeIn()

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero__artwork">
          <ProtectedArtworkImage
            src="/images/artworks/artwork_001.jpg"
            alt="El sueño de Mauricio Babilonia, obra de Chalo Rojas"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="hero__overlay">
          <div className="hero__content">
            <p className="hero__eyebrow">{t('home.trajectoryLabel')}</p>
            <h1 className="hero__name serif-italic">
              {t('home.subtitle')}
              <span className="hero__alias">{t('home.title')}</span>
            </h1>
            <div className="hero__rule" />
            <p className="hero__tagline">{t('home.description')}</p>
            <Link to="/obra" className="hero__cta">
              <span>{t('home.cta')}</span>
              <span className="material-icons hero__cta-arrow">arrow_right_alt</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRAJECTORY ===== */}
      <section className="trajectory" ref={trajRef}>
        <div className="trajectory__inner">
          <div className="trajectory__portrait">
            <img
              src="/assets/profile.jpg"
              alt="Chalo — Hernando Rojas Rentería"
              width="1501"
              height="2048"
              loading="lazy"
            />
          </div>
          <div className="trajectory__text">
            <span className="trajectory__label">{t('home.trajectoryLabel')}</span>
            <h2 className="trajectory__title serif-italic">{t('home.trajectoryTitle')}</h2>
            <div className="trajectory__rule" />
            <p className="trajectory__body">{t('home.trajectoryText')}</p>
            <Link to="/biografia" className="trajectory__link">
              <span>{t('biografia.label')}</span>
              <span className="material-icons trajectory__link-arrow">arrow_right_alt</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PAINTINGS — Gallery walk ===== */}
      <section className="paintings" ref={paintRef}>
        <div className="paintings__header">
          <span className="paintings__label">{t('home.paintingsLabel')}</span>
          <h2 className="paintings__title serif-italic">{t('home.paintingsTitle')}</h2>
          <div className="paintings__rule" />
          <p className="paintings__body">{t('home.paintingsText')}</p>
        </div>
        <div className="paintings__gallery">
          {paintings.map((art) => (
            <Link key={art.id} to="/obra" className="paintings__frame">
              <ProtectedArtworkImage src={art.thumb || art.image} alt={`${art.title[lang]}, pintura de Chalo Rojas`} loading="lazy" />
              <span className="paintings__caption">{art.title[lang]}</span>
            </Link>
          ))}
        </div>
        <div className="paintings__footer">
          <Link to="/obra" className="paintings__cta">
            <span>{t('home.paintingsCta')}</span>
            <span className="material-icons paintings__cta-arrow">arrow_right_alt</span>
          </Link>
        </div>
      </section>

      {/* ===== SKETCHES — Horizontal marquee ===== */}
      <section className="sketches" ref={sketchRef}>
        <div className="sketches__header">
          <span className="sketches__label">{t('home.sketchesLabel')}</span>
          <h2 className="sketches__title serif-italic">{t('home.sketchesTitle')}</h2>
          <p className="sketches__body">{t('home.sketchesText')}</p>
        </div>
        <div className="sketches__track">
          <div className="sketches__scroll">
            {[...sketchThumbs, ...sketchThumbs].map((src, i) => (
              <ProtectedArtworkImage key={i} src={src} alt={i < sketchThumbs.length ? `${allSketches[i]?.title?.[lang] || allSketches[i]?.title?.es}, dibujo de Chalo Rojas` : ''} className="sketches__img" loading="lazy" />
            ))}
          </div>
        </div>
        <div className="sketches__footer">
          <Link to="/obra/dibujos" className="sketches__cta">
            <span>{t('home.sketchesCta')}</span>
            <span className="material-icons sketches__cta-arrow">arrow_right_alt</span>
          </Link>
        </div>
      </section>

      {/* ===== PHOTOGRAPHY ===== */}
      <section className="photos" ref={photoRef}>
        <div className="photos__header">
          <span className="photos__label">{t('home.photosLabel')}</span>
          <h2 className="photos__title serif-italic">{t('home.photosTitle')}</h2>
          <p className="photos__body">{t('home.photosText')}</p>
        </div>
        <div className="photos__grid">
          {photoItems.map((photo, i) => (
            <div key={i} className="photos__item">
              <ProtectedArtworkImage src={photo.thumb || photo.image} alt={`${photo.title[lang] || photo.title.es}, fotografía de Chalo Rojas`} loading="lazy" />
            </div>
          ))}
        </div>
        <div className="photos__footer">
          <Link to="/obra/fotografia" className="photos__cta">
            <span>{t('home.photosCta')}</span>
            <span className="material-icons photos__cta-arrow">arrow_right_alt</span>
          </Link>
        </div>
      </section>

      {/* ===== CTA — CONTACT ===== */}
      <section className="cta-contact" ref={ctaRef}>
        <div className="cta-contact__artwork">
          <img
            src="/assets/taller.jpg"
            alt="Chalo Rojas en su taller"
            width="2364"
            height="1330"
            loading="lazy"
          />
        </div>
        <div className="cta-contact__overlay">
          <div className="cta-contact__content">
            <span className="cta-contact__label">{t('home.ctaLabel')}</span>
            <h2 className="cta-contact__title serif-italic">{t('home.ctaTitle')}</h2>
            <div className="cta-contact__rule" />
            <p className="cta-contact__body">{t('home.ctaText')}</p>
            <Link to="/contacto" className="cta-contact__link">
              <span>{t('home.ctaButton')}</span>
              <span className="material-icons cta-contact__link-arrow">arrow_right_alt</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
