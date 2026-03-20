import { useState, useEffect, useMemo } from 'react'
import './Admin.css'

const CATEGORY_OPTIONS = ['pintura original', 'fotografía', 'rápido']
const ASPECT_OPTIONS = ['landscape', 'portrait', 'square']
const STATUS_OPTIONS = ['disponible', 'vendido']

/**
 * Reorder items so CSS columns (top→bottom) display in left→right reading order.
 */
function reorderForColumns(items, cols) {
  if (cols <= 1) return items
  const rows = Math.ceil(items.length / cols)
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

export default function Admin() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // index into artworks
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Column count for responsive grid
  const getColCount = () => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth <= 540) return 1
    if (window.innerWidth <= 960) return 2
    return 3
  }
  const [colCount, setColCount] = useState(getColCount)

  useEffect(() => {
    const h = () => setColCount(getColCount())
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  // Load artworks from API
  useEffect(() => {
    fetch('/api/artworks')
      .then(r => r.json())
      .then(data => { setArtworks(data); setLoading(false) })
      .catch(() => {
        showToast('Error al cargar las obras. ¿Está corriendo el servidor admin?', 'error')
        setLoading(false)
      })
  }, [])

  const orderedArtworks = useMemo(() => {
    const sorted = [...artworks].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    return reorderForColumns(sorted, colCount)
  }, [artworks, colCount])

  // Prevent background scrolling when modal open
  useEffect(() => {
    document.body.style.overflow = selected !== null ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [selected])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openEditor = (artwork) => {
    const idx = artworks.findIndex(a => a.id === artwork.id)
    setSelected(idx)
    setDraft(JSON.parse(JSON.stringify(artworks[idx])))
  }

  const closeEditor = () => {
    setSelected(null)
    setDraft(null)
  }

  // Update a nested field in draft, e.g. updateDraft('title.es', value)
  const updateDraft = (path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const parts = path.split('.')
      let obj = next
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]]
      }
      obj[parts[parts.length - 1]] = value
      return next
    })
  }

  const handleSave = async () => {
    if (selected === null || !draft) return
    setSaving(true)
    try {
      const updated = [...artworks]
      updated[selected] = draft
      const res = await fetch('/api/artworks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      if (!res.ok) throw new Error('Server error')
      setArtworks(updated)
      showToast('✓ Guardado exitosamente')
      closeEditor()
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>Cargando obras…</p>
      </div>
    )
  }

  return (
    <div className="admin">
      {/* Header */}
      <div className="admin__header">
        <div>
          <h1 className="admin__title">Editor de Obras</h1>
          <p className="admin__subtitle">Haz clic en una obra para editar su información</p>
        </div>
        <span className="admin__badge">{artworks.length} obras</span>
      </div>

      {/* Grid */}
      <div className="admin__grid">
        {orderedArtworks.map((artwork) => (
          <div
            key={artwork.id}
            className={`obra__card obra__card--${artwork.aspect}`}
            onClick={() => openEditor(artwork)}
          >
            <img
              src={artwork.image}
              alt={artwork.title?.es || artwork.id}
              className="obra__card-image"
              loading="lazy"
            />
            <div className="obra__card-overlay">
              <span className="obra__card-title">
                {artwork.title?.es || 'Sin título'}, {artwork.year}
              </span>
            </div>
            <span className="obra__card-edit-badge">✎ Editar</span>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {selected !== null && draft && (
        <div className="admin__modal-backdrop" onClick={closeEditor}>
          <div className="admin__modal" onClick={e => e.stopPropagation()}>
            {/* Left: Image */}
            <div className="admin__modal-image">
              <img src={draft.image} alt={draft.title?.es || ''} />
              <button className="admin__modal-close" onClick={closeEditor}>✕</button>
            </div>

            {/* Right: Form */}
            <div className="admin__modal-form">
              {/* ID + Order */}
              <div className="admin__form-section">
                <div className="admin__form-section-title">Identificador</div>
                <div className="admin__field-row">
                  <div className="admin__field">
                    <label>ID</label>
                    <input type="text" value={draft.id} readOnly />
                  </div>
                  <div className="admin__field">
                    <label>Orden</label>
                    <input
                      type="number"
                      value={draft.order ?? ''}
                      onChange={e => updateDraft('order', parseInt(e.target.value) || '')}
                      min="1"
                      placeholder="1, 2, 3…"
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="admin__form-section">
                <div className="admin__form-section-title">Título</div>
                <div className="admin__bilingual">
                  <div className="admin__field">
                    <label>Título <span className="admin__lang-tag">ES</span></label>
                    <input
                      type="text"
                      value={draft.title?.es || ''}
                      onChange={e => updateDraft('title.es', e.target.value)}
                    />
                  </div>
                  <div className="admin__field">
                    <label>Title <span className="admin__lang-tag">EN</span></label>
                    <input
                      type="text"
                      value={draft.title?.en || ''}
                      onChange={e => updateDraft('title.en', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Year, Dimensions, Image */}
              <div className="admin__form-section">
                <div className="admin__form-section-title">Detalles</div>
                <div className="admin__field-row-3">
                  <div className="admin__field">
                    <label>Año</label>
                    <input
                      type="number"
                      value={draft.year || ''}
                      onChange={e => updateDraft('year', parseInt(e.target.value) || '')}
                    />
                  </div>
                  <div className="admin__field">
                    <label>Dimensiones</label>
                    <input
                      type="text"
                      value={draft.dimensions || ''}
                      onChange={e => updateDraft('dimensions', e.target.value)}
                      placeholder="ej: 100 × 80 cm"
                    />
                  </div>
                  <div className="admin__field">
                    <label>Imagen (archivo)</label>
                    <input
                      type="text"
                      value={draft.image || ''}
                      onChange={e => updateDraft('image', e.target.value)}
                      placeholder="/images/artworks/nombre.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Medium */}
              <div className="admin__form-section">
                <div className="admin__form-section-title">Técnica</div>
                <div className="admin__bilingual">
                  <div className="admin__field">
                    <label>Técnica <span className="admin__lang-tag">ES</span></label>
                    <input
                      type="text"
                      value={draft.medium?.es || ''}
                      onChange={e => updateDraft('medium.es', e.target.value)}
                    />
                  </div>
                  <div className="admin__field">
                    <label>Medium <span className="admin__lang-tag">EN</span></label>
                    <input
                      type="text"
                      value={draft.medium?.en || ''}
                      onChange={e => updateDraft('medium.en', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Category, Aspect, Status */}
              <div className="admin__form-section">
                <div className="admin__form-section-title">Clasificación</div>
                <div className="admin__field-row-3">
                  <div className="admin__field">
                    <label>Categoría</label>
                    <select
                      value={draft.category || ''}
                      onChange={e => updateDraft('category', e.target.value)}
                    >
                      <option value="">— Seleccionar —</option>
                      {CATEGORY_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin__field">
                    <label>Aspecto</label>
                    <select
                      value={draft.aspect || ''}
                      onChange={e => updateDraft('aspect', e.target.value)}
                    >
                      <option value="">— Seleccionar —</option>
                      {ASPECT_OPTIONS.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin__field">
                    <label>Estado</label>
                    <select
                      value={draft.status || ''}
                      onChange={e => updateDraft('status', e.target.value)}
                    >
                      <option value="">— Seleccionar —</option>
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="admin__form-section">
                <div className="admin__form-section-title">Descripción</div>
                <div className="admin__field">
                  <label>Descripción <span className="admin__lang-tag">ES</span></label>
                  <textarea
                    rows={4}
                    value={draft.description?.es || ''}
                    onChange={e => updateDraft('description.es', e.target.value)}
                  />
                </div>
                <div className="admin__field">
                  <label>Description <span className="admin__lang-tag">EN</span></label>
                  <textarea
                    rows={4}
                    value={draft.description?.en || ''}
                    onChange={e => updateDraft('description.en', e.target.value)}
                  />
                </div>
              </div>

              {/* Save */}
              <div className="admin__save-bar">
                <button
                  className={`admin__save-btn ${saving ? 'admin__save-btn--saving' : ''}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  className="admin__save-btn"
                  onClick={closeEditor}
                  style={{ background: '#999' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin__toast admin__toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
