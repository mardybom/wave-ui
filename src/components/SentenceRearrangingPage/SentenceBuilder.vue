<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEraser } from '@fortawesome/free-solid-svg-icons'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'


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

  level: { type: String, default: 'Easy' }
})


// 定义要对外发的事件
// Define the events that this child component can emit to SentenceRearrangingPage
const emit = defineEmits(['started', 'changeLevel', 'update:level'])


// -------------------- 难度切换 (changeLevel) ⬇️--------------------
// 功能: 当用户在下拉菜单中选择新的难度时，更新父组件的 level 值，
//       并通知父组件去重新获取对应难度的句子。
// ---------------------------------------------------------------
//
// Function: When the user selects a new difficulty level from the dropdown,
//           update the parent's level value,
//           and notify the parent component to fetch a new sentence
//           for the selected level.
//
// 参数 (Parameters):
//   e - 事件对象 (event object from <select> change)
// ---------------------------------------------------------------

// 可用的难度选项
// Available difficulty levels
const levels = ['Easy', 'Medium', 'Hard', 'Extremely hard']

function changeLevel(e) {
  const v = e.target.value
  // 更新父组件的 v-model:level
  // Update parent component's v-model:level
  emit('update:level', v)

  // 通知父组件调用 fetchSentence
  // Notify parent to call fetchSentence
  emit('changeLevel', v)
}
// -------------------- 难度切换 (changeLevel) ⬆️--------------------


// 词池：用传入的打乱数组初始化（拷贝，避免直接改 prop）
// Pool: initialized with the shuffled array (copied to avoid mutating the prop)
const pool = ref([...(props.shuffledWords || [])])

// 槽位：长度 = 正确答案长度（若未传，则用池子的长度兜底）
// Slots: length = correct answer length (fallback to pool length if not provided)
const slots = ref(Array(props.correctWords?.length || pool.value.length).fill(null))

// 槽位判定状态：true/false/null（null = 未判定）
// Slot status: true / false / null (null = not checked yet)
const slotStatus = ref(Array(slots.value.length).fill(null))


// -------------------- fillSlot method ⬇️--------------------
// 功能: 当用户点击“词池”中的一个单词时，将其填入第一个空槽。
//        如果是用户第一次放入单词，还会触发 'started' 事件。
// -------------------------------------------------------
//
// Function: When the user clicks a word from the "pool",
//           put it into the first empty slot.
//           If this is the user's first word placed, emit a 'started' event.
//
// 参数 (Parameters):
//   word  - 被点击的单词 (the clicked word)
//   index - 在词池中的索引位置 (index of the word in the pool)
// -------------------------------------------------------
let hasEmittedStarted = false

const fillSlot = (word, index) => {
  // 找到第一个为空的槽位
  // Find the first empty slot
  const emptyIndex = slots.value.findIndex(s => s === null)

  if (emptyIndex !== -1) {
    // 将点击的单词放入该槽位
    // Put the clicked word into this slot
    slots.value[emptyIndex] = word

    // 从词池中移除该单词
    // Remove the word from the pool
    pool.value.splice(index, 1)

    // 如果这是用户第一次放入单词，则触发 started 事件
    // If this is the first time a word is placed, emit 'started' event
    if (!hasEmittedStarted) {
      hasEmittedStarted = true
      emit('started')
    }
  }
}
// -------------------- fillSlot method ⬆️--------------------


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
         <select class="btn buttonLevel" :value="props.level" @change="changeLevel">
          <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
        </select>
    </div>

    <div class="center">
      <button class="btn buttonNext" @click="emit('next')">Next ▸</button>
    </div>
    <!-- 中间 -->
    <div class="right">
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
  flex-direction: column;
  align-items: center; 
  gap: 20px; 
  padding: 2% 30px;  
  border-radius: 20px;
  background: #ffecf6;
  box-shadow: 2px 2px 20px rgba(120, 48, 77, 0.2);
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
}
.right {
  display: flex;
  gap: 15px;
}

.buttonLevel {
  font-family: 'OpenDyslexic', sans-serif;
  font-size: 20px;
  padding: 10px 12px;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #333;
}

.buttonLevel option {
  font-family: 'OpenDyslexic', sans-serif;
  font-size: 20px;
}

.btn {
  font-size: 20px;
  padding: 10px 12px;
  border: 1px solid #979797;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  cursor: pointer;
  background-color: #ffffff;
}
.buttonClear {
  background-color: #fdc49c;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.buttonClear:hover {
  background-color: #fcae76;
}
.buttonClear:active {
  background-color: #f58b3d;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.buttonDone {
  background-color: #a9fcc5;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.buttonDone:hover {
  background-color: #7ef5a7;
}
.buttonDone:active {
  background-color: #4cd984;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}
.cd:disabled {
  border: 1px solid #898989;
  background-color: #cbcaca;
  cursor: not-allowed;
}

.slots, .pool {
  margin: 10px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.19);
}

.slot.filled {
  color: #000000;
  background: #fff;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.2);
}

.slot.correct   { border-color:#27ae60; font-weight:700; }

.slot.incorrect { border-color:#e74c3c; font-weight:700; }

.word {
  background: #fff;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.19);
}

</style>