import { useState, useEffect, useMemo } from 'react'
import { CATEGORY_OPTIONS, ASPECT_OPTIONS, STATUS_OPTIONS } from '../data/constants'
import './Admin.css'

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

// Map category → collection file name
const CATEGORY_TO_COLLECTION = {
  'pintura original': 'artworks',
  'dibujo rápido': 'sketches',
  'fotografía': 'photos',
}

export default function Admin() {
  // Store each collection separately so saves go to the right file
  const [collections, setCollections] = useState({
    artworks: [],
    sketches: [],
    photos: [],
  })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // { collection, index }
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)

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

  // Load all collections
  useEffect(() => {
    Promise.all([
      fetch('/api/works/artworks').then(r => r.json()),
      fetch('/api/works/sketches').then(r => r.json()),
      fetch('/api/works/photos').then(r => r.json()),
    ])
      .then(([artworks, sketches, photos]) => {
        setCollections({ artworks, sketches, photos })
        setLoading(false)
      })
      .catch(() => {
        showToast('Error al cargar las obras. ¿Está corriendo el servidor admin?', 'error')
        setLoading(false)
      })
  }, [])

  // Merge all into one flat array for display, sorted by order
  const allWorks = useMemo(() => {
    const merged = [
      ...collections.artworks,
      ...collections.sketches,
      ...collections.photos,
    ]
    return merged.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
  }, [collections])

  const orderedWorks = useMemo(() => {
    const filtered = activeCategory
      ? allWorks.filter(a => a.category === activeCategory)
          .sort((a, b) => (a.categoryOrder ?? a.order ?? Infinity) - (b.categoryOrder ?? b.order ?? Infinity))
      : allWorks
    return reorderForColumns(filtered, colCount)
  }, [allWorks, colCount, activeCategory])

  useEffect(() => {
    document.body.style.overflow = selected !== null ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [selected])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openEditor = (work) => {
    const collection = CATEGORY_TO_COLLECTION[work.category] || 'artworks'
    const idx = collections[collection].findIndex(a => a.id === work.id)
    if (idx === -1) return
    setSelected({ collection, index: idx })
    setDraft(JSON.parse(JSON.stringify({
      ...collections[collection][idx],
      categoryOrder: work.categoryOrder ?? work.order ?? '',
    })))
  }

  const closeEditor = () => {
    setSelected(null)
    setDraft(null)
  }

  const updateDraft = (path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const parts = path.split('.')
      let obj = next
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {}
        obj = obj[parts[i]]
      }
      obj[parts[parts.length - 1]] = value
      return next
    })
  }

  const handleSave = async () => {
    if (!selected || !draft) return
    const categoryOrder = draft.categoryOrder ?? draft.order
    if (!Number.isInteger(categoryOrder) || categoryOrder < 1) {
      showToast('Indica un orden dentro de la categoría mayor que cero.', 'error')
      return
    }
    const savedDraft = { ...draft, categoryOrder }
    setSaving(true)
    try {
      const { collection, index } = selected
      const updated = [...collections[collection]]

      // If category changed, move item between collections
      const newCollection = CATEGORY_TO_COLLECTION[savedDraft.category] || collection
      if (newCollection !== collection) {
        // Remove from old
        updated.splice(index, 1)
        const newTarget = [...collections[newCollection], savedDraft]

        // Save both collections
        const [res1, res2] = await Promise.all([
          fetch(`/api/works/${collection}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }),
          fetch(`/api/works/${newCollection}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTarget),
          }),
        ])
        if (!res1.ok || !res2.ok) throw new Error('Server error')
        setCollections(prev => ({
          ...prev,
          [collection]: updated,
          [newCollection]: newTarget,
        }))
      } else {
        updated[index] = savedDraft
        const res = await fetch(`/api/works/${collection}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
        if (!res.ok) throw new Error('Server error')
        setCollections(prev => ({ ...prev, [collection]: updated }))
      }

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
        <span className="admin__badge">{allWorks.length} obras</span>
      </div>

      {/* Category Filter */}
      <nav className="obra__filters" aria-label="Filter by category" style={{ marginBottom: 'var(--space-2xl)' }}>
        <button
          className={`obra__filter-tab ${activeCategory === null ? 'obra__filter-tab--active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          Todo
        </button>
        {CATEGORY_OPTIONS.map(cat => (
          <button
            key={cat}
            className={`obra__filter-tab ${activeCategory === cat ? 'obra__filter-tab--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Grid */}
      <div className="admin__grid">
        {orderedWorks.map((work) => (
          <div
            key={work.id}
            className={`obra__card obra__card--${work.aspect || 'square'}`}
            onClick={() => openEditor(work)}
          >
            <img
              src={work.image}
              alt={work.title?.es || work.id}
              className="obra__card-image"
              loading="lazy"
            />
            <div className="obra__card-overlay">
              <span className="obra__card-title">
                {work.title?.es || 'Sin título'}{work.year ? `, ${work.year}` : ''}
              </span>
            </div>
            <span className="obra__card-edit-badge">✎ Editar</span>
            <span className="admin__order-badge">
              {activeCategory ? `Categoría ${work.categoryOrder ?? work.order ?? '—'}` : `Global ${work.order ?? '—'}`}
            </span>
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
                <div className="admin__field-row-3">
                  <div className="admin__field">
                    <label>ID</label>
                    <input type="text" value={draft.id} readOnly />
                  </div>
                  <div className="admin__field">
                    <label>Orden (global)</label>
                    <input
                      type="number"
                      value={draft.order ?? ''}
                      onChange={e => updateDraft('order', parseInt(e.target.value) || '')}
                      min="1"
                      placeholder="1, 2, 3…"
                    />
                  </div>
                  <div className="admin__field">
                    <label>Orden en categoría</label>
                    <input
                      type="number"
                      value={draft.categoryOrder ?? draft.order ?? ''}
                      onChange={e => updateDraft('categoryOrder', e.target.value === '' ? '' : Number(e.target.value))}
                      min="1"
                      step="1"
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
                      onChange={e => {
                        const category = e.target.value
                        const lastPosition = allWorks
                          .filter(work => work.category === category && work.id !== draft.id)
                          .reduce((max, work) => Math.max(max, work.categoryOrder ?? work.order ?? 0), 0)
                        setDraft(prev => ({ ...prev, category, categoryOrder: lastPosition + 1 }))
                      }}
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
