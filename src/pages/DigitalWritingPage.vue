<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import GameTopBar from '@/components/GameTopBar.vue'
import DrawingPad from '@/components/DigitalWritingPage/DrawingPad.vue'
import UpperPart from '@/components/DigitalWritingPage/UpperPart.vue'

import trueImg from '@/assets/hibby_success.png'
import falseImg from '@/assets/hibby_feedback.png'

/* ---------- state ---------- */
const expectedLetter = ref('')
const onReveal = (ch) => { expectedLetter.value = ch }

const isCorrect = ref(null)
const detectedCount = ref(0)

const drawingPadRef = ref(null)
const upperPartRef = ref(null)

const toPureBase64 = (dataURL) => dataURL.split(',')[1] ?? dataURL

/* ---------- flip cards (case + level) ---------- */
const caseMode = ref('upper')   // 'upper' | 'lower'
const level    = ref('easy')    // 'easy'  | 'hard'

const displayed = ref('')
const rebuildDisplayed = () => {
  if (!expectedLetter.value) { displayed.value = ''; return }
  const base = expectedLetter.value[0]
  if (!base) { displayed.value = ''; return }

  let out = base
  if (level.value === 'hard') {
    const alpha = 'abcdefghijklmnopqrstuvwxyz'
    let r
    do { r = alpha[Math.floor(Math.random() * 26)] }
    while (r.toLowerCase() === base.toLowerCase())
    out += r
  }
  displayed.value = caseMode.value === 'upper'
    ? out.toUpperCase()
    : out.toLowerCase()
}
watch([expectedLetter, caseMode, level], rebuildDisplayed, { immediate: true })

/* ---------- ghost + lined background ---------- */
const showGhost = ref(false)
const linedPaperStyle = computed(() => ({
  background: `repeating-linear-gradient(
    to bottom,
    #ffffff 0px, #ffffff 38px,
    #CDE7FF 38px, #CDE7FF 40px
  )`
}))

/* ---------- audio ---------- */
let audio
const playAudio = () => {
  if (!displayed.value) return
  const chars = displayed.value.split('')
  let i = 0
  const playNext = () => {
    if (i >= chars.length) return
    if (!audio) audio = new Audio()
    audio.onended = () => { i += 1; playNext() }
    audio.src = `/audio/letters/${chars[i].toLowerCase()}.mp3`
    audio.play().catch(() => {})
  }
  playNext()
}

/* ---------- clear + API ---------- */
const clearCanvas = () => {
  try { drawingPadRef.value?.clear?.() } catch {}
  isCorrect.value = null
  detectedCount.value = 0
}

const isChecking = ref(false)
const captureAndBuildJson = async () => {
  if (!drawingPadRef.value) return
  const dataURL = drawingPadRef.value.getImage()
  const payload = {
    expected_letter: (displayed.value[0] || ''), // safe single-letter for backend
    canvas_input: toPureBase64(dataURL),
  }

  try {
    isChecking.value = true
    const res = await axios.post(
      'https://wave-api-monashie.azurewebsites.net/alphabet_mastery',
      payload
    )
    isCorrect.value = res.data.is_correct
    detectedCount.value = res.data.detected_count
  } catch (err) {
    console.error('API request failed:', err)
    isCorrect.value = false
  } finally {
    isChecking.value = false
  }
}

/* ---------- next ---------- */
const goNext = () => {
  if (upperPartRef.value?.nextCard) {
    upperPartRef.value.nextCard()
    return
  }
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const currentIndex = letters.indexOf(expectedLetter.value.toLowerCase())
  const idx = (currentIndex + 1) % letters.length
  expectedLetter.value = letters[idx]
  rebuildDisplayed()
  playAudio()
}
</script>

<template>
  <GameTopBar />
  <div class="sky" aria-hidden="true">
     <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0,100 
            C180,200 360,20 540,100 
            C720,180 900,20 1080,100 
            C1260,180 1440,30 1440,100 
            L1440,0 L0,0 Z"
          fill="#CFEFFF"/>
      </svg>

    </div>
  <div class="dw">
    <section class="dw-main">
      <!-- mascot -->
      <figure class="dw-mascot" aria-hidden="true">
        <img src="@/assets/hibby_1.png" alt="Mascot Hippo" />
      </figure>

      <!-- workspace -->
      <section class="dw-work">
        <!-- title -->
        <header class="dw-head">
          <div class="head-row">
            <h1>Digital Writing</h1>
          </div>
          <p>Hear the sound, trace the letter, and get feedback!</p>
        </header>
        <!-- flip toggles -->
            <div class="flip-stack">
              <button
                class="flip"
                :data-side="caseMode"
                @click="caseMode = caseMode === 'upper' ? 'lower' : 'upper'"
                title="Capital / Small"
              >
                <span class="front">Capital letters</span>
                <span class="back">Small letters</span>
              </button>
              <button
                class="flip"
                :data-side="level"
                @click="level = level === 'easy' ? 'hard' : 'easy'"
                title="Easy / Hard"
              >
                <span class="front">Easy</span>
                <span class="back">Hard</span>
              </button>
            </div>
        <!-- hidden letter generator -->
        <UpperPart ref="upperPartRef" @reveal="onReveal" />

        <!-- canvas + side buttons -->
        <div class="dw-canvasArea">
          <div class="dw-canvasWrap" :style="linedPaperStyle">
            <div v-if="showGhost && displayed" class="dw-ghost" :data-letter="displayed"></div>
            <DrawingPad ref="drawingPadRef" class="dw-pad" />
          </div>

          <!-- controls -->
          <div class="dw-controls">
            <!-- sound button -->
            <button
              class="dw-play"
              @click="playAudio"
              :disabled="!displayed"
              :aria-label="displayed ? `Play ${displayed}` : 'Play sound'"
              title="Play sound"
            >🔊</button>

            <!-- other buttons -->
            <button class="btn btn-ghost" :disabled="!displayed" @click="showGhost = !showGhost">💡 Show</button>
            <button class="btn btn-clear" @click="clearCanvas">🧽 Clear</button>
            <button class="btn btn-cap" :disabled="isChecking || !displayed" @click="captureAndBuildJson">📸 Capture</button>

            <button class="next-link" :disabled="isChecking" @click="goNext">
              <span>Next</span> <span class="chev">▸</span>
            </button>
          </div>
        </div>
      </section>
    </section>

    <!-- result modal -->
    <div v-if="isCorrect !== null" class="modal-overlay" @click="isCorrect = null" aria-hidden="false">
      <div class="hibby-popup" :data-state="isCorrect ? 'ok' : 'nope'" role="dialog" aria-modal="true" @click.stop>
        <button class="close-x" @click="isCorrect = null" aria-label="Close">✕</button>
        <img v-if="isCorrect" :src="trueImg" alt="Correct" />
        <img v-else :src="falseImg" alt="Incorrect" />
        <p>{{ isCorrect ? '🌟 Great job!' : '🔁 Try again' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sky{
  position: absolute;
  top: var(--nav-h);
  left: 0; right: 0;
  height: 200px;                /* adjust if you want a taller arc */
  overflow: hidden;             /* <-- important (prevents overflow) */
  z-index: 0;
  pointer-events: none;
}
.wave{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);  /* centers the wide SVG */
  width: 100%;                   /* restore the width you had */
  height: 50%;
}
:root {
  --sand: #fff3e6;
  --navy: #0e2a3a;
  --card: #ffffff;
  --shadow: 0 10px 28px rgba(9, 30, 66, .08);
  --orange: #ff951f;
  --orange-d: #d07916;
}

.dw { background: var(--sand); color: var(--navy); }

.dw-main {
  max-width: 1300px;
  margin: 0 auto;
  padding: 24px clamp(12px, 3vw, 32px) 56px;
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 12px;
  align-items: start;
}

.dw-mascot { margin-left: 0; transform: translateX(-200px); }
.dw-mascot img {
  width: 520px;
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,.07));
  transform: translateX(-40px);
  margin-left: 0;
}

.dw-work { display: grid; grid-template-rows: auto auto 1fr; gap: 14px; }

.head-row { display: flex; align-items: center; transform: translateX(-150px)}
.dw-head h1 { font-size: clamp(36px, 4vw, 56px); margin: 0; }
.dw-head p  { margin: 4px 0 0; opacity: .85; transform: translateX(-200px); font-size: 20px }

.dw-play {
  width: 100px; height: 100px;
  border-radius: 50%;
  background: #fff;
  border: 10px solid #d6d6d6;
  box-shadow: 0 4px 10px rgba(0,0,0,.3);
  font-size: 30px;
}

.dw-canvasArea {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 18px;
  align-items: start;
  margin-left: -200px;
}
.dw-canvasWrap {
  position: relative;
  border-radius: 18px;
  box-shadow: var(--shadow);
  background-color: var(--card);
  overflow: hidden;
  border: 1px solid #e9eef5;
  min-height: 30px;
}
.dw-pad { display:block; width:100%; height:100%; }
.dw-ghost::before {
  content: attr(data-letter);
  position: absolute; inset: 0;
  display: grid; place-items: center;
  font-size: clamp(160px, 24vw, 300px);
  color: rgba(20,41,59,.20);
  pointer-events: none; user-select: none;
}

.dw-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
}
.btn {
  font-weight: 800; letter-spacing:.02em;
  border-radius: 12px; padding: 12px 16px;
  border: 2px solid #0a0a0a10;
  background: #fff; box-shadow: var(--shadow);
}
.btn-ghost { background: #ffe89a; }
.btn-clear { background: #ffd4d3; }
.btn-cap   { background: #e6e2ff; }

.next-link {
  margin-top: 6px;
  background: transparent;
  border: 0;
  font-weight: 800;
  letter-spacing: .03em;
  text-align: left;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
}
.next-link:disabled { opacity: .5; cursor: default; }
.next-link .chev { transform: translateY(1px); }

/* modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(9, 30, 66, 0.45);
  backdrop-filter: blur(2px) saturate(110%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.hibby-popup {
  position: relative;
  max-width: 400px;
  max-height: 500px;
  width: calc(200% - 32px);
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0,0,0,.25);
  text-align: center;
  font-size: 24px;
  animation: popIn .22s ease;
}
.hibby-popup img { width: 250px; height: auto; }
.hibby-popup[data-state="ok"]   { border-color: #bfead2; }
.hibby-popup[data-state="nope"] { border-color: #ffd2c9; }

.close-x {
  position: absolute; top: 8px; right: 10px;
  border: 0; background: transparent;
  font-size: 20px; line-height: 1; cursor: pointer;
  opacity: .6;
}
.close-x:hover { opacity: 1; }

@keyframes popIn {
  from { opacity: 0; transform: scale(.96); }
  to   { opacity: 1; transform: scale(1); }
}

/* flip buttons (under sound button) */
.flip-stack { display:flex; flex-direction:row; gap:10px; margin:8px 0 4px; }
.flip {
  position: relative;
  width: 150px; height: 50px;
  border-radius: 10px;
  border: 2px solid #0a0a0a10;
  background: #f7dff9;
  box-shadow: var(--shadow);
  font-weight: 800;
  cursor: pointer;
  perspective: 500px;
}
.flip .front, .flip .back {
  position:absolute; inset:0;
  display:grid; place-items:center;
  backface-visibility:hidden;
  transition: transform .28s ease;
  border-radius: inherit;
}
.flip .front { transform: rotateY(0deg); }
.flip .back  { transform: rotateY(180deg); }
.flip[data-side="upper"] .front,
.flip[data-side="easy"]  .front { transform: rotateY(0deg); }
.flip[data-side="lower"] .front,
.flip[data-side="hard"]  .front { transform: rotateY(180deg); }
.flip[data-side="lower"] .back,
.flip[data-side="hard"]  .back  { transform: rotateY(0deg); }

/* mobile */
@media (max-width: 980px) {
  .dw-main { grid-template-columns: 1fr; }
  .dw-mascot img { width: 300px; transform: none; justify-self: center; }
  .dw-canvasArea { grid-template-columns: 1fr; margin-left: 0; }
  .dw-controls { flex-direction: row; justify-content: center; }
}
</style>
