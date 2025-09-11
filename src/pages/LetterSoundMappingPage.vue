<template>
  <div class="lsm-page">
    <component
      :is="activeComp"
      @request-next-level="goLevel2"
      @request-prev-level="goLevel1"
      @request-start-learning="goStartLeanrningPage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LevelOne from '@/components/LetterSoundMappingPage/Level_1.vue'
import LevelTwo from '@/components/LetterSoundMappingPage/Level_2.vue'

/**
 * We keep only ONE route (/letter-sound).
 * Level 2 is not linkable directly; it’s unlocked by an event from Level 1.
 */
const activeLevel = ref('1')
const router = useRouter() 
onMounted(() => {
  if (localStorage.getItem('lsmForceLevel') === '1') {
    activeLevel.value = '1'
    localStorage.setItem('lsmActiveLevel', '1')
    localStorage.removeItem('lsmForceLevel')   // one-time flag
    return
  }
  const saved = localStorage.getItem('lsmActiveLevel')
  if (saved === '2' && localStorage.getItem('lsmLevel1Completed') === 'true') {
    activeLevel.value = '2'
  }
})

const activeComp = computed(() => (activeLevel.value === '2' ? LevelTwo : LevelOne))

function goLevel2 () {
  // guard: only allow if Level 1 told us it's complete
  localStorage.setItem('lsmLevel1Completed', 'true')
  activeLevel.value = '2'
  localStorage.setItem('lsmActiveLevel', '2')
}

function goLevel1 () {
  activeLevel.value = '1'
  localStorage.setItem('lsmActiveLevel', '1')
}

function goStartLeanrningPage (){
  router.push({ name: 'startLearning' })
}

</script>

<style scoped>
.lsm-page{
  min-height:100vh;
  background:  #fff6e9;
}
</style>
