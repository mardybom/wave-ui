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