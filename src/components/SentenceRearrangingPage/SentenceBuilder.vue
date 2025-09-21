<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEraser, faCircleCheck } from '@fortawesome/free-solid-svg-icons'

import ELLE_FEEDBACK from '@/assets/elle_feedback.png'
import ELLE_SUCCESS from '@/assets/elle_success.mp4'

const props = defineProps({
  correctWords: { type: Array, default: () => [] },
  shuffledWords: { type: Array, default: () => [] },
  level: { type: String, default: 'Easy' },

  /* defaults match your assets; success uses mp4 */
  successImg: { type: String, default: ELLE_SUCCESS },
  failureImg: { type: String, default: ELLE_FEEDBACK }
})

const emit = defineEmits(['started', 'changeLevel', 'update:level', 'next'])

/* Kid-friendly labels; values unchanged for your API */
const levels = [
  { label: '🌱 Easy', value: 'Easy' },
  { label: '🌿 Medium', value: 'Medium' },
  { label: '🌳 Hard', value: 'Hard' },
  { label: '🔥 Extremely hard', value: 'Extremely hard' }
]

/* -------- custom dropdown (wrap-friendly) -------- */
const ddOpen = ref(false)
const dropdownRef = ref(null)
const levelLabel = computed(() => levels.find(l => l.value === props.level)?.label ?? props.level)
function toggleDropdown() { ddOpen.value = !ddOpen.value }
function closeDropdown() { ddOpen.value = false }
function onDocClick(e) {
  if (!dropdownRef.value) return
  if (!dropdownRef.value.contains(e.target)) closeDropdown()
}
function onDropdownKeydown(e) {
  if (e.key === 'Escape') closeDropdown()
}
function selectLevel(val) {
  closeDropdown()
  emit('update:level', val)
  emit('changeLevel', val)
  clearAllTimers()
  resetHint()
}

/* pool / slots / status */
const pool  = ref([...(props.shuffledWords || [])])
const slots = ref(Array(props.correctWords?.length || pool.value.length).fill(null))
const slotStatus = ref(Array(slots.value.length).fill(null))

/* derived */
const allFilled = computed(() =>
  pool.value.length === 0 && slots.value.every(s => s !== null)
)
const isCorrect = computed(() =>
  allFilled.value && slots.value.every((w, i) => w === props.correctWords[i])
)

let hasEmittedStarted = false
const fillSlot = (word, index) => {
  const emptyIndex = slots.value.findIndex(s => s === null)
  if (emptyIndex !== -1) {
    slots.value[emptyIndex] = word
    pool.value.splice(index, 1)
    if (!hasEmittedStarted) {
      hasEmittedStarted = true
      emit('started')
    }
  }
  resetHintTimer()
  cancelAutoClear()
  cancelWrongPreview()
}

const returnToPool = (word, index) => {
  if (!word) return
  pool.value.push(word)
  slots.value[index] = null
  slotStatus.value[index] = null
  resetHintTimer()
  cancelAutoClear()
  cancelWrongPreview()
}

const clearSlots = () => {
  slots.value.forEach(w => { if (w) pool.value.push(w) })
  slots.value.fill(null)
  slotStatus.value.fill(null)
  hasEmittedStarted = false
  resetHintTimer()
  cancelAutoClear()
  cancelWrongPreview()
}

/* modal state */
const showModal = ref(false)
const modalType = ref('success') // 'success' | 'failure'

/* show wrong for 5s before failure modal */
let wrongPreviewTimer = null
function cancelWrongPreview() {
  clearTimeout(wrongPreviewTimer)
  wrongPreviewTimer = null
}

const checkAnswer = () => {
  slots.value.forEach((w, i) => {
    if (!w) slotStatus.value[i] = null
    else if (w === props.correctWords[i]) slotStatus.value[i] = true
    else slotStatus.value[i] = false
  })

  cancelWrongPreview()

  if (isCorrect.value) {
    modalType.value = 'success'
    showModal.value = true
    clearAllTimers()
  } else if (allFilled.value) {
    /* preview wrong highlights for 3s, then show failure modal */
    wrongPreviewTimer = setTimeout(() => {
      modalType.value = 'failure'
      showModal.value = true
      startAutoClear()
    }, 3000)
  }
}

/* close behavior per your spec */
function closeModal() {
  showModal.value = false
  cancelAutoClear()
  if (modalType.value === 'success') {
    emit('next')           // go to next sentence
  } else {
    clearSlots()           // clear board, try again
  }
}

/* inactivity hint (10s in your code) */
const HINT_DELAY_MS = 10000
let inactivityTimer = null
const hinted = ref({ index: -1, word: null }) // pool index to pulse; -1 means hint slot

function triggerHint() {
  const emptyIdx = slots.value.findIndex(s => s === null)
  if (emptyIdx === -1) { resetHint(); return }
  const neededWord = props.correctWords[emptyIdx]
  const poolIdx = pool.value.findIndex(w => w === neededWord)
  hinted.value = (poolIdx !== -1) ? { index: poolIdx, word: neededWord } : { index: -1, word: null }
}
function resetHint() { hinted.value = { index: -1, word: null } }
function resetHintTimer() {
  clearTimeout(inactivityTimer)
  resetHint()
  inactivityTimer = setTimeout(triggerHint, HINT_DELAY_MS)
}

/* auto clear after wrong done (55s) */
const AUTOCLEAR_MS = 55000
let autoClearTimer = null
function startAutoClear() {
  clearTimeout(autoClearTimer)
  autoClearTimer = setTimeout(() => {
    clearSlots()
    showModal.value = false
  }, AUTOCLEAR_MS)
}
function cancelAutoClear() {
  clearTimeout(autoClearTimer)
  autoClearTimer = null
}
function clearAllTimers() {
  clearTimeout(inactivityTimer)
  clearTimeout(autoClearTimer)
  cancelWrongPreview()
  inactivityTimer = null
  autoClearTimer = null
  resetHint()
}

/* re-init when sentence changes */
watch(
  () => [props.correctWords, props.shuffledWords],
  () => {
    pool.value  = [...(props.shuffledWords || [])]
    slots.value = Array(props.correctWords?.length || pool.value.length).fill(null)
    slotStatus.value = Array(slots.value.length).fill(null)
    hasEmittedStarted = false
    clearAllTimers()
    resetHintTimer()
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  resetHintTimer()
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  clearAllTimers()
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <!-- board | toolbar -->
  <div class="sb">
    <!-- Sentence board -->
    <div class="sb-board">
      <div class="wrapper1">
        <div class="slots">
          <span
            v-for="(slot, i) in slots"
            :key="'slot-' + i"
            class="slot"
            :class="{
              filled: !!slot,
              correct: slotStatus[i] === true,
              incorrect: slotStatus[i] === false,
              'slot-hint': hinted.index === -1 && slot === null && i === slots.findIndex(s => s === null)
            }"
            @click="returnToPool(slot, i)"
          >
            {{ slot || '____' }}
          </span>
        </div>

        <div class="pool">
          <span
            v-for="(word, i) in pool"
            :key="'pool-' + i"
            class="word"
            :class="{ hint: hinted.index === i && hinted.word === word }"
            @click="fillSlot(word, i)"
          >
            {{ word }}
          </span>
        </div>
      </div>
    </div>

    <!-- Toolbar (dropdown + buttons) -->
    <div class="sb-toolbar">

      <!-- Wrapped, kid-friendly dropdown -->
      <div
        ref="dropdownRef"
        class="dropdown"
        @keydown="onDropdownKeydown"
      >
        <button
          class="btn buttonLevel dropdown-toggle"
          :aria-expanded="ddOpen"
          aria-haspopup="listbox"
          type="button"
          @click.stop="toggleDropdown"
        >
          {{ levelLabel }}
        </button>

        <div
          v-if="ddOpen"
          class="dropdown-menu"
          role="listbox"
        >
          <div
            v-for="l in levels"
            :key="l.value"
            class="dropdown-item"
            role="option"
            :aria-selected="props.level === l.value"
            @click.stop="selectLevel(l.value)"
          >
            {{ l.label }}
          </div>
        </div>
      </div>

      <button
        class="btn buttonClear cd"
        @click="clearSlots"
        :disabled="!slots.some(s => s)"
      >
        <FontAwesomeIcon :icon="faEraser" />
        <span>Clear</span>
      </button>

      <button class="btn buttonNext" @click="emit('next')">Next ▸</button>

      <button
        class="btn buttonDone cd"
        :class="{ pulse: allFilled }"
        @click="checkAnswer"
        :disabled="pool.length > 0"
      >
        <FontAwesomeIcon :icon="faCircleCheck" />
        <span>Done</span>
      </button>
    </div>

    <!-- Feedback / Success modal -->
    <teleport to="body">
      <div v-if="showModal" class="modal" @click.self="closeModal">
        <div class="modal-card" :class="modalType === 'success' ? 'modal-success' : 'modal-failure'">
          <button class="modal-close" aria-label="Close" @click="closeModal">×</button>

          <!-- success uses VIDEO (mp4) -->
          <video
            v-if="modalType === 'success'"
            class="modal-mascot-video"
            :src="props.successImg"
            autoplay
            loop
            muted
            playsinline
          ></video>

          <!-- failure uses IMAGE -->
          <img
            v-else
            :src="props.failureImg"
            class="modal-mascot"
            alt="Try again"
          />

          <div v-if="modalType === 'success'" class="modal-text success">
            Yippee! You got it right… let’s go next.
          </div>
          <div v-else class="modal-text failure">
            Ohh ooo… No worries! Let’s give it another go!
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
/* =================== THEME =================== */
.sb {
  --c-ink: #1e2633;
  --shadow: 0 8px 18px rgba(20, 30, 50, 0.12);

  --btn-radius: 14px;
  --btn-border: 3px;

  --yellow-bg: #f7e39a;
  --yellow-br: #e3c568;

  --pink-bg: #f6c2c2;
  --pink-br: #e09c9c;

  --lav-bg: #d7cdfa;
  --lav-br: #b3a2f0;

  --green-bg: #bff2cb;
  --green-br: #88cf9d;

  --white-bg: #ffffff;
  --white-br: #d9dee7;

  --focus-ring: #4a90e2;
}

/* keep your grid/layout */
.sb {
  display: grid;
  grid-template-columns: fit-content(820px) 232px;
  column-gap: 50px;
  align-items: start;
  justify-content: center;
}
.sb-board { min-width: 0; justify-self: left; }
.sb-toolbar {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-self: left;
}
@media (max-width: 820px) {
  .sb { grid-template-columns: 1fr; }
  .sb-toolbar { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
}

/* board visuals */
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
  gap: 16px;
  padding: 18px 24px;
  border-radius: 20px;
  background: #f7e8b6;
  box-shadow: 2px 2px 20px rgba(120,48,77,0.2);
  inline-size: clamp(520px, 54vw, 820px);
}
.slots, .pool {
  margin: 10px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

/* buttons */
.btn {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--c-ink);
  padding: 12px 14px;
  border-radius: var(--btn-radius);
  border: var(--btn-border) solid var(--white-br);
  box-shadow: var(--shadow);
  background: var(--white-bg);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform .06s ease, filter .2s ease, background-color .2s ease;
}
.btn:active { transform: translateY(1px); }
.btn:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }

.buttonLevel { background: var(--lav-bg); border-color: var(--lav-br); }
.buttonClear { background: var(--pink-bg); border-color: var(--pink-br); }
.buttonNext  { background: var(--yellow-bg); border-color: var(--yellow-br); }
.buttonDone  { background: var(--green-bg); border-color: var(--green-br); }
.cd:disabled { opacity: .55; cursor: not-allowed; filter: grayscale(.1); }

/* tiles */
.slot, .word {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 22px;
}
.slot { background: #efeeee; color: #6c6c6c; box-shadow: inset 0 2px 3px rgba(0,0,0,.19); }
.slot.filled { color: #000; background: #fff; box-shadow: 1px 2px 3px rgba(0,0,0,.2); }
.slot.correct   { border-color:#9bd3b2; font-weight:700; border-width: 5px; }
.slot.incorrect { border-color:#e74c3c; font-weight:700; border-width: 5px; }
.word { background: #fff; box-shadow: 1px 2px 3px rgba(0,0,0,.19); }

/* inactivity hint */
@keyframes hintPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(216,129,203,0); }
  70%{ transform: scale(1.05); box-shadow: 0 0 0 12px rgba(216,129,203,0); }
  100%{transform: scale(1); box-shadow: 0 0 0 0 rgba(216,129,203,0); }
}
.word.hint { outline: 3px solid #d881cb; animation: hintPulse 1.2s ease-in-out infinite; }
.slot-hint { outline: 3px dashed #4a90e2; }

/* done pulse */
@keyframes pulseDone {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(136,207,157,.45); }
  70%{ transform: scale(1.03); box-shadow: 0 0 0 12px rgba(136,207,157,0); }
  100%{transform: scale(1); box-shadow: 0 0 0 0 rgba(136,207,157,0); }
}
.pulse { animation: pulseDone 1.4s ease-in-out infinite; }

/* modal (teleported) */
.modal {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.35);
  display: grid; place-items: center;
  z-index: 9999;
  backdrop-filter: blur(1px);
}
.modal-card {
  width: min(92vw, 500px);
  background: #ffffff;
  padding: 22px 22px 18px;
  box-shadow: 0 18px 40px rgba(0,0,0,.25);
  display: grid;
  justify-items: center;
  row-gap: 10px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 10px; right: 12px;
  background: transparent;
  border: none;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
}
.modal-close:hover { color: #111827; }

.modal-mascot { width: 280px; max-width: 80%; height: auto; border-radius: 14px; display: block; }
.modal-mascot-video { width: 320px; max-width: 85vw; height: auto; border-radius: 14px; display: block; }

.modal-text {
  font-size: 24px;
  font-family: Opendyslexic;
  font-weight: 800;
  text-align: center;
  color: #1e2633;
  letter-spacing: .5px;
}

/* ---------- custom dropdown styles ---------- */
.dropdown { position: relative; }
.dropdown-toggle { width: 100%; text-align: left; }
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  max-width: 260px;
  background: #fff;
  border: 3px solid var(--lav-br);
  border-radius: 14px;
  box-shadow: var(--shadow);
  padding: 8px;
  z-index: 20;
}
.dropdown-item {
  padding: 10px 12px;
  border-radius: 10px;
  white-space: normal;       /* <-- wrap! */
  word-break: break-word;    /* <-- wrap long words */
  line-height: 1.2;
  cursor: pointer;
}
.dropdown-item[aria-selected="true"] {
  background: var(--lav-bg);
  border: 2px solid var(--lav-br);
}
.dropdown-item:hover { background: #f3f3ff; }
</style>
