import { NavLink, Outlet } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import './Layout.css'
import { useState } from 'react'
import Seo from './Seo'

export default function Layout() {
  const { lang, setLang, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleLang = () => {
    setLang(lang === 'es' ? 'en' : 'es')
  }

  return (
    <div className="layout">
      <Seo />
      {/* ===== HEADER ===== */}
      <header className="header" id="site-header">
        <div className="header__inner">
          <NavLink to="/" className="header__logo" id="logo-link">
            <img src="/assets/Logo_Chalo.png" alt="Chalo — Rojas Rentería" className="header__logo-img" width="512" height="359" />
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
            <a href="https://www.instagram.com/chalorojas_?stkn=bWoyOTI1eWRzZjNk&utm_source=qr" target="_blank" rel="noopener noreferrer" className="footer__link">INSTAGRAM</a>
          </div>
          <div className="footer__right">
            <span className="footer__location">{t('footer.location')}</span>
            <div className="footer__credit">
              <img src="/assets/imagia-mark.png" alt="" className="footer__credit-mark" width="128" height="112" loading="lazy" />
              <span className="footer__credit-type">
                <span className="footer__credit-overline">BUILT BY</span>
                <span className="footer__credit-name">IMAG<span>IA</span></span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
