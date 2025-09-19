<script setup>
import { ref, reactive, computed, watch, nextTick, onBeforeUnmount, onMounted } from 'vue'
import axios from 'axios'
import GameTopBar from '@/components/GameTopBar.vue'
import DrawingPad from '@/components/DigitalWritingPage/DrawingPad.vue'
import UpperPart from '@/components/DigitalWritingPage/UpperPart.vue'

import trueImg from '@/assets/hibby_success.png'
import falseImg from '@/assets/hibby_feedback.png'
import successVideoSrc from '@/assets/hibby_success.mp4'

/* ---------- state ---------- */
const expectedLetter = ref('')
// kick the prompt cycle as soon as the first letter is revealed
const onReveal = async (ch) => {
  expectedLetter.value = ch
  await nextTick()
  startPromptCycle()
}

/* ---------- milestone (success video + in-modal toggles) ---------- */
const showMilestone = ref(false)
const successByLevel = reactive({ easy: 0, hard: 0 })  // counts per level

// NEW: pulse “Keep Exploring” after level toggle in modal
const nudgeExplore = ref(false)

const hintExplore = async () => {
  nudgeExplore.value = false      // reset so animation can restart
  await nextTick()
  nudgeExplore.value = true       // start pulsing (runs until clicked)
}

const openMilestone = () => {
  stopPromptCycle()
  showMilestone.value = true
}

const closeMilestone = async () => {
  nudgeExplore.value = false      // stop pulsing when closing / clicked
  showMilestone.value = false
  clearCanvas()
  await nextTick()
  startPromptCycle()
}

onMounted(() => {
  // Fallback: if for any reason `onReveal` races, start as soon as `displayed` is non-empty
  const stop = watch(displayed, (val) => {
    if (!val) return
    startPromptCycle()
    stop()
  }, { immediate: true })

  // Autoplay guard: first user gesture replays the prompt with sound
  const unlockOnce = () => {
    if (!childResponded.value) startPromptCycle()
    window.removeEventListener('pointerdown', unlockOnce)
  }
  window.addEventListener('pointerdown', unlockOnce, { once: true })
})

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
    try { audio.pause() } catch {}
    audio.currentTime = 0
    audio.onended = () => { i += 1; playNext() }
    audio.src = `/audio/letters/${chars[i].toLowerCase()}.mp3`
    audio.play().catch(() => { /* autoplay may be blocked; ghost still shows */ })
  }
  playNext()
}

/* ---------- prompt cycle (sound + ghost(3s) + re-prompt every 10s) ---------- */
let ghostHideTimer = null
let idleTimer = null
const hasWritten = ref(false)        // to highlight Capture
const childResponded = ref(false)    // halts idle prompts when true

const playPrompt = () => {
  playAudio()
  showGhost.value = true
  if (ghostHideTimer) clearTimeout(ghostHideTimer)
  ghostHideTimer = setTimeout(() => { showGhost.value = false }, 3000)
}

const scheduleIdlePrompt = () => {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    if (!childResponded.value) {
      playPrompt()
      scheduleIdlePrompt()
    }
  }, 10000)
}

const startPromptCycle = () => {
  stopPromptCycle()        // prevent overlaps
  hasWritten.value = false
  childResponded.value = false
  playPrompt()
  scheduleIdlePrompt()
}

const stopPromptCycle = () => {
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = null }
  if (ghostHideTimer) { clearTimeout(ghostHideTimer); ghostHideTimer = null }
}

onBeforeUnmount(() => {
  stopPromptCycle()
})

/* ---------- clear ---------- */
const clearCanvas = () => {
  try { drawingPadRef.value?.clear?.() } catch {}
  isCorrect.value = null
  detectedCount.value = 0
  hasWritten.value = false
}

/* ---------- helpers for capture ---------- */
const getInkDataURL = () => {
  if (drawingPadRef.value && typeof drawingPadRef.value.getImage === 'function') {
    return drawingPadRef.value.getImage()
  }
  const canvas = document.querySelector('.dw-pad canvas') || document.querySelector('canvas')
  if (!canvas) throw new Error('Ink canvas not found')
  return canvas.toDataURL('image/png')
}
const make300x300 = (dataURL, bg = '#ffffff', size = 300) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const out = document.createElement('canvas')
      out.width = size
      out.height = size
      const ctx = out.getContext('2d')

      ctx.fillStyle = bg
      ctx.fillRect(0, 0, size, size)

      const sw = img.width, sh = img.height
      const sAspect = sw / sh
      let dw, dh, dx, dy
      if (sAspect >= 1) {
        dw = size; dh = Math.round(size / sAspect)
        dx = 0; dy = Math.round((size - dh) / 2)
      } else {
        dh = size; dw = Math.round(size * sAspect)
        dy = 0; dx = Math.round((size - dw) / 2)
      }
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, sw, sh, dx, dy, dw, dh)

      resolve(out.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = dataURL
  })

const isChecking = ref(false)

/* ---------- capture + upload ---------- */
const captureAndBuildJson = async () => {
  try {
    isChecking.value = true
    const rawDataURL = getInkDataURL()
    let dataURL
    try { dataURL = await make300x300(rawDataURL, '#ffffff', 300) }
    catch { dataURL = rawDataURL }

    const payload = {
      expected_letter: (displayed.value || '').slice(0, level.value === 'hard' ? 2 : 1),
      canvas_input: toPureBase64(dataURL).replace(/\s+/g, ''),
      is_capital: caseMode.value === 'upper' ? 'capital' : 'small',
      level: level.value
    }

    const res = await axios.post(
      'https://wave-api-monashie.azurewebsites.net/alphabet_mastery',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    )

    // update UI
    isCorrect.value = res.data.is_correct
    detectedCount.value = res.data.detected_count

    // child responded; stop re-prompts until Next
    childResponded.value = true
    stopPromptCycle()

    // ---------- milestone after 10 successes IN THIS LEVEL ----------
    if (isCorrect.value) {
      successByLevel[level.value] = (successByLevel[level.value] ?? 0) + 1
      // reward on 10, 20, 30, ... for this level
      if (successByLevel[level.value] % 2 === 0) {
        isCorrect.value = null  // suppress small popup
        openMilestone()
      }
    }
  } catch (err) {
    console.error('Capture failed:', err)
    isCorrect.value = null
  } finally {
    isChecking.value = false
  }
}

/* ---------- Next: clear, advance, and restart prompt cycle ---------- */
const goNext = async () => {
  clearCanvas()

  if (upperPartRef.value?.nextCard) {
    upperPartRef.value.nextCard()
  } else {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
    const currentIndex = letters.indexOf(expectedLetter.value.toLowerCase())
    const idx = (currentIndex + 1) % letters.length
    expectedLetter.value = letters[idx]
  }

  await nextTick()
  startPromptCycle()
}

/* ---------- When the child writes: highlight Capture + stop idle prompts ---------- */
const onChildWrite = () => {
  hasWritten.value = true
  childResponded.value = true
  stopPromptCycle()
}

/* ---------- Close small result modal (X or overlay) ---------- */
const closeResultModal = async () => {
  const wasCorrect = isCorrect.value === true
  isCorrect.value = null
  if (wasCorrect) {
    await nextTick()
    await goNext()           // clears + advances + restarts prompts
  } else {
    clearCanvas()            // clears but stays on same letter
    await nextTick()
    startPromptCycle()       // restart prompts on current letter
  }
}

/* ---------- re-prompt when toggling Easy/Hard or Capital/Small ---------- */
watch([caseMode, level], async () => {
  await nextTick()
  if (showMilestone.value) return   // don't prompt while video modal is open
  startPromptCycle()
})
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
            <DrawingPad ref="drawingPadRef" class="dw-pad" @stroke="onChildWrite" />
          </div>

          <!-- controls -->
          <div class="dw-controls">
            <button
              class="dw-play"
              @click="playAudio"
              :disabled="!displayed"
              :aria-label="displayed ? `Play ${displayed}` : 'Play sound'"
              title="Play sound"
            >🔊</button>

            <button class="btn btn-ghost" :disabled="!displayed" @click="showGhost = !showGhost">💡 Show</button>
            <button class="btn btn-clear" @click="clearCanvas">🧽 Clear</button>

            <button
              class="btn btn-cap"
              :class="{ highlight: hasWritten }"
              :disabled="isChecking || !displayed"
              @click="captureAndBuildJson"
            >
              📸 Capture
            </button>

            <button class="next-link" :disabled="isChecking" @click="goNext">
              <span>Next</span> <span class="chev">▸</span>
            </button>
          </div>
        </div>
      </section>
    </section>

    <!-- small result modal (success/fail) -->
    <div v-if="isCorrect !== null" class="modal-overlay" @click="closeResultModal" aria-hidden="false">
      <div class="hibby-popup" :data-state="isCorrect ? 'ok' : 'nope'" role="dialog" aria-modal="true" @click.stop>
        <button class="close-x" @click="closeResultModal" aria-label="Close">✕</button>
        <img v-if="isCorrect" :src="trueImg" alt="Correct" />
        <img v-else :src="falseImg" alt="Incorrect" />
        <p>{{ isCorrect ? '🌟 Great job!' : '🔁 Try again' }}</p>
      </div>
    </div>

    <!-- milestone modal (video + toggles) -->
    <div v-if="showMilestone" class="modal-overlay" @click="closeMilestone" aria-hidden="false">
      <div class="milestone-modal" role="dialog" aria-modal="true" @click.stop>
        <button class="close-x" @click="closeMilestone" aria-label="Close">✕</button>

        <div class="video-wrap">
          <!-- ✅ no controls; plays inline, loops; keeps your existing layout -->
          <video
            :src="successVideoSrc"
            autoplay
            muted
            playsinline
            loop
            preload="auto"
            style="width:80%; height:auto; border-radius:12px; display:block;"
          ></video>
        </div>
        <h3 class="milestone-title">Great job! 🎉</h3>
        <p class="milestone-hint">Click on the cards to try the next level.</p>
        <div class="milestone-controls">
          <div class="flip-stack in-modal">
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
              @click="level = level === 'easy' ? 'hard' : 'easy'; hintExplore()"
              title="Easy / Hard"
            >
              <span class="front">Easy</span>
              <span class="back">Hard</span>
            </button>
          </div>

          <button
            class="btn btn-primary"
            :class="{ pulse: nudgeExplore }"
            @click="closeMilestone"
          >
            Keep Exploring
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sky{
  position: absolute;
  top: var(--nav-h);
  left: 0; right: 0;
  height: 200px;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}
.wave{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
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

/* modal (small result) */
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

/* milestone modal */
.milestone-modal {
  position: relative;
  max-width: 720px;
  width: calc(100% - 32px);
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0,0,0,.25);
  text-align: center;
  padding: 18px 18px 22px;
  animation: popIn .22s ease;
}
.video-wrap { width: 60%; margin: 4px 160px 16px; }
.milestone-controls { display: grid; gap: 12px; justify-items: center; }
.flip-stack.in-modal .flip { width: 170px; height: 80px; }
.btn-primary {
  background: #FD9B2D;
  font-size: 20px;
  width: 180px; height: 80px;
  color: #0f2b46;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 800;
  box-shadow: var(--shadow);
}
.btn-primary:hover { filter: brightness(0.98); }

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

/* capture highlight */
.highlight {
  animation: pulse 1s infinite;
  border: 2px solid #ff4081;
  box-shadow: 0 0 12px #ff80ab;
}
@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.milestone-title { 
  font-weight: 800; 
  font-size: 48px; 
  margin: 6px 0 2px; 
  letter-spacing: .02em; 
  color: var(--navy); 
}
.milestone-hint { 
  margin: 0 0 12px; 
  font-size: 36px;
  opacity: .9; 
  font-size: 16px; 
}

/* NEW: pulse animation for Keep Exploring button after level toggle */
.pulse { 
  animation: pulseScale .8s ease-in-out infinite; 
  will-change: transform; 
}
@keyframes pulseScale {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
</style>
