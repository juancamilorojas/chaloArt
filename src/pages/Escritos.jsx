import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import writings from '../data/writings.json'
import './Escritos.css'

export default function Escritos() {
  const { t, localized } = useLanguage()
  const [filter, setFilter] = useState('all')

  const filteredWritings = filter === 'all' 
    ? writings 
    : writings.filter(w => w.category === filter)

  return (
    <section className="escritos" id="escritos-panel">
      <div className="escritos__inner container">
        <h1 className="escritos__title serif-italic">{t('escritos.title')}</h1>

        {/* Tab Filters */}
        <div className="escritos__tabs">
          <button 
            className={`escritos__tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('escritos.all')}
          </button>
          <button 
            className={`escritos__tab ${filter === 'anecdota' ? 'active' : ''}`}
            onClick={() => setFilter('anecdota')}
          >
            {t('escritos.anecdotas')}
          </button>
          <button 
            className={`escritos__tab ${filter === 'cuento' ? 'active' : ''}`}
            onClick={() => setFilter('cuento')}
          >
            {t('escritos.cuentos')}
          </button>
        </div>

        {/* Writings Grid */}
        <div className="escritos__grid">
          {filteredWritings.map((writing) => (
            <article key={writing.id} className="escritos__card" id={`writing-${writing.id}`}>
              <div className="escritos__card-image-wrap">
                <img 
                  src={writing.image} 
                  alt={localized(writing.title)} 
                  className="escritos__card-image"
                  loading="lazy"
                />
              </div>
              <div className="escritos__card-content">
                <h2 className="escritos__card-title serif-italic">{localized(writing.title)}</h2>
                <p className="escritos__card-excerpt">{localized(writing.excerpt)}</p>
                <button className="escritos__card-readmore">
                  <span>{t('escritos.readMore')}</span>
                  <span className="material-icons">arrow_right_alt</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
