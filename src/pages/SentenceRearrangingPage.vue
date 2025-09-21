<script setup>
import { ref, onMounted } from 'vue'
import GameTopBar from '@/components/GameTopBar.vue'
import SentenceBuilder from '@/components/SentenceRearrangingPage/SentenceBuilder.vue'
import WaveHeader from '@/components/WaveHeader.vue'
import GameTitleNDescribe from '@/components/GameTitleNDescribe.vue'

const correctWords = ref([])
const shuffledWords = ref([])
const loading = ref(true)
const errorMsg = ref('')
const currentLevel = ref('Easy')

function onStarted() {
  /* timer removed—no-op is fine */
}

const API = `${import.meta.env.VITE_API_SENTENCE}/sentence/next`

async function fetchSentence(level = currentLevel.value) {
  try {
    loading.value = true
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    correctWords.value  = data.data.original_sentence
    shuffledWords.value = data.data.jumbled_sentence
    currentLevel.value  = level
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Failed to load sentence.'
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchSentence('Easy'))
</script>

<template>
  <div class="page-container">
    <GameTopBar title="Sentence Rearranging" />
    <WaveHeader top="80px" height="200px" zIndex="0" />
    <GameTitleNDescribe
      title="Sentence Rearranging"
      description="Rearrange the words to build the correct sentence!"
    />

    <!-- NEW: elephant on the left, game on the right -->
    <div class="wrapperBoss">
      <div class="wrapperForImage">
        <img src="@/assets/Elle_1.png" alt="helper" />
      </div>

      <div class="wrapperForSentenceBuilder">
        <p v-if="loading">Loading...</p>
        <p v-else-if="errorMsg">{{ errorMsg }}</p>
        <SentenceBuilder
          v-else
          v-model:level="currentLevel"
          :correctWords="correctWords"
          :shuffledWords="shuffledWords"
          @started="onStarted"
          @changeLevel="fetchSentence"
          @next="() => fetchSentence(currentLevel.value)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100vw;
  position: relative;
}

/* Grid: elephant (left) | game (right) */
.wrapperBoss {
  display: grid;
  grid-template-columns: 26% 1fr;
  align-items: center;
  gap: 10px;
  width: 100vw;
  margin-top: 50px;
  padding: 0 2px;
}

.wrapperForImage {
  min-width: 400px;
  justify-self: left;
}
.wrapperForImage img {
  display: block;
  height: auto;
  width: 100%;
  max-width: 500px;
  object-fit: contain;
  margin-top: 0;          /* remove previous negative offset */
}

.wrapperForSentenceBuilder {
  min-width: 300px;
  width: 100%;
  transform: translateX(-100px);
}

/* Stack on narrow screens */
@media (max-width: 820px) {
  .wrapperBoss {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .wrapperForImage {
    order: -1;            /* keep elephant on top on mobile */
  }
}
</style>
