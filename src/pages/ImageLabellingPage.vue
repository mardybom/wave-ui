<script setup>
import { ref, onMounted } from 'vue'
import GameTopBar from '@/components/GameTopBar.vue'
import WaveHeader from '@/components/WaveHeader.vue'
import GameTitleNDescribe from '@/components/GameTitleNDescribe.vue'
import ImageChoiceCard from '@/components/PictureWordMatchingPage/ImageChoiceCard.vue'
import elleImage from '@/assets/Elle_1.png' 

// 后端接口：从环境变量读取（.env* 中以 VITE_ 开头才会被暴露）
// Backend endpoint from env (must start with VITE_ in .env*)
const API = import.meta.env.VITE_API_IMAGE_LABELING

// 来自后端的图片（转成可直接作为 <img src> 使用的 data URL）
// Image from backend, converted to data URL for <img src>
const pic = ref(null)

// 选项列表：形如 [{ text:string, isCorrect:boolean }, ...]
// Options for choices
const options = ref([])

// 是否允许点击 Next（答对后才解锁）
// Whether the Next button is enabled (unlocked only after correct answer)
const canNext = ref(false)

/**
 * 猜测 base64 图片的 MIME 类型（便于组成 data URL）
 *
 * Guess MIME type from base64 prefix (to build a data URL).
 */
function guessMimeFromBase64(b64) {
  if (!b64) return 'image/png'
  if (b64.startsWith('/9j/')) return 'image/jpeg'       // JPEG
  if (b64.startsWith('iVBORw0KGgo')) return 'image/png' // PNG
  if (b64.startsWith('R0lGOD')) return 'image/gif'      // GIF
  return 'image/png'
}

/**
 * 向后端请求一题图片标注数据，并转换为前端所需结构：
 * 1) 将返回的 base64 图片转为 data URL 赋值给 pic；
 * 2) 将 options 数组与 image_label 比对，打上 isCorrect 标记；
 * 3) 在请求开始时关闭 Next；成功后等待用户作答来解锁。
 *
 * Fetch one image-labeling question and normalize it for the UI:
 * 1) Convert returned base64 image into a data URL and set `pic`;
 * 2) Map `options` against `image_label` to add `isCorrect` flags;
 * 3) Disable Next at the start; re-enable after the user answers correctly.
 */
async function fetchQuestion() {
  try {
    canNext.value = false // 拿新题前锁住 Next
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // 目前接口不需要参数
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const data = json?.data ?? {}

    // base64 -> data URL
    const mime = guessMimeFromBase64(data.image_base64) // 🆕
    pic.value = `data:${mime};base64,${data.image_base64}` // 🆕

    const label = data.image_label
    options.value = (data.options || []).map(text => ({
      text,
      isCorrect: text === label,
    }))
  } catch (err) {
    console.error('Failed to fetch image labeling question:', err) // 🆕
    options.value = []
    pic.value = null
  }
}

/**
 * 接收子组件的作答结果回调：当 isCorrect 为 true 时，解锁 Next。
 *
 * Handle child component's answer callback. When `isCorrect` is true,
 * enable the Next button so the user can fetch a new question.
 */
function handleAnswered(isCorrect) {       // 🆕
  canNext.value = !!isCorrect
}

/**
 * 点击 Next：直接再次请求后端获取下一题。
 *
 * On Next click: fetch another question from the backend.
 */
async function goNext() {                  // 🆕 简化为再次请求
  await fetchQuestion()
}

// 页面挂载完成后拉取第一题
// Fetch the first question on mount
onMounted(() => {
  fetchQuestion()
})
</script>


<!-- ——————————————————————TEMPLATE—————————————————————————————— -->
<template>
  <div class="page-container">
    <GameTopBar title="ImageLabellingPage" />

    <WaveHeader top="80px" height="200px" zIndex="0"/>

    <GameTitleNDescribe 
      title="Picture Word Matching" 
      description="Look at the picture and choose the correct word from the options!" 
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
    

    <div class="nextBTNWrapper">
        <div class="nextBTNWrapperRight">
            <button class="next-btn" :disabled="!canNext" @click="goNext">Next</button>
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

.bossWrapper {
  width: 80vw;
  margin: 0 auto;
  display: flex;
  align-items: center;      /* 水平居中 */
  justify-content: center;  /* 垂直居中 */
  margin-top: 10vh;
}

.imageWrapper {
  width: 30vw; 
}

.mascotImg {
  width: 100%;           /* 图片宽度撑满容器 */
  height: auto;          /* 高度自动 → 保持等比缩放 */
  transform: scaleX(-1); /* 水平镜像翻转 */
  display: block;        /* 避免出现底部空隙 */
}

.coreCompWrapper {
  width: 60vw;              /* 宽度占屏幕宽度的 60% */
  margin: 0 auto;           /* 左右外边距自动 → 让整个容器居中 */
  display: flex;            /* 使用 flex 布局 */
  justify-content: center;  /* 子元素在主轴（水平方向）居中 */

  padding: clamp(10px, 3%, 30px);   /* 内边距，最小 10px，最大 30px，根据屏幕自适应 */
  border-radius: 20px;              /* 圆角 20px */
  background: #ffecf6;              /* 背景颜色：浅粉色 */
  box-shadow: 2px 2px 20px rgba(120, 48, 77, 0.2); /* 投影：轻微模糊的阴影 */
}

.nextBTNWrapper {
  width: 60vw;       /* 宽度占屏幕的 60% */
  margin: 0 auto;    /* 居中容器本身 */
  display: flex;
  justify-content: flex-end; /* 子元素靠右 */
}

.nextBTNWrapperRight {
  width: 50%;
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.next-btn {
  width: 40%;  
  padding: 12px;
  font-size: clamp(14px, 2vw, 20px);  /* 响应式字体大小 */
  font-weight: bold;
  border-radius: 10px;
  border: 2px solid #333;
  cursor: pointer;
  background: #fff;
  transition: background 0.3s;
}

.next-btn:hover {
  background: #f0f0f0;
}

.next-btn:active {
  background-color: #c2c2c2;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 🚫 新增禁用状态 */
.next-btn:disabled {
  border: 1px solid #898989;    /* 灰色边框 */
  background-color: #cbcaca;    /* 灰色背景 */
  color: #666;                  /* 文本颜色变浅 */
  cursor: not-allowed;          /* 禁止光标 */
  box-shadow: none;             /* 去掉阴影 */
}
</style>