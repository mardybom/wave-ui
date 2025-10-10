<template>
  <canvas ref="canvas" class="pad"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['stroke'])

const canvas = ref(null)
let ctx, drawing = false, lastX = 0, lastY = 0
let hasEmittedSinceClear = false

const resizeCanvas = () => {
  const dpr = Math.max(1, window.devicePixelRatio || 1)
  const rect = canvas.value.getBoundingClientRect()
  const w = Math.max(1, Math.floor(rect.width * dpr))
  const h = Math.max(1, Math.floor(rect.height * dpr))
  canvas.value.width = w
  canvas.value.height = h

  ctx = canvas.value.getContext('2d', { willReadFrequently: true })
  ctx.scale(dpr, dpr)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.lineWidth = 12
  ctx.strokeStyle = '#222'
}

const start = (x, y) => {
  drawing = true
  lastX = x; lastY = y
}

const draw = (x, y) => {
  if (!drawing) return
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x; lastY = y

  if (!hasEmittedSinceClear) { emit('stroke'); hasEmittedSinceClear = true }
}

const end = () => { drawing = false }

const getXY = (e) => {
  const r = canvas.value.getBoundingClientRect()
  if (e.touches && e.touches[0]) {
    const t = e.touches[0]
    return [t.clientX - r.left, t.clientY - r.top]
  }
  return [e.clientX - r.left, e.clientY - r.top]
}

const getImage = () => {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = 1920
  exportCanvas.height = 1080
  const exportCtx = exportCanvas.getContext('2d')
  exportCtx.fillStyle = '#ffffff'
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
  exportCtx.drawImage(canvas.value, 0, 0, exportCanvas.width, exportCanvas.height)
  return exportCanvas.toDataURL('image/png')
}

const clear = () => {
  const { width, height } = canvas.value
  ctx.save()
  ctx.setTransform(1,0,0,1,0,0)
  ctx.clearRect(0, 0, width, height)
  ctx.restore()
  hasEmittedSinceClear = false
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // mouse
  canvas.value.addEventListener('mousedown', (e) => start(...getXY(e)))
  canvas.value.addEventListener('mousemove', (e) => draw(...getXY(e)))
  window.addEventListener('mouseup', end)

  // touch
  canvas.value.addEventListener('touchstart', (e) => { e.preventDefault(); start(...getXY(e)) }, { passive: false })
  canvas.value.addEventListener('touchmove',  (e) => { e.preventDefault(); draw(...getXY(e)) },  { passive: false })
  window.addEventListener('touchend', end)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('mouseup', end)
  window.removeEventListener('touchend', end)
})

defineExpose({ getImage, clear })
</script>

<style scoped>
.pad { width: 100%; height: 100%; display: block; touch-action: none; }
</style>