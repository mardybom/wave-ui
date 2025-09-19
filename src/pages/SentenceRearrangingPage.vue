<script setup>
import { ref, onMounted } from 'vue'
import AlarmIcon from '@/components/Timer.vue'
import GameTopBar from '@/components/GameTopBar.vue'
import SentenceBuilder from '@/components/SentenceRearrangingPage/SentenceBuilder.vue'
import WaveHeader from '@/components/WaveHeader.vue'
import GameTitleNDescribe from'@/components/GameTitleNDescribe.vue'

const timerRef = ref(null)        // ⏱️ 计时器组件的引用 (Reference to Timer component)
const correctWords = ref([])      // 正确的句子（数组形式，用于判断答案）(The correct sentence words)
const shuffledWords = ref([])     // 打乱后的句子（显示给用户选择）(The jumbled sentence words shown to user)
const loading = ref(true)         // 是否正在加载题目 (Indicates if a sentence is being loaded)
const errorMsg = ref('')          // 存储错误提示信息 (Holds error messages when API fetch fails)
const currentLevel = ref('Easy')  // 当前难度等级，默认 Easy (Current difficulty level, defaults to "Easy")


/**
 * onStarted()
 * ---------------------
 * 📝 方法说明 (Method Description):
 * 当用户开始答题时调用，重置计时器并启动。
 * Called when the user starts answering a question.
 * - Resets the timer to 0
 * - Starts counting time
 */
function onStarted() {
  timerRef.value?.reset(0)
  timerRef.value?.start()
}


// API: 后端接口地址，使用环境变量拼接
// The backend API endpoint, read from environment variables
const API = `${import.meta.env.VITE_API_SENTENCE}/sentence/next`

/**
 * fetchSentence(level)
 * ---------------------
 * 📝 方法说明 (Method Description):
 * 从后端获取一个新句子，根据传入的难度等级。
 * Fetches a new sentence from the backend API, based on the given difficulty level.
 *
 * @param {String} level - 题目难度 (Difficulty level, e.g., "Easy", "Medium", "Hard")
 *
 * 流程 Steps:
 * 1. 设置 loading 状态为 true (set loading=true)
 * 2. 发起 POST 请求到 API (make POST request to API)
 * 3. 成功时，更新 correctWords 和 shuffledWords (update state on success)
 * 4. 更新当前难度 currentLevel (set currentLevel)
 * 5. 出错时打印错误并显示提示 (catch error, set errorMsg)
 * 6. 最后无论成功失败都取消 loading (finally set loading=false)
 */
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


// isOpen: 控制 <details> 元素展开或收起的状态
// Whether the <details> element is open (true/false)
onMounted(() => fetchSentence('Easy'))
/**
 * onToggle(e)
 * ---------------------
 * 📝 方法说明 (Method Description):
 * 当用户点击 <details> 展开/收起时更新状态。
 * Updates the `isOpen` state when the <details> element is toggled.
 *
 * @param {Event} e - toggle 事件对象 (toggle event object)
 */
const isOpen = ref(false)
function onToggle(e) {
  isOpen.value = e.target.open
}
</script>


<!-- ——————————————————————TEMPLATE—————————————————————————————— -->
<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <GameTopBar title="Sentence Rearranging" />

    <!-- 头部装饰“天空+波浪” -->
    <WaveHeader top="80px" height="200px" zIndex="0"/>

    <GameTitleNDescribe 
      title="Sentence Rearranging" 
      description="Rearrange the words to build the correct sentence!" 
    />


    <div class="wrapperInstructionAndTimer">
      <div class="l">
       <details class="howto" @toggle="onToggle">
          <summary>
            {{ isOpen ? 'Close' : 'How to play' }}
          </summary>
          <div class="content">
            <p class="instructions">
              Tap a <span class="obj-word">word card</span> to send it into the first empty 
              <span class="obj-word">slot</span>, and tap the <span class="obj-word">slot</span> again to pop it back down. 
              <br/>Tap <img src="@/assets/btn-clear.png" alt="Clear button" class="inline-btn" /> 
              to send all cards back. 
              <br/>Tap <img src="@/assets/btn-done.png" alt="Done button" class="inline-btn" /> 
              to check your answer.
            </p>
          </div>
        </details>
        
        
      </div>

      <div class="wrapperForTimer">
        <AlarmIcon ref="timerRef" />
      </div>
    </div>


    <div class="wrapperBoss">
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
        <div class="wrapperForImage">
            <img src="@/assets/Elle_1.png" alt="helper" />
        </div>
    </div>
  </div>
</template>


<!-- ——————————————————————CSS—————————————————————————————— -->
<style scoped>
.page-container {
  min-height: 100vh;  /* 垂直方向填满屏幕 */
  width: 100vw;       /* 横向撑满屏幕 */
  position: relative; /* 让子元素 absolute 定位基于它 */
}

.howto > summary {
  cursor: pointer;        /* 鼠标悬停时显示手型，表示可点击 */
  padding: 8px 12px;      /* 内边距：上下 8px，左右 12px */
  font-size:20px;
  font-weight: bold;  
  color: #04272d;
}

.howto .content {
  padding: 12px;                 /* 内容区域的内边距为 12px */
  background: #ffecf6;              /* 背景色为白色 */
  border-radius: 20px;
  box-shadow: 2px 2px 20px rgba(120, 48, 77, 0.2); /* 外部阴影 */
}

.wrapperBoss,
.wrapperInstructionAndTimer {
  display: flex;
  flex-direction: row;
  align-items: center;     /* 让子元素在横向(水平方向)居中 */
  justify-content: center; /* 纵向(垂直方向)居中 */
  width: 100vw;       /* 横向撑满屏幕 */
}

.wrapperBoss {
  margin-top: 50px; /* 调整数值即可 */
}

.wrapperForSentenceBuilder,
.l {
  min-width: 300px;
  width: 60%;
}

.wrapperForImage,
.wrapperForTimer{
  width: 20%;        /* 右侧占 20% */
  min-width: 100px;  /* 至少 100px */
}

.l {
  margin: 0px 20px;
}

.wrapperForTimer {
  padding-left: 5%;
}

.instructions {
  font-size: 20px;
}

.wrapperForImage img {
  display: block;
  height: auto;
  object-fit: contain;
  width: 120%;
  margin-top: -20px;
}

.inline-btn {
  height: 32px; /* 按钮图片高度 */
  vertical-align: middle; /* 和文字对齐 */
  margin: 0 4px;
}

.obj-word {
  font-weight: 600;
  color: #2ca621; /* 交互对象 */
}
</style>