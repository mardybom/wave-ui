<script setup>
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import ButtonCard from '@/components/StartLearningPage/ButtonCard.vue'
import AlphabetMasteryModal from '@/components/StartLearningPage/AlphabetMasteryModal.vue'

const showModal = ref(false)
const showAlphabetModal = () => { showModal.value = true }
const cardsTrack = ref(null)

const scrollCards = (dir) => {
  const el = cardsTrack.value
  if (!el) return
  // Find card width + gap to scroll by exactly one “card”
  const firstCard = el.querySelector('.button-card')
  const cardWidth = firstCard?.offsetWidth ?? 260
  const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap || 16)
  el.scrollBy({ left: dir * (cardWidth + gap), behavior: 'smooth' })
}

</script>


<template>
  <div class="start-learning-page">
    <NavBar />
    <div class="sky" aria-hidden="true">
      <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0,60 C180,120 360,0 540,40 C720,80 900,200 1080,160 C1260,120 1440,40 1440,40 L1440,0 L0,0 Z"
          fill="#CFEFFF"/>
      </svg>
    </div>

    <main class="main-row">
      <!-- LEFT: heading + card grid (docked left) -->
      <section class="left-col">
        <h1 class="lead">
          Ready, set, go! Choose a game and show how amazing you are!
        </h1>

        <div class="cards-carousel">
          <button class="carousel-nav prev" @click="scrollCards(-1)" aria-label="Previous games">‹</button>

          <div class="cards-track" ref="cardsTrack">
            <ButtonCard label="Alphabet mastery core" @click="showAlphabetModal" />
            <ButtonCard label="coming soon" />
            <ButtonCard label="coming soon" />
            <ButtonCard label="coming soon" />
            <ButtonCard label="coming soon" />
            <ButtonCard label="coming soon" />
            <ButtonCard label="coming soon" />
          </div>

          <button class="carousel-nav next" @click="scrollCards(1)" aria-label="Next games">›</button>
        </div>
      </section>

      <!-- RIGHT: mascot -->
      <img src="@/assets/squirrel_1.png" alt="Squirrel mascot" class="mascot" />

      <!-- Modal -->
      <AlphabetMasteryModal v-if="showModal" @close="showModal=false" />
    </main>
  </div>
</template>



<style scoped>

/* top sky wave */
.sky{
  position: absolute;
  left: 0; right: 0;
  top: var(--nav-h);            
  height: 200px;
  pointer-events: none;
  z-index: 0
}
.wave{ width:250%; height:350%; display:block; }

.start-learning-page {
  background: var(--bg-cream);   /* same as Home */
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;              /* match Home hero to hide the wave overflow */
  padding-top: 24px;
  min-height: 100vh;
}

.main-row {
  position: relative;        
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;   /* left content & right mascot */
  gap: 3rem;
  padding: 2rem clamp(1rem, 4vw, 4rem);
}

.left-col {
  flex: 1 1 58ch;                   /* grow, but keep a nice readable width */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lead {
  margin: 0;
  font-size: clamp(1.25rem, 2.5vw, 2rem);
  font-family: 'OpenDyslexic', Arial, sans-serif;
  text-align: left;                  /* left-aligned per your request */
}

.cards-carousel{
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 1075px;             /* tune if you want a wider row */
}

.cards-track{
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: 6px 2px 10px;      
  white-space: wrap;         
}

.cards-track .button-card{
  flex: 0 0 auto;               /* do not shrink */
  scroll-snap-align: start;
}

.mascot {
  flex: 0 0 auto;
  max-width: 320px;
  width: clamp(180px, 24vw, 320px);
  height: auto;
}

/* Stack on small screens */
@media (max-width: 900px) {
  .main-row {
    flex-direction: column;
    align-items: center;
  }
  .left-col {
    width: 100%;
  }
  .lead {
    text-align: center;
  }
  .cards-grid {
    justify-items: center; /* center cards when stacked */
  }
}


</style>