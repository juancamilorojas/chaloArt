import { NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './Layout.css'
import { useState } from 'react'

export default function Layout() {
  const { lang, setLang, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleLang = () => {
    setLang(lang === 'es' ? 'en' : 'es')
  }

  return (
    <div className="layout">
      {/* ===== HEADER ===== */}
      <header className="header" id="site-header">
        <div className="header__inner">
          <NavLink to="/" className="header__logo" id="logo-link">
            <span className="header__logo-icon">❧</span>
            <span className="header__logo-text">CHALO</span>
          </NavLink>

          <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`} id="main-nav">
            <NavLink to="/" className="header__link" onClick={() => setMenuOpen(false)}>{t('nav.inicio')}</NavLink>
            <NavLink to="/obra" className="header__link" onClick={() => setMenuOpen(false)}>{t('nav.obra')}</NavLink>
            <NavLink to="/escritos" className="header__link" onClick={() => setMenuOpen(false)}>{t('nav.escritos')}</NavLink>
            <NavLink to="/biografia" className="header__link" onClick={() => setMenuOpen(false)}>{t('nav.biografia')}</NavLink>
            <NavLink to="/contacto" className="header__link" onClick={() => setMenuOpen(false)}>{t('nav.contacto')}</NavLink>
          </nav>

          <div className="header__actions">
            <button
              className="header__lang-toggle"
              onClick={toggleLang}
              id="lang-toggle"
              aria-label="Toggle language"
            >
              <span className={lang === 'es' ? 'active' : ''}>ES</span>
              <span className="header__lang-divider">|</span>
              <span className={lang === 'en' ? 'active' : ''}>EN</span>
            </button>

            <button
              className="header__hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              id="hamburger-btn"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className={`header__hamburger-line ${menuOpen ? 'open' : ''}`}></span>
              <span className={`header__hamburger-line ${menuOpen ? 'open' : ''}`}></span>
              <span className={`header__hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT (Active Panel) ===== */}
      <main className="main">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="footer" id="site-footer">
        <div className="footer__inner">
          <div className="footer__left">
            <span className="footer__copyright">{t('footer.copyright')}</span>
          </div>
          <div className="footer__center">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__link">INSTAGRAM</a>
            <a href="https://artsy.net" target="_blank" rel="noopener noreferrer" className="footer__link">ARTSY</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer__link">LINKEDIN</a>
          </div>
          <div className="footer__right">
            <span className="footer__location">{t('footer.location')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
