<script setup>
import { ref, computed, watch } from 'vue'

import GameTopBar from '@/components/GameTopBar.vue'
import LetterCard from '@/components/LetterSoundMappingPage/LetterCard.vue'
import ProgressTracker from '@/components/LetterSoundMappingPage/ProgressTracker.vue'

/* Keep existing Swiper imports to avoid breaking any global styles/expectations */
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'

/* Keep original data + function */
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const playSound = (char) => {
  console.log('Clicked letter:', char)
}

const emit = defineEmits(['request-next-level'])


/* UI state (non-breaking) */
const currentIndex = ref(0) // 0..25 (we show pairs: [0,1], [2,3], ...)
const totalLetters = letters.length
const currentPair = computed(() => {
  const a = letters[currentIndex.value] || 'A'
  const b = letters[currentIndex.value + 1] || ''
  return [a, b].filter(Boolean)
})

const goNext = () => {
  if (currentIndex.value < totalLetters - 2) currentIndex.value += 2
}
const goPrev = () => {
  if (currentIndex.value > 0) currentIndex.value -= 2
}
const jumpTo = (n) => {
  // n is 1-based from ProgressTracker
  const target = Math.min(Math.max(n - 1, 0), totalLetters - 1)
  // snap to the pair start (even index)
  currentIndex.value = target % 2 === 0 ? target : target - 1
}
/* ===== Congrats modal trigger when progress hits 100% ===== */
const showCongrats = ref(false)
const hasShownCongrats = ref(false)
/* Match the tracker’s fill math: current is 1-based in the tracker */
const progressPct = computed(() =>
  Math.min(100, ((currentIndex.value + 1) / (totalLetters - 1)) * 100)
)

watch(progressPct, (val) => {
  if (val >= 100 && !hasShownCongrats.value) {
    showCongrats.value = true
  }
})

const closeCongrats = () => { showCongrats.value = false }

// If you use Vue Router, this will navigate. Otherwise it falls back to a hard link.
const goToLevel2 = () => {
  hasShownCongrats.value = true
  showCongrats.value = false
  emit('request-next-level')   // tell the wrapper to switch to Level 2
}
</script>

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
        <button class="btn primary" @click="emit('request-next-level')">Go to Level 2</button>
        </div>
  </div>
</div>
</template>

<style scoped>
/* Layout shell */

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

.lsm-layout {
  display: grid;
  grid-template-columns: 1fr 1.3fr 160px;
  gap: 24px;
  align-items: start;
}

/* Left mascot */
.left-hero {
  display: flex;
  align-items: center;
  justify-content: center;
}
.elephant {
  max-width: 450px;
  width: 100%;
  height: auto;
}

/* Center column */
.title-row {
  display: flex;
  justify-content: center;   /* centers the H1 horizontally */
}
.title {
  text-align: center;        /* ensures text inside H1 is centered */
  margin: 10px auto 16px;    /* keeps it centered even if wrapper changes */
  max-width: 1200px;         /* prevents super-wide line length */
  font-size: 50px;
  z-index: 10;
}
.instructions {
  max-width: 45ch;
  margin-bottom: 16px;
  opacity: 0.9;
  font-size: 25px;
}

/* Two cards like figma */
.cards-container {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 16px;
  align-items:center;
  margin-top: 4px;
}

.pair-nav {
  display: flex;
  gap: 365px;
  margin-top: 20px;
}
.btn {
  min-width: 140px;         /* wider */
  padding: 12px 28px;       /* taller + wider */
  font-size: 18px;          /* bigger text */
  font-weight: 700;
  letter-spacing: 0.3px;
  border-radius: 16px;      /* chunkier pill */
  border: 1px solid rgba(0,0,0,0.08);
  background: #fff;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
}
.btn:hover{ transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,.15); }
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Right rail just reserves space; visuals are inside ProgressTracker */
/* Make the whole rail wider + stronger text */
/* Make rail a vertical flex and center everything horizontally */
.rail {
  --track-w: 50px;                 /* keep your track width in one place */
  display: flex;
  flex-direction: column;
  align-items: center;             /* <— centers numbers + track */
  width: calc(var(--track-w) + 24px);
  gap: 8px;
}

/* Labels line up to the same width as the track */
.numbers {
  width: var(--track-w);           /* <— same width as .track */
  text-align: center;              /* <— centers the text */
  margin: 0;
  line-height: 1;
  font-weight: 800;
  font-size: 20px;
  color: #0f2b46;
  font-variant-numeric: tabular-nums;  /* keeps “01” aligned neatly */
}
.numbers.top    { margin-bottom: 6px; }
.numbers.bottom { margin-top: 6px; }

/* Keep the track dimensions using the variable */
.track {
  width: var(--track-w);
  height: min(60vh, 520px);
  background: rgba(0,0,0,0.15);
  border-radius: 999px;
  position: relative;
  overflow: hidden;
}

/* Fill stays the same */
.fill {
  background: #FD9B2D;
  position: absolute;
  bottom: 0; left: 0; width: 100%;
  box-shadow: inset 0 0 7.6px rgba(0,0,0,0.15);
}

/* Larger thumb (the circle) */
.thumb {
  width: 32px;              /* was ~26px */
  height: 32px;
  box-shadow: 0 6px 14px rgba(0,0,0,0.18);  /* stronger shadow */
  border: 2px solid rgba(255,255,255,0.9);  /* crisp edge on light bg */
}

.right-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;  /* anchors to top instead of stretching */
  margin-top: -25px;            /* nudge upwards */
}

/* Responsive stack */
@media (max-width: 980px) {
  .lsm-layout {
    grid-template-columns: 1fr; /* stack columns */
  }
  .right-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;  /* anchors to top instead of stretching */
  margin-top: -70px;            /* nudge upwards */
}
  .left-hero {
    order: 1;
  }
  .center-panel {
    order: 2;
  }
}
</style>

<!-- Keep your existing Swiper overrides (non-breaking even if Swiper not used here) -->
<style>
:deep(.my-swiper) {
  --swiper-navigation-color: #000;
}
:deep(.swiper-button-prev:hover),
:deep(.swiper-button-next:hover) {
  --swiper-navigation-color: #FD9B2D;
}

/* --- Congrats modal --- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 43, 70, 0.45);
  display: grid;
  place-items: center;
  z-index: 999; /* above everything */
}

.modal-card {
  width: min(520px, 92vw);
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  text-align: center;
}

.modal-card h2 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #0f2b46;
}

.modal-card p {
  margin: 0 0 18px;
  font-size: 18px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.congrats-video {
  width: 80%;           /* or any percentage */
  max-width: 300px;     /* cap size */
  max-height: 200px;
  border-radius: 12px;
  display: block;
  margin: 0 auto 1rem;  /* centers it inside modal */
  object-fit: contain;  /* keeps full video visible */
}

/* Reuse your .btn look; add emphasis variants */
.btn.primary {
  background: #FD9B2D;
  color: #0f2b46;
  border: none;
}
.btn.secondary {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.1);
}
</style>
