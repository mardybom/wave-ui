<script setup>
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import ButtonCard from '@/components/StartLearningPage/ButtonCard.vue'


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
    <div class="sky" aria-hidden="true">
     <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0,100 
            C180,180 360,20 540,100 
            C720,180 900,20 1080,100 
            C1260,180 1440,20 1440,100 
            L1440,0 L0,0 Z"
          fill="#CFEFFF"/>
      </svg>

    </div>
    <NavBar />

    <main class="main-row">
      <!-- LEFT: heading + card grid (docked left) -->
      <section class="left-col">
        <h1 class="lead">
          Ready, set, go! Choose a game and show how amazing you are!
        </h1>

        <div class="cards-carousel">

          <div class="cards-track" ref="cardsTrack">
            <ButtonCard label="Letter sound mapping" to="/letter-sound" />
            <ButtonCard label="Digital Writing" to="/Digital-writing"/>
            <ButtonCard label="Sentence Rearranging" to="/sentence-rearranging" />
            <ButtonCard label="coming soon" />
            <ButtonCard label="coming soon" />
            <ButtonCard label="coming soon" />
          </div>
        </div>
      </section>

      <!-- RIGHT: mascot -->
      <img src="@/assets/squirrel_1.png" alt="Squirrel mascot" class="mascot" />
    </main>
  </div>
</template>



<style scoped>

/* top sky wave */
.sky{
  position: absolute;
  top: var(--nav-h);
  left: 0; right: 0;
  height: 300px;                /* adjust if you want a taller arc */
  overflow: hidden;             /* <-- important (prevents overflow) */
  z-index: 0;
  pointer-events: none;
}
.wave{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);  /* centers the wide SVG */
  width: 150%;                   /* restore the width you had */
  height: 100%;
  display: block;
}

.start-learning-page {
  position: relative;
  background: var(--bg-cream);   /* same as Home */
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 70vh;
  align-items: center;
}

.main-row {
  position: relative;        
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;  
  padding: 2rem clamp(8rem, 4vw, 4rem);
}

.left-col {
  flex: 1 1 58ch;                   /* grow, but keep a nice readable width */
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lead {
  margin: 0;
  padding: 40px 2px 0px;
  font-size: clamp(1.25rem, 2.5vw, 2rem);
  font-family: 'OpenDyslexic', Arial, sans-serif;
  text-align: left;                  /* left-aligned per your request */
}

.cards-carousel{
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 1075px; 
  width: min(100%, 1075px);            
}

.cards-track{
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  max-width: 95%;
  -webkit-overflow-scrolling: touch;
  padding: 30px 2px 10px;      
  white-space: normal;  
  box-sizing: border-box;       
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