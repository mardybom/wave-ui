<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps({
  image: { type: String, required: true },
  options: {
    type: Array,
    required: true,
    validator: (val) => val.length === 4
  }
})

const selectedIndex = ref(null)
const answered = ref(false)
const emit = defineEmits(['answered'])

watch(
  [() => props.image, () => props.options],
  () => {
    selectedIndex.value = null
    answered.value = false
  },
  { flush: 'post' }
)

const voices = ref([])
function loadVoices() {
  if (!('speechSynthesis' in window)) return
  voices.value = window.speechSynthesis.getVoices()
}
function speak(text) {
  if (!('speechSynthesis' in window) || !text) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.95
  const v = voices.value.find(v => v.lang?.startsWith('en')) || null
  if (v) u.voice = v
  window.speechSynthesis.speak(u)
}
onMounted(() => {
  loadVoices()
  if ('speechSynthesis' in window) {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
  }
})
onBeforeUnmount(() => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }
})

function fireConfettiFrom(el) {
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = (rect.left + rect.width / 2) / window.innerWidth
  const y = (rect.top  + rect.height / 2) / window.innerHeight

  confetti({
    particleCount: 50,
    spread: 120,
    startVelocity: 40,
    gravity: 1,
    origin: { x, y },
    ticks: 200,
    scalar: 0.9,
  })
}

function selectOption(index, e) {
  if (answered.value) return
  const text = props.options[index]?.text
  if (text) speak(text)

  selectedIndex.value = index
  const isCorrect = !!props.options[index]?.isCorrect

  if (isCorrect) {
    fireConfettiFrom(e.currentTarget)
    answered.value = true
  }

  emit('answered', isCorrect)
}
</script>

<template>
  <div class="card-container">
    <div class="image-box">
      <img :src="image" alt="Choice Image" />
    </div>

    <div class="option-box">
      <button
        v-for="(opt, index) in options"
        :key="index"
        @click="selectOption(index, $event)"
        :class="[
          selectedIndex === index && opt.isCorrect ? 'correct' : '',
          selectedIndex === index && !opt.isCorrect ? 'wrong' : '',
          selectedIndex === index && !opt.isCorrect ? 'animate__animated animate__shakeX' : '',
        ]"
      >
        {{ opt.text }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.card-container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 3vw, 40px);
  flex-wrap: wrap;
}

.image-box {
  width: 30%;
  max-width: 500px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  max-height: 70vh;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.option-box {
  width: 35%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.6vw, 14px);
}

.option-box button {
  width: 100%;
  padding: clamp(10px, 1.8vw, 14px);
  font-size: clamp(11px, 2vw, 26px);
  font-weight: bold;
  border-radius: 10px;
  border: 2px solid #333;
  cursor: pointer;
  background: #fff;
  transition: background 0.3s;
  line-height: 1.25;
  word-break: break-word;
}

.option-box button:hover { background: #f0f0f0; }
.option-box button:active {
  background-color: #c2c2c2;
  box-shadow: inset 0 2px 4px rgba(0,0,0,.2);
}

.option-box button { --btn-border: #333; border: 2px solid var(--btn-border); }
.option-box button.correct { --btn-border: #27ae60; background: #c8f7c5; }
.option-box button.wrong   { --btn-border: #e74c3c; background: #f7c5c5; }

@media (max-width: 1100px) {
  .image-box { width: 52%; }
  .option-box { width: 46%; }
}

@media (max-width: 900px) {
  .card-container { justify-content: center; }
  .image-box,
  .option-box { width: min(720px, 96%); }
  .image-box { margin-bottom: 0; }
}

@media (max-width: 600px) {
  .image-box { aspect-ratio: 1 / 1; max-height: 55vh; }
  .option-box { width: 100%; max-width: 520px; }
  .option-box button { padding: clamp(10px, 3.5vw, 16px); }
}

@media (max-height: 650px) {
  .image-box { max-height: 48vh; }
}
</style>
