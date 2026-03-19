import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const { t } = useLanguage()

  return (
    <section className="home" id="home-panel">
      <div className="home__inner">
        {/* Left Column — Text */}
        <div className="home__text">
          <h1 className="home__title serif-italic">
            <span className="home__subtitle">{t('home.subtitle')}</span>
            {t('home.title')}
          </h1>
          <p className="home__description">{t('home.description')}</p>
          <Link to="/obra" className="home__cta" id="explore-cta">
            <span>{t('home.cta')}</span>
            <span className="material-icons home__cta-arrow">arrow_right_alt</span>
          </Link>
        </div>

        {/* Right Column — Hero Image */}
        <div className="home__image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop"
            alt="Artwork showcase"
            className="home__image"
          />
        </div>
      </div>
    </section>
  )
}
