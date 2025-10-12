<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showWarning = ref(false)
const isSpeaking = ref(false)


function checkWidth() {
  showWarning.value = window.innerWidth < 1300
}

onMounted(() => {
  checkWidth()
  window.addEventListener('resize', checkWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkWidth)
})

function speakText() {
  if (isSpeaking.value) return;

  const text = `Your screen is too small to play comfortably. Please try a bigger screen or zoom out the page.`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-AU';
  utterance.rate = 0.5;

  utterance.onstart = () => { isSpeaking.value = true; };
  utterance.onend   = () => { isSpeaking.value = false; };
  utterance.onerror = () => { isSpeaking.value = false; };

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
</script>


<template>
  <div v-if="showWarning" class="screen-warning">
    <div class="warning-box">
      <p>Your screen is too small to play comfortably.</p>
      <p>Please try a bigger screen or zoom out the page!</p>

      <div class="button-group">
        <button @click="speakText">🔈I don't understand</button>
        <button @click="showWarning = false">OK</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.screen-warning{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 10000;

  display: grid;
  place-items: center;

  height: 100dvh;
  width: 100vw;

  padding:
    env(safe-area-inset-top)
    env(safe-area-inset-right)
    env(safe-area-inset-bottom)
    env(safe-area-inset-left);
}

.warning-box{
  position: relative;
  background: #fff;
  color: #000;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,.2);
  text-align: center;
  line-height: 1.5;

  max-width: min(90vw, 340px);
  width: max-content;
  padding: 24px 32px;
}

.warning-box button{
  margin-top: 12px;
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  background: #0d9c2a;
  color: #fff;
  cursor: pointer;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

</style>