<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineExpose } from 'vue'

/** Props
 * autoStart: 是否自动开始
 * startFrom: 初始秒数（默认0）
 */
const props = defineProps({
  autoStart: { type: Boolean, default: false },
  startFrom: { type: Number, default: 0 },
})


const totalSeconds = ref(props.startFrom)
let timerId = null

const timeStr = computed(() => {
  const m = Math.floor(totalSeconds.value / 60)
  const s = String(totalSeconds.value % 60).padStart(2, '0')
  return `${m}:${s}`
})


function start() {
  if (timerId) return
  timerId = setInterval(() => {
    totalSeconds.value++
  }, 1000)
}

function pause() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

function reset(to = props.startFrom) {
  totalSeconds.value = to
}

onMounted(() => {
  if (props.autoStart) start()
})

onUnmounted(() => pause())

// 暴露给父组件调用
defineExpose({ start, pause, reset })
</script>

<template>
  <!-- 读屏友好 -->
  <span aria-live="polite" aria-atomic="true">{{ timeStr }}</span>
</template>

<style scoped>
/* 可按需自定义字体样式 */
</style>