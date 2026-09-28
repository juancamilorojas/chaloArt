import './ProtectedArtworkImage.css'
import dimensions from '../data/imageDimensions.json'

// Discourage casual image copying without affecting text selection elsewhere.
export default function ProtectedArtworkImage({ className = '', src, loading = 'lazy', ...props }) {
  const preventCopy = event => event.preventDefault()
  const [width, height] = dimensions[src] || []

  return (
    <img
      {...props}
      src={src}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      className={`protected-artwork-image ${className}`.trim()}
      draggable={false}
      onContextMenu={preventCopy}
      onDragStart={preventCopy}
      onCopy={preventCopy}
    />
  )
}
