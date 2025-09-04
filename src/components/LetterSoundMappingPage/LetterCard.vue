<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import playButton from '@/assets/playSoundButton.png'


const props = defineProps({
  char: String,   // 传入字母
  index: Number,  // 当前第几个字母
})
// 不再往外 emit 播放事件（如果还想保留也可以同时 emit）
defineEmits(['play'])

const audio = ref(new Audio())

// 根据传入字母，指向 public 下的 mp3：/audio/letters/a.mp3 ...
watch(
  () => props.char,
  (ch) => {
    if (!ch) return
    audio.value.src = `/audio/letters/${ch.toLowerCase()}.mp3`
    audio.value.preload = 'auto'
  },
  { immediate: true }
)

const play = () => {
  // 点击触发，符合浏览器的自动播放策略
  try {
    audio.value.currentTime = 0
    audio.value.play()
  } catch (e) {
    console.warn('Play failed:', e)
  }
}

onBeforeUnmount(() => {
  audio.value.pause()
})
</script>


<template>
  <button class="letter-card" type="button" @click="play" :aria-label="`Play letter ${char}`">
    <div class="wrapper">
        <div v-if="index" class="idx">{{ index }}/26</div>
        <div class="letters">
            <div class="upper">{{ char?.toUpperCase() }}</div>
            <div class="lower">{{ char?.toLowerCase() }}</div>
        </div>
        <div class="playButton" @click="playCurrent">
            <img :src="playButton" alt="Play Button" />
        </div>
    </div>
  </button>
</template>


<style scoped>
.letter-card {
  position: relative;
  width: 240px;
  height: 240px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.wrapper {
  display: flex;
  justify-content: center;
}

.letters {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.letter-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.idx {
  position: absolute;
  left: 50%;
  top: 10%;
  transform: translate(-50%, -50%); 
  color: #555;
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: bolder;
}

.upper {
  font-size: 84px;
  font-weight: bold;
}

.lower {
  font-size: 62px;
  margin-top: 20px; /* 往下移 20px */
}

.playButton {
  position: absolute;
  left: 50%;
  bottom: 1%;
  transform: translate(-50%, -50%);
  overflow: hidden;           /* 防止图片超出 */
  cursor: pointer;
}

.playButton img {
  width: 30px;
  max-width: 100%;            /* 不超过容器宽度 */
}

</style>