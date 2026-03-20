import { useState, useMemo, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import artworks from '../data/artworks.json'
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
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedArtwork, setSelectedArtwork] = useState(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' })

  // Track current column count to reorder items for horizontal reading
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth <= 540) return 1
    if (window.innerWidth <= 960) return 2
    return 3
  }
  const [colCount, setColCount] = useState(getColumnCount)

  useEffect(() => {
    const handleResize = () => setColCount(getColumnCount())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sort by order field, then reorder for CSS columns left→right
  const orderedArtworks = useMemo(() => {
    const sorted = [...artworks].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    return reorderForColumns(sorted, colCount)
  }, [colCount])

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

  return (
    <section className="obra" id="obra-panel">
      <div className="obra__inner container">
        <h1 className="obra__title serif-italic">{t('obra.title')}</h1>

        <div className="obra__grid">
          {orderedArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`obra__card obra__card--${artwork.aspect}`}
              onMouseEnter={() => setHoveredId(artwork.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedArtwork(artwork)}
              id={`artwork-${artwork.id}`}
            >
              <img
                src={artwork.image}
                alt={localized(artwork.title)}
                className="obra__card-image"
                loading="lazy"
              />
              <div className={`obra__card-overlay ${hoveredId === artwork.id ? 'visible' : ''}`}>
                <span className="obra__card-title serif-italic">
                  {localized(artwork.title)}, {artwork.year}
                </span>
                <button className="obra__card-inquire" onClick={(e) => e.stopPropagation()}>{t('obra.inquire')}</button>
              </div>
            </div>
          ))}
        </div>
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
              <img 
                src={selectedArtwork.image} 
                alt={localized(selectedArtwork.title)} 
                style={isZoomed ? { transformOrigin: `${mousePos.x} ${mousePos.y}` } : {}}
              />
            </div>

            {!isZoomed && (
              <div className="obra__modal-caption">
                <span className="serif-italic">{localized(selectedArtwork.title)}, {selectedArtwork.year}</span>
                <br/>
                <span className="obra__modal-medium">{localized(selectedArtwork.medium)} — {selectedArtwork.dimensions}</span>
                
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
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
