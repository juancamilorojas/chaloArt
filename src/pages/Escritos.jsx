import { useLanguage } from '../context/LanguageContext'
import './Escritos.css'

export default function Escritos() {
  const { t } = useLanguage()

  return (
    <section className="escritos" id="escritos-panel">
      <div className="escritos__coming-soon">
        <span className="escritos__label">{t('escritos.comingSoon')}</span>
        <h1 className="escritos__title serif-italic">{t('escritos.title')}</h1>
        <div className="escritos__rule" />
        <p className="escritos__text">{t('escritos.comingSoonText')}</p>
      </div>
    </section>
  )
}
