<script setup>
import NavBar from '@/components/NavBar.vue'

import startPart from '@/components/StartLearningPage/StartPart.vue'
import ButtonCard from '@/components/StartLearningPage/ButtonCard.vue'
import EpicButton from '@/components/StartLearningPage/EpicButton.vue'

    import { ref } from 'vue'
    import AlphabetMasteryModal from '@/components/StartLearningPage/AlphabetMasteryModal.vue'
    const showModal = ref(false)
    const showAlphabetModal = () => { showModal.value = true }
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
    <!-- 页面内容 -->
    <startPart />
    <EpicButton label="Alphabet mastery core" @click="showAlphabetModal" />
    <AlphabetMasteryModal v-if="showModal" @close="showModal = false" />
    <!-- <ButtonCard />
    <ButtonCard label="Parents Hub" to="/parents" /> -->
  </div>
</template>

<style scoped>
.start-learning-page {
  background-color: #CDFFE0; 
  min-height: 100vh;        
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}


</style>