<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// 26 个字母
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// 当前索引 & 是否已显示字母
const idx = ref(Math.floor(Math.random() * letters.length))
const revealed = ref(false)
// 当前字母（大写）
const currentLetter = computed(() => letters[idx.value])

// 👉 声明要对外抛出的事件
const emit = defineEmits(['reveal'])  // reveal = 把当前字母抛给父组件

// 播放音频
const playSound = () => {
  const ch = currentLetter.value.toLowerCase()   // 文件是小写名
  const url = `/audio/letters/${ch}.mp3`        
  const audio = new Audio(url)
  audio.play()
}

// 👁️ 切换是否展示字母
const toggleReveal = () => { revealed.value = !revealed.value }

// ➡️ 随机下一张（尽量不与当前相同）
const nextCard = () => {
  revealed.value = false
  if (letters.length <= 1) return
  let next
  do { next = Math.floor(Math.random() * letters.length) } while (next === idx.value)
  idx.value = next
}

// 挂载时给父组件一个初始字母
onMounted(() => {
  emit('reveal', currentLetter.value)
})

// 监听索引变化（切换后自动抛出）
watch(idx, () => {
  emit('reveal', currentLetter.value)
})
</script>


<template>
  <div class="wrapper">
    <!-- 1) 播放 -->
    <button class="play  aa" @click="playSound">Play</button>

        <!-- 3) 下一张 -->
    <button class="nextCard  aa" @click="nextCard">Next</button>

    <!-- 2) 显示/隐藏字母（按钮文案随状态变化） -->
    <button class="showLetter  aa" @click="toggleReveal">
      {{ revealed ? currentLetter : 'Show Letter' }}
    </button>

    <!-- 你要不要把当前字母大字显示出来也行 -->
    <div v-if="revealed" class="letter-big">{{ currentLetter }}</div>
  </div>
</template>


<style scoped>
.wrapper {
  margin: 10px 0px;
  display: flex;      /* 横向排列子元素 */
}

.aa {
  padding: 6px 12px;
  background: #f7f7f7;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'OpenDyslexic', Arial, sans-serif; 
  margin-right: 10px;   
}

.aa:hover{
color: #FD9B2D;
}

.showLetter {
  margin-left: auto;  /* 把 showLetter 推到最右 */
}

</style>