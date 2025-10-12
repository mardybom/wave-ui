<script setup>
import NavBar from '@/components/NavBar.vue'
import ButtonCard from '@/components/StartLearningPage/ButtonCard.vue'

import iconLetter from '@/assets/letter_sound_mapping_bg.png'
import iconWriting from '@/assets/digital_writing_bg.png'
import iconSentence from '@/assets/sentence_bg.png'
import iconMatch from '@/assets/picture_word_bg.png'
import iconSoon from '@/assets/letter_sound_mapping_bg.png'
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
      <section class="left-col">
        <h1 class="lead">
          Ready, set, go! Choose a game and show how amazing you are!
        </h1>

        <div class="scroll-x">
          <div class="cards-grid">
            <ButtonCard label="Letter sound mapping" to="/letter-sound" :bg="iconLetter" bg-size="cover" bg-position="center" bg-opacity="0.3" />
            <ButtonCard label="Digital Writing" to="/Digital-writing" :bg="iconWriting" bg-size="cover" bg-position="center" bg-opacity="0.6" />
            <ButtonCard label="Sentence Rearranging" to="/sentence-rearranging" :bg="iconSentence" bg-size="cover" bg-position="center" bg-opacity="0.3" />
            <ButtonCard label="Picture Word Matching" to="/image-labelling" :bg="iconMatch" bg-size="cover" bg-position="center" bg-opacity="0.3" />
            <ButtonCard label="Reading Speed Test" to="/reading-speed" :bg="iconSoon" bg-size="cover" bg-position="center" bg-opacity="0.3" />
          </div>
        </div>
      </section>

      <img src="@/assets/squirrel_1.png" alt="Squirrel mascot" class="mascot" />
    </main>
  </div>
</template>

<style scoped>
.sky{
  position: absolute;
  top: var(--nav-h);
  left: 0; right: 0;
  height: 300px;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}
.wave{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 150%;
  height: 100%;
  display: block;
}
.start-learning-page {
  position: relative;
  background: var(--bg-cream);
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-items: center;
}
.main-row {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem clamp(1rem, 2vw, 2rem);
  gap: 2rem;
  max-height: calc(100vh - var(--nav-h, 80px));
  overflow: hidden;
  margin-top: -10px;
}
.left-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
  padding-left: 5rem;
}
.lead {
   margin: 0 20px;
  padding: 0;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-family: 'OpenDyslexic', Arial, sans-serif;
  text-align: left;
  flex-shrink: 0;
}
.scroll-x{
  width: 70vw;
  margin: 0 auto;
  overflow-x: scroll;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px; 
}

.cards-grid{
  display: inline-flex;
  gap: 16px;
  padding: 10px 2px;
  justify-content: flex-start;
  width: max-content;
}

.mascot {
  flex: 0 0 auto;
  max-width: 455px;
  width: clamp(260px, 39vw, 390px);
  height: auto;
  object-fit: contain;
  margin-left: 0;
}
@media (max-width: 720px) {
  .main-row {
    margin-top: 40px;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
  }
  .left-col {
    width: 100%;
    padding-left: 0;
    flex: 0 0 auto;
  }
  .lead {
    text-align: center;
    font-size: clamp(1rem, 4vw, 1.3rem);
  }
  .scroll-x{
    width: 100vw;
    transform: scale(0.7);
    transform-origin: top center;
    padding-bottom: 20px; 
  }
  .cards-grid {
    gap: 12px;
    justify-content: center;
  }
  .mascot {
    margin-left: 0;
    max-width: 220px;
    width: 150px;
  }
}
</style>
