<!-- src/components/DigitalWritingPage/DrawingPad.vue -->
<template>
  <div class="pad">
    <canvas ref="canvas" width="800" height="400"></canvas>
    <button class="clear" @click="clearCanvas">Clear</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvas = ref(null)
let ctx
let drawing = false
let lastX = 0, lastY = 0

const getPos = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

const onMouseDown = (e) => {
  drawing = true
  const p = getPos(e)
  lastX = p.x; lastY = p.y
}

const onMouseMove = (e) => {
  if (!drawing) return
  const p = getPos(e)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(p.x, p.y)
  ctx.stroke()
  lastX = p.x; lastY = p.y
}

const onMouseUp = () => { drawing = false }

const clearCanvas = () => {
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#111'
  clearCanvas() // 设为白底

  // 事件
  canvas.value.addEventListener('mousedown', onMouseDown)
  canvas.value.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp) // 防止移出画布时卡住
})

onBeforeUnmount(() => {
  if (!canvas.value) return
  canvas.value.removeEventListener('mousedown', onMouseDown)
  canvas.value.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})

// 暴露一个方法，让父组件可以调用
const getImage = () => {
  return canvas.value.toDataURL('image/png')  // 转 base64
}
defineExpose({ getImage })
</script>



<style scoped>
.pad { display: block; }
canvas {
  background: #fff;              /* 白色画布 */
  border: 1px solid #ddd;        /* 细边框（可去掉） */
  border-radius: 8px;            /* 轻微圆角（可去掉） */
  cursor: crosshair;
  display: block;
}

.clear {
  margin-top: 10px;
  padding: 6px 12px;
  background: #f7f7f7;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'OpenDyslexic', Arial, sans-serif; 
}

.clear:hover {
  color: #FD9B2D;
}

/* .clear:hover {
  color: #FD9B2D;
  font-size: 18px;
  font-weight: bold;
} */
</style>