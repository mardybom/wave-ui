<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import GameTopBar from '@/components/GameTopBar.vue'
import WaveHeader from '@/components/WaveHeader.vue'
import GameTitleNDescribe from '@/components/GameTitleNDescribe.vue'
import ImageChoiceCard from '@/components/PictureWordMatchingPage/ImageChoiceCard.vue'
import elleImage from '@/assets/hibby_1.png'
import successVideoSrc from '@/assets/hibby_success.mp4'

const API = import.meta.env.VITE_API_IMAGE_LABELING

const pic = ref(null)
const options = ref([])
const showSuccessModal = ref(false)

let modalTimer = null
const CONFETTI_DELAY_MS = 1500

function guessMimeFromBase64(b64) {
  if (!b64) return 'image/png'
  if (b64.startsWith('/9j/')) return 'image/jpeg'
  if (b64.startsWith('iVBORw0KGgo')) return 'image/png'
  if (b64.startsWith('R0lGOD')) return 'image/gif'
  return 'image/png'
}

async function fetchQuestion() {
  try {
    showSuccessModal.value = false
    clearTimeout(modalTimer)

    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const data = json?.data ?? {}

    const mime = guessMimeFromBase64(data.image_base64)
    pic.value = `data:${mime};base64,${data.image_base64}`

    const label = data.image_label
    options.value = (data.options || []).map(text => ({
      text,
      isCorrect: text === label,
    }))
  } catch {
    options.value = []
    pic.value = null
  }
}

function handleAnswered(isCorrect) {
  if (isCorrect) {
    clearTimeout(modalTimer)
    modalTimer = setTimeout(() => {
      showSuccessModal.value = true
    }, CONFETTI_DELAY_MS)
  } else {
    showSuccessModal.value = false
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  goNext()
}

async function goNext() {
  showSuccessModal.value = false
  await fetchQuestion()
}

onMounted(() => {
  fetchQuestion()
})

onBeforeUnmount(() => {
  clearTimeout(modalTimer)
})
</script>

<template>
  <div class="page-container">
    <GameTopBar title="ImageLabellingPage" />
    <WaveHeader top="80px" height="200px" zIndex="0"/>
    <GameTitleNDescribe 
      title="Picture Word Matching" 
      description="Look at the picture and choose the correct spelling from the options!" 
    />

    <div class="bossWrapper">
      <div class="imageWrapper">
        <img class="mascotImg" :src="elleImage" alt="Choice Image" />
      </div>
      <div class="coreCompWrapper">
        <ImageChoiceCard 
          v-if="pic && options.length"
          :image="pic"
          :options="options"
          @answered="handleAnswered"
        />
        <p v-else>Loading…</p>
      </div>
    </div>

    <div v-if="showSuccessModal" class="modal-backdrop" @click.self="closeSuccessModal">
      <div class="modal-card" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="Close" @click="closeSuccessModal">×</button>
        <video
          class="success-video"
          :src="successVideoSrc"
          autoplay
          muted
          playsinline
          loop
        ></video>
        <div class="modal-text">great job!! you got it right.. lets go next!.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 50vh;
  width: 100vw;
  position: relative;
}

.bossWrapper {
  width: 80vw;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4vh;
}

.imageWrapper { width: 30vw; }

.mascotImg {
  width: 130%;
  height: auto;
  transform: scaleX(-1);
  transform: translateX(-200px) translateY(-30px);
  display: block;
}

.coreCompWrapper {
  width: 100vw;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  padding: clamp(10px, 3%, 30px);
  border-radius: 20px;
  background: #ffecf6;
  box-shadow: 2px 2px 20px rgba(120, 48, 77, 0.2);
  transform: translateX(-120px);
}

.modal-backdrop{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: grid;
  place-items: center;
  z-index: 9999;
}
.modal-card{
  position: relative;
  width: min(640px, 92vw);
  max-width: 92vw;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
  padding: 18px 18px 22px;
  text-align: center;
}
.success-video{
  width: 80%;
  height: auto;
  display: block;
  border-radius: 14px;
  align-items: center;
  transform: translateX(60px);
}
.modal-text{
  margin-top: 12px;
  font-weight: 700;
  font-size: clamp(16px, 2.2vw, 22px);
}
.modal-close{
  position: absolute;
  top: 8px;
  right: 10px;
  border: none;
  background: transparent;
  width: 36px;
  height: 36px;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
.modal-close:hover{ opacity: .75; }
</style>
