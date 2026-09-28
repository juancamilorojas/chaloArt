import { useLanguage } from '../context/LanguageContext'
import './Biografia.css'

export default function Biografia() {
  const { t } = useLanguage()

  return (
    <section className="bio" id="bio-panel">
      <div className="bio__inner">
        {/* Left Column — Artwork */}
        <div className="bio__image-wrapper">
          <img
            src="/images/artworks/artwork_031.jpg"
            alt="Pájaros de Fuego"
            className="bio__image"
            width="1654"
            height="1286"
          />
        </div>

        {/* Right Column — Content */}
        <div className="bio__content">
          <span className="bio__label">{t('biografia.label')}</span>
          <h1 className="bio__title">{t('biografia.title')}</h1>
          
          <div className="bio__text">
            <p>{t('biografia.bio_p1')}</p>
            <p>{t('biografia.bio_p2')}</p>
            <p>{t('biografia.bio_p3')}</p>
            <p>{t('biografia.bio_p4')}</p>
            <p>{t('biografia.bio_p5')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
