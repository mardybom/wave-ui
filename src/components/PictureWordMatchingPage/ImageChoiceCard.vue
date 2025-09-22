<script setup>
import { ref, watch } from 'vue'       // 引入 Vue 的响应式工具和监听器 / Import Vue's reactivity tools and watcher
import confetti from 'canvas-confetti' // 引入彩花库 / Import the confetti animation library


/* -------------------- Props -------------------- */
/**
 * 父组件传入的参数 / Props passed from parent component
 * - image: 当前题目的图片 (base64 或 URL)
 *          The question image (base64 or URL)
 * - options: 四个选项数组，每个元素形如 { text, isCorrect }
 *            Four answer options, each as { text, isCorrect }
 */
const props = defineProps({
  image: { type: String, required: true },
  options: {
    type: Array,
    required: true,
    validator: (val) => val.length === 4 // 必须有4个选项 / Must contain 4 options
  }
})


// 当前用户点击的选项索引 / Index of the option selected by the user
const selectedIndex = ref(null)

// 是否已经答过题（防止重复点击） / Whether the question has been answered (prevent multiple clicks)
const answered = ref(false)

// 子组件向父组件发事件，用 'answered' 通知答题结果
// Emit event to parent, 'answered' tells if answer is correct
const emit = defineEmits(['answered'])


/* -------------------- Watchers -------------------- */
/**
 * 监听 props.image 或 props.options 的变化 → 重置内部状态
 * Watch for changes in props.image or props.options → reset state
 * - 当新题目载入时，清空 selectedIndex 和 answered
 * - When a new question is loaded, reset selectedIndex and answered
 */
watch(
  [() => props.image, () => props.options],
  () => {
    selectedIndex.value = null
    answered.value = false
  },
  { flush: 'post' } // 等 DOM/props 更新后再执行 / Run after DOM/props update for stability
)


/* -------------------- Methods -------------------- */
/**
 * fireConfettiFrom(el)
 * 从指定按钮位置触发喷射彩花
 * Trigger a confetti animation from the clicked button position
 *
 * @param {HTMLElement} el - 点击的按钮元素 / The button element clicked
 */
function fireConfettiFrom(el) {
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = (rect.left + rect.width / 2) / window.innerWidth
  const y = (rect.top  + rect.height / 2) / window.innerHeight

  confetti({
    particleCount: 50,  // 粒子数量 / Number of particles
    spread: 120,        // 扩散角度 / Spread angle
    startVelocity: 40,  // 初始速度 / Initial velocity
    gravity: 1,         // 重力影响 / Gravity
    origin: { x, y },   // 位置    / Position relative to screen
    ticks: 200,         // 持续帧数 / Frames to run
    scalar: 0.9,        // 缩放大小 / Particle scale
  })
}


/**
 * selectOption(index, e)
 * 用户点击选项时触发
 * Triggered when user selects an option
 *
 * @param {number} index - 选项的索引 / Index of the selected option
 * @param {Event} e - 点击事件对象，用于获取按钮元素 / The click event (to locate button element)
 */
function selectOption(index, e) {
  if (answered.value) return   // 已答过 → 忽略 / Already answered → ignore

  selectedIndex.value = index
  const isCorrect = !!props.options[index]?.isCorrect

  if (isCorrect) {
    fireConfettiFrom(e.currentTarget) // 正确 → 撒花 / Correct → launch confetti
    answered.value = true             // 锁定状态，防止重复点击 / Lock state to prevent multiple clicks
  }

  emit('answered', isCorrect) // 通知父组件答题结果 / Emit result to parent
}
</script>


<template>
  <div class="card-container">
    <!-- 图片部分 -->
    <div class="image-box">
      <img :src="image" alt="Choice Image" />
    </div>

    <!-- 选项按钮 -->
    <div class="option-box">
      <button
        v-for="(opt, index) in options"
        :key="index"
        @click="selectOption(index, $event)"   
        :class="[
          selectedIndex === index && opt.isCorrect ? 'correct' : '',
          selectedIndex === index && !opt.isCorrect ? 'wrong' : '',
          selectedIndex === index && !opt.isCorrect ? 'animate__animated animate__shakeX' : '',
        ]"
      >
        {{ opt.text }}
      </button>
    </div>
  </div>
</template>


<style scoped>
/* 外层容器：纵向排列，水平+垂直居中 */
.card-container {
  display: flex;
  width: 100%;
  align-items: center;      /* 水平居中 */
  justify-content: center;  /* 垂直居中 */
  gap: 5%;
}

/* 图片容器：宽度是父容器的 60%，并且保持正方形 */
.image-box {
  width: 50%;
  aspect-ratio: 1 / 1;      /* 高度 = 宽度 */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border: 1px solid #ccc;   /* For Testing */
}

/* 图片：铺满容器，保持比例 */
.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 选项区域：简单占位，可替换成 button 或文字 */
.option-box {
  width: 45%;              /* 和图片各占一半 */
  display: flex;
  flex-direction: column;  /* 纵向排列 */
  gap: 10px;               /* 按钮间距 */
}

.option-box button {
  width: 100%;  
  padding: 12px;
  font-size: clamp(14px, 2vw, 20px);  /* 响应式字体大小 */
  font-weight: bold;
  border-radius: 10px;
  border: 2px solid #333;
  cursor: pointer;
  background: #fff;
  transition: background 0.3s;
}

.option-box button:hover {
  background: #f0f0f0;
}

.option-box button:active {
  background-color: #c2c2c2;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.option-box button {
  --btn-border: #333;
  border: 2px solid var(--btn-border);
}
/* 点击反馈 */
.option-box button.correct { --btn-border: #27ae60; background: #c8f7c5; }
.option-box button.wrong   { --btn-border: #e74c3c; background: #f7c5c5; }

</style>