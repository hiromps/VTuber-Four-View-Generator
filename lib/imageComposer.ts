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
  const gap = 10 // 画像間の隙間
  const labelHeight = 32 // ラベルの高さ
  const titleHeight = 70 // タイトル領域
  const bottomMargin = 30 // 下部マージン

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // 背景色（ダークグレー）
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // タイトルを追加
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('VTuber Four-View Generator', canvasWidth / 2, 45)

  // 4枚の画像を横一列に配置（front, back, left, right の順）
  const keys = ['front', 'back', 'left', 'right']

  // 利用可能な高さを計算（タイトル、ラベル、マージンを除く）
  const availableHeight = canvasHeight - titleHeight - labelHeight - bottomMargin

  // まず全ての画像を読み込んでアスペクト比を取得
  const imageData = await Promise.all(
    keys.map(async (key) => {
      const src = images[key]
      if (!src) return null

      return new Promise<{ key: string; img: HTMLImageElement; aspectRatio: number } | null>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const aspectRatio = img.width / img.height
          resolve({ key, img, aspectRatio })
        }
        img.onerror = reject
        img.src = src
      })
    })
  )

  // nullを除外
  const validImages = imageData.filter((data): data is { key: string; img: HTMLImageElement; aspectRatio: number } => data !== null)

  if (validImages.length === 0) return canvas.toDataURL('image/png', 0.95)

  // 各画像の幅を計算（高さは固定、アスペクト比を保持）
  let imageHeight = availableHeight
  let imageWidths = validImages.map(data => imageHeight * data.aspectRatio)
  let totalWidth = imageWidths.reduce((sum, width) => sum + width, 0) + gap * (validImages.length - 1)

  // 幅がキャンバスを超える場合、高さをスケールダウン
  const maxWidth = canvasWidth - 40 // 左右に20pxずつマージン
  if (totalWidth > maxWidth) {
    const scale = maxWidth / totalWidth
    imageHeight = imageHeight * scale
    imageWidths = validImages.map(data => imageHeight * data.aspectRatio)
    totalWidth = imageWidths.reduce((sum, width) => sum + width, 0) + gap * (validImages.length - 1)
  }

  const startX = (canvasWidth - totalWidth) / 2
  const startY = titleHeight + (availableHeight - imageHeight) / 2 // 垂直方向で中央揃え

  // 画像を描画
  let currentX = startX
  validImages.forEach(({ key, img, aspectRatio }, index) => {
    const imageWidth = imageWidths[index]

    // 画像を描画
    ctx.drawImage(img, currentX, startY, imageWidth, imageHeight)

    // ラベルを描画
    ctx.fillStyle = '#8b5cf6' // 紫色
    ctx.fillRect(currentX, startY + imageHeight, imageWidth, labelHeight)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(labels[key], currentX + imageWidth / 2, startY + imageHeight + labelHeight / 2 + 6)

    currentX += imageWidth + gap
  })

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
