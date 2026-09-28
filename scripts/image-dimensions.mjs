import { readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

async function collect(directory, prefix = '') {
  const dimensions = {}
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`
    const file = join(directory, entry.name)
    if (entry.isDirectory()) Object.assign(dimensions, await collect(file, relative))
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) {
      const { width, height } = await sharp(file).metadata()
      dimensions[relative] = [width, height]
    }
  }
  return dimensions
}

const dimensions = await collect('public')
await writeFile('src/data/imageDimensions.json', `${JSON.stringify(dimensions, null, 2)}\n`)
console.log(`Recorded dimensions for ${Object.keys(dimensions).length} images`)
