export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = reject

    reader.readAsDataURL(file)
  })
}

export function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function getSquareCropBounds(imgWidth, imgHeight) {
  const side = Math.min(imgWidth, imgHeight)
  const sx = (imgWidth - side) / 2
  const sy = (imgHeight - side) / 2

  return { sx, sy, side }
}

function drawToContext(ctx, img, canvasWidth, canvasHeight, options = {}) {
  const zoom = Number(options.zoom ?? 1)
  const offsetX = Number(options.offsetX ?? 0)
  const offsetY = Number(options.offsetY ?? 0)

  const { sx, sy, side } = getSquareCropBounds(img.width, img.height)

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.save()
  ctx.translate(canvasWidth / 2 + offsetX, canvasHeight / 2 + offsetY)
  ctx.scale(zoom, zoom)

  ctx.drawImage(
    img,
    sx,
    sy,
    side,
    side,
    -canvasWidth / 2,
    -canvasHeight / 2,
    canvasWidth,
    canvasHeight
  )

  ctx.restore()
}

export function drawImageToCanvas(canvas, img, options = {}) {
  const ctx = canvas.getContext("2d")
  drawToContext(ctx, img, canvas.width, canvas.height, options)
}

export async function cropAndResizeImage(dataUrl, options = {}) {
  const size = Number(options.size ?? 512)
  const img = await loadImageElement(dataUrl)

  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext("2d")
  drawToContext(ctx, img, size, size, options)

  return canvas.toDataURL("image/png")
}