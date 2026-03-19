import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import exhibitions from '../data/exhibitions.json'
import './Biografia.css'

export default function Biografia() {
  const { t, localized } = useLanguage()
  const [openSection, setOpenSection] = useState('exposiciones')

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  return (
    <section className="bio" id="bio-panel">
      <div className="bio__inner">
        {/* Left Column — Portrait */}
        <div className="bio__image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=1000&fit=crop&grayscale=true"
            alt="Chalo Portrait"
            className="bio__image"
          />
        </div>

        {/* Right Column — Content */}
        <div className="bio__content">
          <span className="bio__label">{t('biografia.label')}</span>
          <h1 className="bio__title">{t('biografia.title')}</h1>
          
          <div className="bio__text">
            <p>{t('biografia.bio_p1')}</p>
            <p>{t('biografia.bio_p2')}</p>
          </div>

          <div className="bio__accordion">
            {/* Accordion Item 1 */}
            <div className={`accordion__item ${openSection === 'exposiciones' ? 'open' : ''}`}>
              <button 
                className="accordion__header" 
                onClick={() => toggleSection('exposiciones')}
                aria-expanded={openSection === 'exposiciones'}
              >
                <span>{t('biografia.exposiciones')}</span>
                <span className="material-icons accordion__icon">
                  {openSection === 'exposiciones' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              <div className="accordion__body">
                <ul className="accordion__list">
                  {exhibitions.map((ex, index) => (
                    <li key={index} className="accordion__list-item">
                      <span className="accordion__list-year">{ex.year}</span>
                      <div className="accordion__list-text">
                        <strong>{localized(ex.title)}</strong>
                        <span>{localized(ex.description)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Accordion Item 2 */}
            <div className={`accordion__item ${openSection === 'premios' ? 'open' : ''}`}>
              <button 
                className="accordion__header" 
                onClick={() => toggleSection('premios')}
                aria-expanded={openSection === 'premios'}
              >
                <span>{t('biografia.premios')}</span>
                <span className="material-icons accordion__icon">
                  {openSection === 'premios' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              <div className="accordion__body">
                <p className="accordion__placeholder">Premios coming soon...</p>
              </div>
            </div>

            {/* Accordion Item 3 */}
            <div className={`accordion__item ${openSection === 'colecciones' ? 'open' : ''}`}>
              <button 
                className="accordion__header" 
                onClick={() => toggleSection('colecciones')}
                aria-expanded={openSection === 'colecciones'}
              >
                <span>{t('biografia.colecciones')}</span>
                <span className="material-icons accordion__icon">
                  {openSection === 'colecciones' ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              <div className="accordion__body">
                <p className="accordion__placeholder">Colecciones coming soon...</p>
              </div>
            </div>
          </div>

          <a href="/cv.pdf" target="_blank" className="bio__download-btn">
            <span>{t('biografia.downloadCv')}</span>
            <span className="material-icons">download</span>
          </a>
        </div>
      </div>
    </section>
  )
}
