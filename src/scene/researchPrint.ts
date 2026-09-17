import * as THREE from 'three'
import printData from '../data/researchPrint.json'

/**
 * Printed top-sheet texture from REAL portfolio text
 * (tools/extract_research_text.py → src/data/researchPrint.json).
 * Nothing invented: title block, verbatim body lines, real map names.
 * Low-contrast print on matching paper — readable, never emissive.
 */
let cached: THREE.CanvasTexture | null = null

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export function getResearchPrint(): THREE.CanvasTexture {
  if (cached) return cached
  const W = 1024
  const H = 1448
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#f0ebe2'
  ctx.fillRect(0, 0, W, H)

  const ink = '#55524b'
  const faint = '#8a867c'
  let y = 130
  ctx.fillStyle = ink
  ctx.font = '600 76px Georgia, serif'
  y += wrap(ctx, printData.title, W - 160).length * 0 // title single line
  ctx.fillText(printData.title, 80, y)
  y += 30
  ctx.fillStyle = faint
  ctx.font = 'italic 44px Georgia, serif'
  ctx.fillText(printData.subtitle, 80, y + 44)
  y += 44 + 28
  ctx.fillStyle = faint
  ctx.font = '30px Helvetica, Arial, sans-serif'
  ctx.fillText(printData.meta, 80, y + 30)
  y += 30 + 36
  ctx.strokeStyle = '#b9b4a8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(80, y)
  ctx.lineTo(W - 80, y)
  ctx.stroke()
  y += 56

  ctx.fillStyle = ink
  ctx.font = '31px Georgia, serif'
  for (const sentence of printData.lines.slice(0, 4)) {
    for (const line of wrap(ctx, sentence, W - 160)) {
      if (y > H - 320) break
      ctx.fillText(line, 80, y)
      y += 48
    }
    y += 16
  }

  // Figure frame + real map-name caption (no invented imagery).
  const fy = H - 250
  ctx.strokeStyle = '#a09b8e'
  ctx.lineWidth = 2
  ctx.strokeRect(80, fy, W - 160, 120)
  ctx.fillStyle = faint
  ctx.font = '26px Helvetica, Arial, sans-serif'
  for (const [i, line] of wrap(ctx, printData.figure, W - 200).entries()) {
    ctx.fillText(line, 100, fy + 150 + i * 34)
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  // Blender plane UVs present canvas-top at the viewer-near edge
  // (vertical flip vs desk reading order) — mirror V back.
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.y = -1
  cached = tex
  return tex
}
