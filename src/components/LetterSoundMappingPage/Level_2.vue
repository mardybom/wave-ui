<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import GameTopBar from '@/components/GameTopBar.vue'
import ProgressTracker from '@/components/LetterSoundMappingPage/ProgressTracker.vue'
import LetterCard_level2 from '@/components/LetterSoundMappingPage/LetterCard_level2.vue'

const emit = defineEmits(['request-prev-level','request-start-learning'])

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
const currentIndex = ref(0)
const target = computed(() => letters[currentIndex.value])

// five-card round (JS only)
const cards = ref([])
const selectedTargetIdxs = ref(new Set())
const targetCount = ref(0)
const lastWrong = ref(null)

// ui
const isPlaying = ref(false)
const showWin = ref(false)

// NEW: congrats modal logic
const showCongrats = ref(false)
const hasShownCongrats = ref(false)
function closeCongrats () { showCongrats.value = false }

// audio
let audio = null
function playSound () {
  try {
    isPlaying.value = true
    if (audio) { audio.pause(); audio.currentTime = 0 }
    audio = new Audio(`/audio/letters/${target.value}.mp3`)
    audio.onended = () => (isPlaying.value = false)
    audio.onerror = () => (isPlaying.value = false)
    audio.play()
  } catch { isPlaying.value = false }
}

// round
function makeRound () {
  selectedTargetIdxs.value = new Set()
  lastWrong.value = null
  const correct = Math.floor(Math.random() * 3) + 1
  targetCount.value = correct
  const pool = Array.from({ length: correct }, () => target.value)
  while (pool.length < 4) {
    const r = letters[Math.floor(Math.random() * letters.length)]
    if (r !== target.value) pool.push(r)
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp
  }
  cards.value = pool
}

function onCard (i) {
  const chosen = cards.value[i]
  lastWrong.value = null
  if (chosen === target.value) {
    if (!selectedTargetIdxs.value.has(i)) selectedTargetIdxs.value.add(i)
    if (selectedTargetIdxs.value.size === targetCount.value) {
      showWin.value = true
      // NEW: if this was the last letter, show the congrats modal once
      if (currentIndex.value === letters.length - 1 && !hasShownCongrats.value) {
        showCongrats.value = true
        hasShownCongrats.value = true
      }
    }
  } else {
    lastWrong.value = i
    setTimeout(() => { if (lastWrong.value === i) lastWrong.value = null }, 420)
  }
}

function next () {
  currentIndex.value = currentIndex.value < letters.length - 1 ? currentIndex.value + 1 : 0
  showWin.value = false
  makeRound()
  playSound()
}
function prev () {
  if (currentIndex.value > 0) {
    currentIndex.value--
    showWin.value = false
    makeRound()
    playSound()
  }
}

onMounted(makeRound)
watch(currentIndex, makeRound)
</script>

<template>
  <div class="page">
    <GameTopBar />

    <!-- Wave -->
    <div class="sky" aria-hidden="true">
      <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0,100 
            C180,180 360,20 540,100 
            C720,180 1000,20 1080,100 
            C1260,180 1440,20 1440,100 
            L1440,0 L0,0 Z"
          fill="#CFEFFF"
        />
      </svg>
    </div>

    <!-- Title -->
    <header class="title-row">
      <h1 class="title">Letter Sound Mapping</h1>
      <p class="subtitle">Listen to the sound and select <strong>all</strong> matching letters.</p>
    </header>

    <!-- Content sized to viewport -->
    <main class="wrap">
      <section class="board">
        <!-- LEFT: mascot -->
        <img class="mascot" src="@/assets/Elle_1.png" alt="Friendly elephant mascot" />

        <!-- CENTER: sound + cards -->
        <div class="center">
          <button
            class="sound"
            :disabled="isPlaying"
            @click="playSound"
            :aria-label="`Play sound for letter ${target}`"
            title="Play the letter sound"
          >🔊</button>
          <div class="cards">
            <div
              v-for="(ch, i) in cards"
              :key="i"
              class="card-wrap"
              :class="{ selected: selectedTargetIdxs.has(i), wrong: lastWrong === i }"
              @click="onCard(i)"
              role="button"
              tabindex="0"
              @keydown.enter="onCard(i)"
            >
              <LetterCard_level2 :char="ch" :index="i + 1">
                <span class="glyph">{{ ch }}</span>
              </LetterCard_level2>
            </div>
          </div>
        </div>

        <!-- RIGHT: progress rail -->
        <aside class="right-rail">
          <ProgressTracker :current="currentIndex + 1" :total="letters.length" />
        </aside>
      </section>

      <!-- Controls (always visible) -->
      <div class="controls">
        <button class="btn" @click="prev" :disabled="currentIndex === 0">Prev</button>
        <button class="btn primary" @click="next" :disabled="selectedTargetIdxs.size !== targetCount">Next</button>
      </div>
      <div><button class="link" @click="emit('request-prev-level')"> ↩ Back to Level 1</button></div>
    </main>

    <!-- Congrats Modal -->
    <div v-if="showCongrats" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-card">
            <!-- Animation video -->
            <video 
            autoplay 
            loop 
            muted 
            playsinline 
            class="congrats-video"
            >
            <source src="@/assets/elle_success.mp4" type="video/mp4" />

            </video>

            <h2 id="modal-title">Great job! 🎉</h2>
            <p>Now go to level 2.</p>
            <div class="modal-actions">
            <button class="btn secondary" @click="closeCongrats">Keep exploring</button>
            <button class="btn primary" @click="emit('request-start-learning')">Go to next game</button>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- Vars ---------- */
:root {
  --nav-h: 100px;     /* GameTopBar height (tune if needed) */
  --wave-h: 160px;    /* wave band height */
  --title-h: 140px;   /* title + subtitle block (approx) */
  --gutter: 56px;     /* BIG space between columns */
}

/* ---------- Shell ---------- */
.page{
  position: relative;
  height: 100vh;
  overflow: hidden;              /* no page scroll */
  background:#fff6e9;
  color:#0f2b46;
}

.sky{
  position: absolute;
  top: var(--nav-h);
  left: 0; right: 0;
  height: var(--wave-h);
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.wave{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: var(--wave-h);
}

/* ---------- Title ---------- */
.title-row{
  position: relative;
  z-index: 2; /* above wave */
  text-align:center;
  margin-top: calc(var(--wave-h) 25px); /* keeps it below the curve */
}
.title{
  font-size:48px;
  margin: 6px 0 4px;
  letter-spacing: 2px;
}
.subtitle{
  font-size:22px;
  opacity:.9;
  margin: 0;
}

/* ---------- Main area (no scroll; controls always visible) ---------- */
.wrap{
  position: relative;
  z-index: 2;
  max-width: 1420px;
  margin: 0 auto;

  display: grid;
  grid-template-rows: 1fr auto;   /* board | controls */
  height: calc(100vh - var(--nav-h) - var(--wave-h) - var(--title-h));
  min-height: 430px;
}

/* ---------- Board ---------- */
.board{
  display:grid;
  grid-template-columns: 320px 1fr 50px; /* bigger mascot | center | wider rail */
  align-items:center;
  column-gap: var(--gutter);
  height: 100%;
}

/* Mascot: bigger + more to the left */
.mascot{
  width: 340px;
  max-width: 250%;
  justify-self: start;   /* push left edge */
  margin-left: -100px;    
  object-fit: contain;
}

/* Center column */
.center{
  height: 100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  padding-right: 24px;    /* extra space away from rail */
}

/* Sound button */
.sound{
  width:120px; height:120px;
  border-radius:50%;
  border:0;
  background:#fff;
  box-shadow:0 8px 20px rgba(0,0,0,.12);
  font-size:48px; line-height:1;
  display:grid; place-items:center;
  cursor:pointer;
  margin-bottom: 18px;
  position: relative;
  left: -6%;
  transition: transform .1s ease, box-shadow .1s ease;
}
.sound:hover { transform: scale(1.05); box-shadow:0 10px 26px rgba(0,0,0,.16); }
.sound:disabled{ opacity:.6; cursor: default; }

/* Cards: single row of five with clear gaps */
.cards{
  width: 120%;
  margin-left: 10%;
  display:grid;
  grid-template-columns: repeat(5, minmax(80px, 1fr));
  gap: 24px;                 /* ← requested gap */
  align-items:stretch;
}

/* Clickable wrapper */
.card-wrap{
  cursor:pointer;
  border-radius:5px;
  transition: transform .08s ease, box-shadow .2s ease;
}
.card-wrap:hover{ transform: translateY(-1px); }
.card-wrap.selected{ box-shadow:0 0 10px 20px rgba(58,195,122,.6); }
.card-wrap.wrong{ animation:shake .3s linear; }

/* Hide any internal sound icon in LetterCard for this level */
.card-wrap :deep(.sound-btn),
.card-wrap :deep(.speaker),
.card-wrap :deep(.audio-btn),
.card-wrap :deep(.letter-card__sound),
.card-wrap :deep(.play){ display:none !important; }

.glyph{
  font-size:72px;
  font-weight:800;
  display:block;
  text-align:center;
  color:#0f2b46;
}

/* Right rail — clearly separate it from cards */
.right-rail{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  z-index: 1;
}
.level-tag{
  background:#0d2538;
  color:#fff;
  font-size:12px;
  padding:4px 8px;
  border-radius:10px;
}

/* ---------- Controls (fixed inside viewport) ---------- */
.controls{
  position: absolute;
  left: 50%;
  bottom: 50px;
  top: 370px;
  transform: translateX(-50%);
  display: grid;
  grid-auto-flow: column;
  gap: 200px;
  justify-content: center;
  align-items: center;
}
.btn{
  background:#fff; border:2px solid #dcdfea; border-radius:14px;
  padding:12px 20px; font-weight:700; cursor:pointer;
}
.btn.primary{ background:#FD9B2D; color:#0f2b46; border-color:#FD9B2D; }
.link{ background:none; bottom: 100px; top: 20px; border:0; text-decoration:underline; color:#0f2b46; cursor:pointer; font-weight:700; }

/* Modal */
.modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,.45); display:grid; place-items:center; }
.modal{ background:#fff; border-radius:18px; padding:28px; width:min(520px,92vw); text-align:center; box-shadow:0 14px 40px rgba(0,0,0,.25); }
.actions{ display:grid; grid-auto-flow:column; gap:12px; justify-content:center; margin-top:12px; }

@keyframes shake{
  10%,90%{ transform:translateX(-2px) }
  20%,80%{ transform:translateX(4px) }
  30%,50%,70%{ transform:translateX(-8px) }
  40%,60%{ transform:translateX(8px) }
}

/* Responsive squeezes rather than wrapping so we keep one row of 5 */
@media (max-width: 1200px){
  .board{ grid-template-columns: 320px 1fr 180px; }
  .cards{ grid-template-columns: repeat(5, minmax(150px, 1fr)); gap:20px; }
  .mascot{ width: 300px; }
}
@media (max-width: 980px){
  .board{ grid-template-columns: 260px 1fr 160px; }
  .cards{ grid-template-columns: repeat(5, minmax(130px, 1fr)); gap:16px; }
  .glyph{ font-size:60px; }
  .sound{ width:104px; height:104px; font-size:42px; }
  .mascot{ width: 260px; }
}
</style>