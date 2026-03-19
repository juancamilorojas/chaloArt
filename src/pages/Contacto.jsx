import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './Contacto.css'

export default function Contacto() {
  const { t } = useLanguage()
  const [status, setStatus] = useState('idle')

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('submitting')
    
    // Simulate API call for frontend-only form
    setTimeout(() => {
      setStatus('success')
      e.target.reset()
      
      // Reset success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    }, 800)
  }

  return (
    <section className="contacto" id="contacto-panel">
      <div className="contacto__inner container">
        <h1 className="contacto__title serif-italic">
          {t('contacto.intro')}
        </h1>

        <form className="contacto__form" onSubmit={handleSubmit} id="inquiry-form">
          <div className="form__group">
            <label htmlFor="nombre" className="form__label">{t('contacto.nombre')}</label>
            <input 
              type="text" 
              id="nombre" 
              name="nombre" 
              className="form__input" 
              placeholder={t('contacto.nombrePlaceholder')}
              required 
            />
          </div>

          <div className="form__group">
            <label htmlFor="email" className="form__label">{t('contacto.email')}</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="form__input" 
              placeholder={t('contacto.emailPlaceholder')}
              required 
            />
          </div>

          <div className="form__group">
            <label htmlFor="mensaje" className="form__label">{t('contacto.mensaje')}</label>
            <textarea 
              id="mensaje" 
              name="mensaje" 
              className="form__input form__textarea" 
              placeholder={t('contacto.mensajePlaceholder')}
              rows="4"
              required 
            ></textarea>
          </div>

          <button 
            type="submit" 
            className={`form__submit ${status === 'submitting' ? 'submitting' : ''}`}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? '...' : t('contacto.enviar')}
          </button>

          {status === 'success' && (
            <div className="form__success-msg">
              {t('contacto.sent')}
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
