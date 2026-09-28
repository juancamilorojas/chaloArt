import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useLanguage } from '../context/LanguageContext'
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from '../data/constants'
import { whatsappUrl } from '../data/contact'
import ProtectedArtworkImage from '../components/ProtectedArtworkImage'
import artworks from '../data/artworks.json'
import sketches from '../data/sketches.json'
import photos from '../data/photos.json'
import './Obra.css'

/**
 * Reorder items so CSS columns (which fill top→bottom) produce
 * a left→right reading order.
 */
function reorderForColumns(items, cols) {
  if (cols <= 1) return items
  const rows = Math.ceil(items.length / cols)
  const reordered = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = col * rows + row
      if (index < items.length) {
        reordered.push(items[index])
      }
    }
  }
  // Now we have items in visual row order: [0,1,2,3,4,5...]
  // But CSS columns fill top→bottom, so we need the inverse:
  // Distribute reordered items back into column-first order
  const result = new Array(items.length)
  for (let i = 0; i < items.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const targetIndex = col * rows + row
    if (targetIndex < items.length) {
      result[targetIndex] = items[i]
    }
  }
  return result.filter(Boolean)
}

export default function Obra() {
  const { t, localized } = useLanguage()
  const { pathname } = useLocation()
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedArtwork, setSelectedArtwork] = useState(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' })
  const categoryPaths = ['/obra', '/obra/fotografia', '/obra/dibujos']
  const categoryIndex = categoryPaths.indexOf(pathname.replace(/\/+$/, ''))
  const activeCategory = CATEGORY_OPTIONS[categoryIndex < 0 ? 0 : categoryIndex]
  const [activeStatus, setActiveStatus] = useState(null)

  // Track current column count to reorder items for horizontal reading
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth <= 540) return 1
    if (window.innerWidth <= 960) return 2
    return 3
  }
  const [colCount, setColCount] = useState(3)

  useEffect(() => {
    const handleResize = () => setColCount(getColumnCount())
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const allWorks = useMemo(() => [...artworks, ...sketches, ...photos], [])

  // Filter → sort within the category → reorder for CSS columns left→right
  const orderedArtworks = useMemo(() => {
    const filtered = allWorks.filter(a =>
      a.category === activeCategory && (activeStatus === null || a.status === activeStatus)
    )
    const sorted = filtered.sort((a, b) => (a.categoryOrder ?? a.order ?? Infinity) - (b.categoryOrder ?? b.order ?? Infinity))
    return reorderForColumns(sorted, colCount)
  }, [colCount, activeCategory, activeStatus, allWorks])

  // Prevent background scrolling when modal is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = selectedArtwork ? 'hidden' : 'auto'
  }

  const handleClose = () => {
    setSelectedArtwork(null)
    setIsZoomed(false)
    setMousePos({ x: '50%', y: '50%' })
  }

  const handleMouseMove = (e) => {
    if (!isZoomed) return
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setMousePos({ x: `${x}%`, y: `${y}%` })
  }

  const pageTitle = t(`obra.categories.${activeCategory}`) || activeCategory
  const inquiryUrl = artwork => {
    const message = t('obra.inquiryMessage').replace('{title}', localized(artwork.title))
    return whatsappUrl(message)
  }

  return (
    <section className="obra" id="obra-panel">
      <div className="obra__inner container">
        {/* Category Filter Tabs */}
        <nav className="obra__filters" aria-label={t('obra.categoryFilterLabel')}>
          {CATEGORY_OPTIONS.map((cat, index) => (
            <Link
              key={cat}
              to={categoryPaths[index]}
              className={`obra__filter-tab ${activeCategory === cat ? 'obra__filter-tab--active' : ''}`}
              aria-current={activeCategory === cat ? 'page' : undefined}
            >
              {t(`obra.categories.${cat}`) || cat}
            </Link>
          ))}
        </nav>

        <div className="obra__status-filters" role="group" aria-label={t('obra.statusFilterLabel')}>
          {[null, ...STATUS_OPTIONS].map(status => (
            <button
              key={status ?? 'all'}
              type="button"
              className={`obra__status-filter ${activeStatus === status ? 'obra__status-filter--active' : ''}`}
              onClick={() => setActiveStatus(status)}
              aria-pressed={activeStatus === status}
            >
              {status === null ? t('obra.statusFilter.all') : t(`obra.statusFilter.${status}`)}
            </button>
          ))}
        </div>

        <h1 className="obra__title serif-italic">{pageTitle}</h1>

        {orderedArtworks.length === 0 ? (
          <p className="obra__empty" role="status">{t('obra.noMatchingWorks')}</p>
        ) : <div className="obra__grid">
          {orderedArtworks.map((artwork, index) => (
            <div
              key={artwork.id}
              className={`obra__card obra__card--${artwork.aspect}`}
              onMouseEnter={() => setHoveredId(artwork.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedArtwork(artwork)}
              onContextMenu={event => event.preventDefault()}
              id={`artwork-${artwork.id}`}
            >
              <ProtectedArtworkImage
                src={artwork.thumb || artwork.image}
                alt={`${localized(artwork.title)}, ${t(`obra.categories.${artwork.category}`)} de Chalo Rojas`}
                className="obra__card-image"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
              />
              <div className={`obra__card-overlay ${hoveredId === artwork.id ? 'visible' : ''}`}>
                <span className="obra__card-title serif-italic">
                  {localized(artwork.title)}{artwork.year ? `, ${artwork.year}` : ''}
                </span>
                <a
                  className="obra__card-inquire"
                  href={inquiryUrl(artwork)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={event => event.stopPropagation()}
                  aria-label={`${t('obra.inquire')}: ${localized(artwork.title)}`}
                >
                  {t('obra.inquire')}
                </a>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {selectedArtwork && (
        <div className={`obra__modal ${isZoomed ? 'is-zoomed' : ''}`} onClick={handleClose}>
          <button className="obra__modal-close" onClick={handleClose}>✕</button>
          
          <div className="obra__modal-content" onClick={(e) => e.stopPropagation()}>
            <div 
              className="obra__modal-image-wrapper"
              onClick={() => setIsZoomed(!isZoomed)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                if (!isZoomed) setMousePos({ x: '50%', y: '50%' })
              }}
            >
              <ProtectedArtworkImage
                src={selectedArtwork.image} 
                alt={localized(selectedArtwork.title)} 
                style={isZoomed ? { transformOrigin: `${mousePos.x} ${mousePos.y}` } : {}}
              />
            </div>

            {!isZoomed && (
              <div className="obra__modal-caption">
                <span className="serif-italic">
                  {localized(selectedArtwork.title)}
                  {selectedArtwork.year && `, ${selectedArtwork.year}`}
                </span>

                {selectedArtwork.medium && (
                  <>
                    <br/>
                    <span className="obra__modal-medium">
                      {localized(selectedArtwork.medium)}
                      {selectedArtwork.dimensions && ` — ${selectedArtwork.dimensions}`}
                    </span>
                  </>
                )}

                {selectedArtwork.description && (
                  <p className="obra__modal-desc">
                    {localized(selectedArtwork.description)}
                  </p>
                )}

                {selectedArtwork.status && (
                  <div className="obra__modal-status">
                    <span className={`obra__status-dot obra__status-dot--${selectedArtwork.status}`}></span>
                    {t(`obra.status.${selectedArtwork.status}`)}
                  </div>
                )}

                <a
                  className="obra__modal-inquire"
                  href={inquiryUrl(selectedArtwork)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('obra.inquire')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
