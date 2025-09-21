<template>

  <!-- Main navigation row -->
  <GameTopBar />
  <div class="sky" aria-hidden="true">
     <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0,100 
            C180,180 360,20 540,100 
            C720,180 1000,20 1080,100 
            C1260,180 1440,20 1440,100 
            L1440,0 L0,0 Z"
          fill="#CFEFFF"/>
      </svg>

    </div>
  <div class="title-row">
    <h1 class="title">Letter Sound Mapping</h1>
  </div>
  <!-- Three-column layout -->
  <section class="lsm-layout" aria-labelledby="lsm-title">
    <!-- LEFT: Elephant / mascot -->
    <div class="left-hero" aria-hidden="true">
      <img class="elephant" src="@/assets/Elle_1.png" alt="" />
    </div>

    <!-- CENTER: Title, intro text, cards (two-up) -->
    <div class="center-panel">
      <p class="instructions">
        Click the cards to learn how to pronounce the alphabet. Fill the progress meter to level up!!
      </p>

      <div class="cards-container" role="list">
        <LetterCard
          v-for="(ch, i) in currentPair"
          :key="ch"
          :char="ch"
          :index="currentIndex + i + 1"
          role="listitem"
          @play="playSound(ch)"
        />
      </div>

      <div class="pair-nav">
        <button class="btn" @click="goPrev" :disabled="currentIndex === 0">Prev</button>
        <button class="btn" @click="goNext" :disabled="currentIndex >= totalLetters - 2">Next</button>
      </div>
    </div>

    <!-- RIGHT: Vertical progress tracker -->
    <ProgressTracker
      class="right-rail"
      :current="currentIndex + 1"
      :total="totalLetters"
      @jump="jumpTo"
    />
  </section>
  <!-- Congrats Modal -->
  <div v-if="showCongrats" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-card">
      <video autoplay loop muted playsinline class="congrats-video">
        <source src="@/assets/elle_success.mp4" type="video/mp4" />
      </video>

      <h2 id="modal-title">Great job! 🎉</h2>
      <p>Now go to level 2.</p>
      <div class="modal-actions">
        <button class="btn secondary" @click="closeCongrats">Keep exploring</button>
        <button class="btn primary" @click="emit('request-next-level')">Go to Level 2</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

import GameTopBar from '@/components/GameTopBar.vue'
import LetterCard from '@/components/LetterSoundMappingPage/LetterCard.vue'
import ProgressTracker from '@/components/LetterSoundMappingPage/ProgressTracker.vue'

/* Keep existing Swiper imports */
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'

/* Data */
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/* per-pair click state */
const clicked = ref({})         // { A: true, B: false }
const allowNextAtEnd = ref(false)

const markClicked = (ch) => {
  if (!ch) return
  clicked.value = { ...clicked.value, [ch]: true }
  nextTick().then(applyCardGlow)
}

/* wrap play so template stays the same */
const playSound = (char) => {
  console.log('Clicked letter:', char)
  markClicked(char)
}

const emit = defineEmits(['request-next-level'])

/* UI state */
const currentIndex = ref(0) // 0..25
const totalLetters = letters.length
const currentPair = computed(() => {
  const a = letters[currentIndex.value] || 'A'
  const b = letters[currentIndex.value + 1] || ''
  return [a, b].filter(Boolean)
})

const resetPairClicks = () => {
  const fresh = {}
  for (const ch of currentPair.value) fresh[ch] = false
  clicked.value = fresh
  nextTick().then(() => {
    applyCardGlow()
    bindCardClickHandlers()
  })
}

const bothClicked = computed(() =>
  currentPair.value.length > 0 &&
  currentPair.value.every(ch => !!clicked.value[ch])
)

/* nav */
const goNext = () => {
  if (currentIndex.value < totalLetters - 2) {
    currentIndex.value += 2
    resetPairClicks()
    nextTick().then(applyNextButtonCue)
  }
}
const goPrev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 2
    resetPairClicks()
    nextTick().then(applyNextButtonCue)
  }
}
const jumpTo = (n) => {
  const target = Math.min(Math.max(n - 1, 0), totalLetters - 1)
  currentIndex.value = target % 2 === 0 ? target : target - 1
  resetPairClicks()
  nextTick().then(applyNextButtonCue)
}

/* ===== Congrats modal: show only after finishing last pair (Y & Z) ===== */
const showCongrats = ref(false)
const hasShownCongrats = ref(false)
const atEnd = computed(() => currentIndex.value >= totalLetters - 2)

let endModalTimer = null
watch([bothClicked, atEnd], ([ready, end]) => {
  clearTimeout(endModalTimer)
  if (end && ready && !hasShownCongrats.value) {
    // brief delay so Z audio can start
    endModalTimer = setTimeout(() => {
      showCongrats.value = true
      allowNextAtEnd.value = true   // keep Next available if they close the modal
    }, 800)
  }
})

const closeCongrats = () => {
  showCongrats.value = false
  allowNextAtEnd.value = true
}
const goToLevel2 = () => {
  hasShownCongrats.value = true
  showCongrats.value = false
  emit('request-next-level')
}

/* =================== UI glue (no template changes) =================== */

let injectedStyleEl = null
const ensureKeyframes = () => {
  if (injectedStyleEl) return
  const css = `
@keyframes lsmGlowSoft {
  0%   { box-shadow: 0 0 0 rgba(253,155,45,0.0); transform: translateY(0); }
  50%  { box-shadow: 0 0 24px rgba(253,155,45,0.55); transform: translateY(-1px); }
  100% { box-shadow: 0 0 0 rgba(253,155,45,0.0); transform: translateY(0); }
}
@keyframes lsmCtaPulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.045); }
  100% { transform: scale(1); }
}
.lsm-nudge-glow { animation: lsmGlowSoft 1.4s ease-in-out infinite; }
.lsm-cta-ready  { background: #FD9B2D !important; color: #0f2b46 !important; border: none !important; }
.lsm-cta-pulse  { animation: lsmCtaPulse 1.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .lsm-nudge-glow, .lsm-cta-pulse { animation: none !important; }
}`
  injectedStyleEl = document.createElement('style')
  injectedStyleEl.id = 'lsm-engagement-keyframes'
  injectedStyleEl.textContent = css
  document.head.appendChild(injectedStyleEl)
}

/* helpers to access existing DOM */
const getNextButtonEl = () => {
  const container = document.querySelector('.pair-nav')
  if (!container) return null
  const btns = container.querySelectorAll('.btn')
  return btns.length ? btns[btns.length - 1] : null
}
const getCardEls = () => {
  const wrap = document.querySelector('.cards-container')
  if (!wrap) return []
  return Array.from(wrap.querySelectorAll('[role="listitem"]'))
}

/* Sequential glow: only the first unclicked card (A then B) */
const applyCardGlow = () => {
  const cards = getCardEls()
  if (!cards.length) return
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

  let targetIdx = -1
  currentPair.value.forEach((ch, idx) => {
    if (targetIdx === -1 && !clicked.value[ch]) targetIdx = idx
  })

  currentPair.value.forEach((ch, idx) => {
    const el = cards[idx]
    if (!el) return
    el.classList.remove('lsm-nudge-glow')
    if (!reduceMotion && idx === targetIdx) el.classList.add('lsm-nudge-glow')
  })

  for (let i = currentPair.value.length; i < cards.length; i++) {
    cards[i]?.classList.remove('lsm-nudge-glow')
  }
}

/* Next button cue + end-of-alphabet behavior */
const onNextClickAtEnd = (e) => {
  const end = currentIndex.value >= totalLetters - 2
  if (!end) return
  e?.preventDefault?.()

  if (!hasShownCongrats.value) {
    // show appreciation again instead of jumping ahead
    showCongrats.value = true
    allowNextAtEnd.value = true   // keep Next enabled if they close again
    return
  }

  // If they already accepted (pressed "Go to Level 2"), proceed
  goToLevel2()
}
const applyNextButtonCue = () => {
  const btn = getNextButtonEl()
  if (!btn) return
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  const end = currentIndex.value >= totalLetters - 2

  btn.classList.remove('lsm-cta-ready', 'lsm-cta-pulse')

  if (end) {
    if (bothClicked.value || allowNextAtEnd.value) {
      btn.disabled = false
      btn.classList.add('lsm-cta-ready')
      if (!reduceMotion) btn.classList.add('lsm-cta-pulse')
      if (!btn.dataset.lsmBoundEnd) {
        btn.addEventListener('click', onNextClickAtEnd, { passive: true })
        btn.dataset.lsmBoundEnd = '1'
      }
      return
    }
  } else {
    btn.disabled = undefined
    if (bothClicked.value) {
      btn.classList.add('lsm-cta-ready')
      if (!reduceMotion) btn.classList.add('lsm-cta-pulse')
    }
  }

  if (btn.dataset.lsmBoundEnd) {
    btn.removeEventListener('click', onNextClickAtEnd)
    delete btn.dataset.lsmBoundEnd
  }
}

/* bind clicks directly to visible cards (defensive) */
let boundHandlers = []
const bindCardClickHandlers = () => {
  unbindCardClickHandlers()
  const cards = getCardEls()
  currentPair.value.forEach((ch, idx) => {
    const el = cards[idx]
    if (!el) return
    const handler = () => markClicked(ch)
    el.addEventListener('click', handler, { passive: true })
    boundHandlers.push({ el, handler })
  })
}
const unbindCardClickHandlers = () => {
  for (const { el, handler } of boundHandlers) {
    try { el.removeEventListener('click', handler) } catch {}
  }
  boundHandlers = []
}

/* watchers */
watch(currentPair, async () => {
  await nextTick()
  resetPairClicks()
  applyNextButtonCue()
  applyCardGlow()
  bindCardClickHandlers()
}, { immediate: true })

watch(clicked, () => {
  applyCardGlow()
  applyNextButtonCue()
}, { deep: true })

watch(bothClicked, () => {
  applyNextButtonCue()
})

/* optional auto-advance (off) */
let autoTimer = null
const AUTO_ADVANCE_MS = 0
watch(bothClicked, (ready) => {
  clearTimeout(autoTimer)
  if (!ready || AUTO_ADVANCE_MS <= 0) return
  autoTimer = setTimeout(() => {
    if (currentIndex.value < totalLetters - 2) goNext()
  }, AUTO_ADVANCE_MS)
})

/* mount/unmount */
onMounted(() => {
  ensureKeyframes()
  nextTick().then(() => {
    applyCardGlow()
    applyNextButtonCue()
    bindCardClickHandlers()
  })
})

onBeforeUnmount(() => {
  try { clearTimeout(autoTimer) } catch {}
  try { clearTimeout(endModalTimer) } catch {}
  unbindCardClickHandlers()
})
</script>

<style scoped>
/* Layout shell */

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

.lsm-layout {
  display: grid;
  grid-template-columns: 1fr 1.3fr 160px;
  gap: 24px;
  align-items: start;
}

/* Left mascot */
.left-hero { display: flex; align-items: center; justify-content: center; }
.elephant { max-width: 450px; width: 100%; height: auto; }

/* Center column */
.title-row { display: flex; justify-content: center; }
.title { text-align: center; margin: 10px auto 16px; max-width: 1200px; font-size: 50px; z-index: 10; }
.instructions { max-width: 45ch; margin-bottom: 16px; opacity: 0.9; font-size: 25px; }

/* Two cards like figma */
.cards-container {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 16px;
  align-items:center;
  margin-top: 4px;
}

.pair-nav { display: flex; gap: 365px; margin-top: 20px; }
.btn {
  min-width: 140px;
  padding: 12px 28px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.3px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.08);
  background: #fff;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
}
.btn:hover{ transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,.15); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Right rail */
.rail {
  --track-w: 50px;
  display: flex; flex-direction: column; align-items: center;
  width: calc(var(--track-w) + 24px); gap: 8px;
}
.numbers { width: var(--track-w); text-align: center; margin: 0; line-height: 1; font-weight: 800; font-size: 20px; color: #0f2b46; font-variant-numeric: tabular-nums; }
.numbers.top{ margin-bottom: 6px; }
.numbers.bottom{ margin-top: 6px; }
.track { width: var(--track-w); height: min(60vh, 520px); background: rgba(0,0,0,0.15); border-radius: 999px; position: relative; overflow: hidden; }
.fill { background: #FD9B2D; position: absolute; bottom: 0; left: 0; width: 100%; box-shadow: inset 0 0 7.6px rgba(0,0,0,0.15); }
.thumb { width: 32px; height: 32px; box-shadow: 0 6px 14px rgba(0,0,0,0.18); border: 2px solid rgba(255,255,255,0.9); }

.right-rail { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; margin-top: -25px; }

/* Responsive */
@media (max-width: 980px) {
  .lsm-layout { grid-template-columns: 1fr; }
  .right-rail { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; margin-top: -70px; }
  .left-hero { order: 1; }
  .center-panel { order: 2; }
}
</style>

<!-- Keep your existing Swiper overrides -->
<style>
:deep(.my-swiper) { --swiper-navigation-color: #000; }
:deep(.swiper-button-prev:hover),
:deep(.swiper-button-next:hover) { --swiper-navigation-color: #FD9B2D; }

/* --- Congrats modal --- */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 43, 70, 0.45);
  display: grid; place-items: center; z-index: 999;
}
.modal-card {
  width: min(520px, 92vw); background: #fff; border-radius: 20px; padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2); text-align: center;
}
.modal-card h2 { margin: 0 0 8px; font-size: 28px; color: #0f2b46; }
.modal-card p  { margin: 0 0 18px; font-size: 18px; }
.modal-actions { display: flex; gap: 12px; justify-content: center; }
.congrats-video { width: 80%; max-width: 300px; max-height: 200px; border-radius: 12px; display: block; margin: 0 auto 1rem; object-fit: contain; }

.btn.primary { background: #FD9B2D; color: #0f2b46; border: none; }
.btn.secondary { background: #fff; border: 1px solid rgba(0,0,0,0.1); }
</style>
