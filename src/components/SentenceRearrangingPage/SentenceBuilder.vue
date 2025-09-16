<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEraser } from '@fortawesome/free-solid-svg-icons'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'


/* -------------------- Props -------------------- */
/** 
 * correctWords：正确顺序（决定槽位数量；也可用于判定）
 * correctWords: the correct sequence (determines number of slots; also used for validation)
 * 
 * shuffledWords：打乱后的词（初始放入词池）
 * shuffledWords: shuffled words (initially placed in the pool)
 */
const props = defineProps({
  correctWords: { type: Array, default: () => [] },
  shuffledWords: { type: Array, default: () => [] },
})

/* -------------------- State -------------------- */
// 词池：用传入的打乱数组初始化（拷贝，避免直接改 prop）
// Pool: initialized with the shuffled array (copied to avoid mutating the prop)
const pool = ref([...(props.shuffledWords || [])])

// 槽位：长度 = 正确答案长度（若未传，则用池子的长度兜底）
// Slots: length = correct answer length (fallback to pool length if not provided)
const slots = ref(Array(props.correctWords?.length || pool.value.length).fill(null))

// 槽位判定状态：true/false/null（null = 未判定）
// Slot status: true / false / null (null = not checked yet)
const slotStatus = ref(Array(slots.value.length).fill(null))

/* -------------------- Actions -------------------- */
// 点击池子里的词 → 填入第一个空槽
// Click on a word in the pool → fill it into the first empty slot
const fillSlot = (word, index) => {
  const emptyIndex = slots.value.findIndex(s => s === null)
  if (emptyIndex !== -1) {
    slots.value[emptyIndex] = word
    pool.value.splice(index, 1) // remove word from pool
  }
}

// 点击槽位里的词 → 退回池子，并清空该槽位状态
// Click on a word in the slot → return it to the pool and reset the slot status
const returnToPool = (word, index) => {
  if (!word) return
  pool.value.push(word)
  slots.value[index] = null
  slotStatus.value[index] = null
}

// Clear：把所有已放入槽位的词退回池子 + 清空槽位 + 清空判定状态
// Clear: return all words from slots back to the pool + reset slots + reset status
const clearSlots = () => {
  // First, return all filled words back to the pool
  slots.value.forEach(w => { if (w) pool.value.push(w) })
  // Then, reset slots and statuses in one go (avoid repeated fill inside loop)
  slots.value.fill(null)
  slotStatus.value.fill(null)
}

// Done：对每个槽位进行判定（正确：true；错误：false；空：null）
// Done: validate each slot (correct: true; incorrect: false; empty: null)
const checkAnswer = () => {
  slots.value.forEach((w, i) => {
    if (!w) {
      slotStatus.value[i] = null
    } else if (w === props.correctWords[i]) {
      slotStatus.value[i] = true
    } else {
      slotStatus.value[i] = false
    }
  })
}
</script>

<!-- ——————————————————————TEMPLATE—————————————————————————————— -->
<template>
  <div class="button-group">
    <!-- 左边 -->
    <div class="left">
        <button class="btn buttonLevel">🎚️Level: Medium ⌄</button>
    </div>

    <!-- 中间 -->
    <div class="center">
        <button 
            class="btn buttonClear cd" 
            @click="clearSlots"
            :disabled="!slots.some(s => s)" >
            <FontAwesomeIcon :icon="faEraser" style="font-size: 26px; color: #ff6600;" />
            Clear
        </button>
        <button 
            class="btn buttonDone cd"
            @click="checkAnswer"
            :disabled="pool.length > 0">
            <FontAwesomeIcon :icon="faCircleCheck" style="color: green; font-size: 28px;" />
            Done
        </button>
    </div>

    <!-- 右边 -->
    <div class="right">
        <button class="btn buttonNext">Next ▸</button>
    </div>
  </div>
  <div class="wrapper1">
    <!-- 槽位区 -->
    <div class="slots">
      <span
        v-for="(slot, i) in slots"
        :key="'slot-' + i"
        class="slot"
        :class="{
            filled: !!slot,
            correct: slotStatus[i] === true,
            incorrect: slotStatus[i] === false
        }"
        @click="returnToPool(slot, i)"
      >
        {{ slot || '____' }}
      </span>
    </div>

    <!-- 词池区 -->
    <div class="pool">
      <span
        v-for="(word, i) in pool"
        :key="'pool-' + i"
        class="word"
        @click="fillSlot(word, i)"
      >
        {{ word }}
      </span>
    </div>
  </div>
</template>


<!-- ——————————————————————CSS—————————————————————————————— -->
<style scoped>
.wrapper1, .slots, .pool {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none;
}


.wrapper1 {
  display: flex;
  flex-direction: column; /* 主轴纵向，子元素上下排列 */
  align-items: center; 
  gap: 20px; 
  padding: 2% 30px;  
  border-radius: 20px;
  background: #fff5db;
  border: 2px solid #e4e4e4;
}

.button-group {
  display: flex;
  justify-content: space-between; /* 左中右分布 */
  align-items: center;
  gap: 10px;
  margin: 15px 0;
}
.center {
  display: flex;
  gap: 15px; /* Clear 和 Done 中间留点间距 */
}

.btn {
  font-size: 20px;
  padding: 10px 12px;
  border: 1px solid #979797;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.2); /* 外部阴影 */
  border-radius: 10px;
  cursor: pointer;
  background-color: #ffffff; /* 按钮背景色 */
}
.buttonClear {
  background-color: #fdc49c;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.buttonClear:hover {
  background-color: #fcae76;   /* Hover：深一点橙色 */
}
.buttonClear:active {
  background-color: #f58b3d;   /* Active：更深橙色 */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2); /* 内阴影模拟按下 */
}

.buttonDone {
  background-color: #a9fcc5;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.buttonDone:hover {
  background-color: #7ef5a7;   /* Hover：深一点绿色 */
}
.buttonDone:active {
  background-color: #4cd984;   /* Active：更深绿色 */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}
.cd:disabled {
  border: 1px solid #898989;
  background-color: #cbcaca; /* 按钮背景色 */
  cursor: not-allowed; /* 鼠标样式不可点击 */
}

.slots, .pool {
  margin: 10px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap; /* 允许换行 */
}

.slot, .word {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 22px;
}

.slot {
  background: #efeeee;
  color: #6c6c6c;
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.19); /* 内部阴影，制造凹陷效果 */
}

.slot.filled {
  color: #000000;
  background: #fff;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.2); /* 外部阴影 */
}

.slot.correct   { border-color:#27ae60; font-weight:700; }

.slot.incorrect { border-color:#e74c3c; font-weight:700; }

.word {
  background: #fff;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.19); /* 外部阴影，制造凹陷效果 */
}

</style>