import sharp from 'sharp'
import { readdirSync, mkdirSync, statSync, renameSync, unlinkSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'

const PUBLIC = 'public'
const IMAGE_DIRS = [
  'images/artworks',
  'images/fast_paintings',
  'images/photos',
  'assets',
]

const FULL_MAX_WIDTH = 2400
const THUMB_MAX_WIDTH = 800
const JPEG_QUALITY = 82
const THUMB_QUALITY = 75

// Track totals
let totalOriginal = 0
let totalOptimized = 0
let totalThumbs = 0
let filesProcessed = 0

async function processImage(filePath, dir) {
  const ext = extname(filePath).toLowerCase()
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return
  if (filePath.includes('Zone.Identifier')) return

  const originalSize = statSync(filePath).size
  totalOriginal += originalSize
  filesProcessed++

  const name = basename(filePath, extname(filePath))
  const image = sharp(filePath)
  const meta = await image.metadata()

  // --- Full-size optimized (JPEG) ---
  const fullWidth = Math.min(meta.width, FULL_MAX_WIDTH)
  const outputName = name + '.jpg'
  const outputPath = join(PUBLIC, dir, outputName)
  const tempPath = filePath + '.optimizing'

  await sharp(filePath)
    .resize({ width: fullWidth, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(tempPath)

  const optimizedSize = statSync(tempPath).size
  totalOptimized += optimizedSize

  // Remove original, move optimized in place
  if (filePath !== outputPath) {
    unlinkSync(filePath)
  }
  renameSync(tempPath, outputPath)

  // --- Thumbnail ---
  const thumbDir = join(PUBLIC, dir, 'thumbs')
  if (!existsSync(thumbDir)) mkdirSync(thumbDir, { recursive: true })

  const thumbPath = join(thumbDir, outputName)
  await sharp(outputPath)
    .resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
    .toFile(thumbPath)

  totalThumbs += statSync(thumbPath).size

  const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(0)
  const sizeStr = (sz) => (sz / 1024 / 1024).toFixed(2) + 'MB'
  console.log(`  ${basename(filePath)} → ${outputName}  ${sizeStr(originalSize)} → ${sizeStr(optimizedSize)}  (${savings}% saved)`)

  // Return mapping for JSON updates
  return {
    oldImage: '/' + dir + '/' + basename(filePath),
    newImage: '/' + dir + '/' + outputName,
    thumbImage: '/' + dir + '/thumbs/' + outputName,
  }
}

async function processDir(dir) {
  const fullDir = join(PUBLIC, dir)
  if (!existsSync(fullDir)) return []

  console.log(`\n📂 ${dir}`)
  const files = readdirSync(fullDir)
    .filter(f => !f.includes('Zone.Identifier') && !statSync(join(fullDir, f)).isDirectory())

  const mappings = []
  for (const file of files) {
    const result = await processImage(join(fullDir, file), dir)
    if (result) mappings.push(result)
  }
  return mappings
}

async function updateJsonFiles(allMappings) {
  const { readFileSync, writeFileSync } = await import('fs')

  const jsonFiles = [
    'src/data/artworks.json',
    'src/data/sketches.json',
    'src/data/photos.json',
  ]

  // Build lookup: old path → { newImage, thumbImage }
  const lookup = {}
  for (const m of allMappings) {
    lookup[m.oldImage] = m
  }

  for (const jsonFile of jsonFiles) {
    if (!existsSync(jsonFile)) continue
    let content = readFileSync(jsonFile, 'utf8')
    const data = JSON.parse(content)
    let changed = false

    for (const item of data) {
      if (item.image && lookup[item.image]) {
        item.image = lookup[item.image].newImage
        item.thumb = lookup[item.image]?.thumbImage || item.thumb
        changed = true
      }
      // Also add thumb field based on new image path
      const mapping = allMappings.find(m => m.newImage === item.image)
      if (mapping) {
        item.thumb = mapping.thumbImage
        changed = true
      }
    }

    if (changed) {
      writeFileSync(jsonFile, JSON.stringify(data, null, 2) + '\n')
      console.log(`  Updated ${jsonFile}`)
    }
  }
}

async function main() {
  console.log('🖼️  Optimizing images...\n')

  const allMappings = []
  for (const dir of IMAGE_DIRS) {
    const mappings = await processDir(dir)
    allMappings.push(...mappings)
  }

  console.log('\n📝 Updating JSON references...')
  await updateJsonFiles(allMappings)

  const sizeStr = (sz) => (sz / 1024 / 1024).toFixed(1) + 'MB'
  console.log('\n' + '─'.repeat(50))
  console.log(`  Files processed:  ${filesProcessed}`)
  console.log(`  Original total:   ${sizeStr(totalOriginal)}`)
  console.log(`  Optimized total:  ${sizeStr(totalOptimized)}`)
  console.log(`  Thumbnails total: ${sizeStr(totalThumbs)}`)
  console.log(`  Space saved:      ${sizeStr(totalOriginal - totalOptimized)} (${((1 - totalOptimized / totalOriginal) * 100).toFixed(0)}%)`)
  console.log('─'.repeat(50))
}

main().catch(err => { console.error(err); process.exit(1) })
