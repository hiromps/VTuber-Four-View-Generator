/**
 * 4枚の画像を1枚に合成する（16:9横長レイアウト）
 * Xシェア用に最適化 (1200x675px)
 */
export async function composeGridImages(
  images: Record<string, string | null>,
  labels: Record<string, string>
): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  // X最適化サイズ: 1200x675 (16:9)
  const canvasWidth = 1200
  const canvasHeight = 675
  const imageSize = 270 // 各画像のサイズ
  const gap = 15 // 画像間の隙間
  const labelHeight = 28 // ラベルの高さ

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // 背景色（ダークグレー）
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // タイトルを追加
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('VTuber Four-View Generator', canvasWidth / 2, 40)

  // 4枚の画像を横一列に配置（front, back, left, right の順）
  const keys = ['front', 'back', 'left', 'right']
  const totalWidth = imageSize * 4 + gap * 3
  const startX = (canvasWidth - totalWidth) / 2
  const startY = 90

  await Promise.all(
    keys.map(async (key, index) => {
      const src = images[key]
      if (!src) return

      const x = startX + (imageSize + gap) * index
      const y = startY

      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          // 画像を描画
          ctx.drawImage(img, x, y, imageSize, imageSize)

          // ラベルを描画
          ctx.fillStyle = '#8b5cf6' // 紫色
          ctx.fillRect(x, y + imageSize, imageSize, labelHeight)
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 16px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(labels[key], x + imageSize / 2, y + imageSize + labelHeight / 2 + 5)

          resolve()
        }
        img.onerror = reject
        img.src = src
      })
    })
  )

  // ウォーターマーク
  ctx.fillStyle = '#666666'
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('vtuber-four-view-generator.vercel.app', canvasWidth / 2, canvasHeight - 12)

  return canvas.toDataURL('image/png', 0.95)
}

/**
 * 4枚の画像を横一列に合成する
 * Xシェア用に最適化 (1600x500px - 16:5比率)
 */
export async function composeRowImages(
  images: Record<string, string | null>,
  labels: Record<string, string>
): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  const canvasWidth = 1600
  const canvasHeight = 500
  const imageSize = 360
  const gap = 20
  const padding = 20
  const labelHeight = 30

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // 背景色（ダークグレー）
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // タイトルを追加
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('VTuber Four-View Generator', canvasWidth / 2, 40)

  // 4枚の画像を横一列に配置
  const keys = ['front', 'back', 'left', 'right']
  const startX = (canvasWidth - (imageSize * 4 + gap * 3)) / 2

  await Promise.all(
    keys.map(async (key, index) => {
      const src = images[key]
      if (!src) return

      const x = startX + (imageSize + gap) * index
      const y = 70

      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          // 画像を描画
          ctx.drawImage(img, x, y, imageSize, imageSize)

          // ラベルを描画
          ctx.fillStyle = '#8b5cf6'
          ctx.fillRect(x, y + imageSize, imageSize, labelHeight)
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 16px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(labels[key], x + imageSize / 2, y + imageSize + labelHeight / 2 + 5)

          resolve()
        }
        img.onerror = reject
        img.src = src
      })
    })
  )

  // ウォーターマーク
  ctx.fillStyle = '#666666'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('vtuber-four-view-generator.vercel.app', canvasWidth / 2, canvasHeight - 10)

  return canvas.toDataURL('image/png', 0.95)
}

/**
 * Xシェア用のURLを生成
 */
export function generateTwitterShareUrl(text: string, url?: string): string {
  const params = new URLSearchParams()
  params.append('text', text)
  if (url) {
    params.append('url', url)
  }
  return `https://twitter.com/intent/tweet?${params.toString()}`
}
