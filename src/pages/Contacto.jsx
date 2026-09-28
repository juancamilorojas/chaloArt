import { useLanguage } from '../context/LanguageContext'
import { whatsappUrl } from '../data/contact'
import './Contacto.css'

export default function Contacto() {
  const { t } = useLanguage()

  const handleSubmit = event => {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const name = form.get('nombre').trim()
    const email = form.get('email').trim()
    const note = form.get('mensaje').trim()

    if (!name || !note) return

    const lines = [t('contacto.whatsappGreeting').replace('{name}', () => name)]
    if (email) lines.push(`${t('contacto.whatsappEmail')}: ${email}`)
    lines.push('', note)

    window.location.assign(whatsappUrl(lines.join('\n')))
  }

  return (
    <section className="contacto" id="contacto-panel">
      <div className="contacto__inner container">
        <figure className="contacto__visual">
          <img src="/assets/profile.jpg" alt={t('contacto.portraitAlt')} width="1501" height="2048" />
          <figcaption className="contacto__visual-caption">
            <span>{t('contacto.artistName')}</span>
            <span>{t('footer.location')}</span>
          </figcaption>
        </figure>

        <div className="contacto__content">
          <p className="contacto__eyebrow">{t('nav.contacto')}</p>
          <h1 className="contacto__title serif-italic">{t('contacto.title')}</h1>
          <p className="contacto__intro">{t('contacto.intro')}</p>

          <div className="contacto__channel">
            <span className="contacto__channel-label">WHATSAPP</span>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              +57 300 505 0014 <span aria-hidden="true">↗</span>
            </a>
          </div>

          <form className="contacto__form" onSubmit={handleSubmit} id="inquiry-form">
            <div className="form__group">
              <label htmlFor="nombre" className="form__label">{t('contacto.nombre')}</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="form__input"
                placeholder={t('contacto.nombrePlaceholder')}
                autoComplete="name"
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
                autoComplete="email"
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
              />
            </div>

            <button type="submit" className="form__submit">
              <span>{t('contacto.enviar')}</span>
              <span aria-hidden="true">↗</span>
            </button>
            <p className="contacto__note">{t('contacto.whatsappNote')}</p>
          </form>
        </div>
      </div>
    </section>
  )
}
