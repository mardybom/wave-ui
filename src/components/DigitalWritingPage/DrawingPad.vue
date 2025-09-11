<template>
  <canvas ref="canvas" class="pad"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvas = ref(null)
let ctx, drawing = false, lastX = 0, lastY = 0

// Resize the canvas to match its CSS size * devicePixelRatio,
// and scale the context so we can draw using CSS pixel units.
const resizeCanvas = () => {
  const dpr = Math.max(1, window.devicePixelRatio || 1)
  const rect = canvas.value.getBoundingClientRect()

  // Only resize if needed to avoid clearing on every call
  const displayWidth  = Math.round(rect.width  * dpr)
  const displayHeight = Math.round(rect.height * dpr)

  if (canvas.value.width !== displayWidth || canvas.value.height !== displayHeight) {
    canvas.value.width  = displayWidth
    canvas.value.height = displayHeight

    ctx = canvas.value.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // now 1 unit == 1 CSS pixel
    initStyle()
    whiteBg()
  }
}

const initStyle = () => {
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#111'
}

const whiteBg = () => {
  if (!ctx || !canvas.value) return
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
}

const getPos = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  const t = e.touches?.[0]
  return {
    x: (t ? t.clientX : e.clientX) - rect.left,
    y: (t ? t.clientY : e.clientY) - rect.top
  }
}

const start = (e) => { const p = getPos(e); drawing = true; lastX = p.x; lastY = p.y }
const move  = (e) => {
  if (!drawing) return
  const p = getPos(e)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(p.x, p.y)
  ctx.stroke()
  lastX = p.x; lastY = p.y
}
const end = () => { drawing = false }

const clear = () => { ctx.clearRect(0, 0, canvas.value.width, canvas.value.height) }
const getImage = () => canvas.value.toDataURL('image/png')

let ro // ResizeObserver
onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resizeCanvas() // initial

  // Keep it crisp on resizes / layout changes
  ro = new ResizeObserver(resizeCanvas)
  ro.observe(canvas.value)
  window.addEventListener('resize', resizeCanvas)

  canvas.value.addEventListener('mousedown', start)
  canvas.value.addEventListener('mousemove', move)
  window.addEventListener('mouseup', end)
  canvas.value.addEventListener('touchstart', (e)=>{ e.preventDefault(); start(e) }, { passive:false })
  canvas.value.addEventListener('touchmove',  (e)=>{ e.preventDefault(); move(e)  }, { passive:false })
  window.addEventListener('touchend', end)
})

onBeforeUnmount(() => {
  if (!canvas.value) return
  ro?.disconnect()
  window.removeEventListener('resize', resizeCanvas)
  canvas.value.removeEventListener('mousedown', start)
  canvas.value.removeEventListener('mousemove', move)
  window.removeEventListener('mouseup', end)
  window.removeEventListener('touchend', end)
})

defineExpose({ getImage, clear })
</script>

<style scoped>
.pad {
  width: 80%;
  height: 80%;
  display: block;
  touch-action: none; /* prevents panning/zooming from interfering with drawing */
}
</style>
