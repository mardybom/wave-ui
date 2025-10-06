<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEraser, faCircleCheck } from '@fortawesome/free-solid-svg-icons'

import ELLE_FEEDBACK from '@/assets/elle_feedback.png'
import ELLE_SUCCESS from '@/assets/elle_success.mp4'

import STAR_IMG from '@/assets/star_1.png'
import BADGE_BRONZE_IMG from '@/assets/bronze.png'
import BADGE_SILVER_IMG from '@/assets/silver.png'
import BADGE_GOLD_IMG from '@/assets/gold.png'

const props = defineProps({
  correctWords: { type: Array, default: () => [] },
  shuffledWords: { type: Array, default: () => [] },
  level: { type: String, default: 'Easy' },
  successImg: { type: String, default: ELLE_SUCCESS }, // used for BADGE celebrations
  failureImg: { type: String, default: ELLE_FEEDBACK },
  starImg: { type: String, default: STAR_IMG },
  badgeBronzeImg: { type: String, default: BADGE_BRONZE_IMG },
  badgeSilverImg: { type: String, default: BADGE_SILVER_IMG },
  badgeGoldImg: { type: String, default: BADGE_GOLD_IMG },

  // NEW: still image to display when a STAR is earned
  successStarImg: { type: String, default: STAR_IMG }
})

const emit = defineEmits(['started', 'changeLevel', 'update:level', 'next'])

/* ---------- levels / dropdown ---------- */
const levels = [
  { label: '🌱 Easy ⏷', value: 'Easy' },
  { label: '🌿 Medium ⏷', value: 'Medium' },
  { label: '🌳 Hard ⏷', value: 'Hard' },
  { label: '🔥 Extremely hard ⏷', value: 'Extremely hard' }
]
const ddOpen = ref(false)
const dropdownRef = ref(null)
const levelLabel = computed(() => levels.find(l => l.value === props.level)?.label ?? props.level)
function toggleDropdown() { ddOpen.value = !ddOpen.value; stopClearPulse() }
function closeDropdown() { ddOpen.value = false }
function onDocClick(e) { if (dropdownRef.value && !dropdownRef.value.contains(e.target)) closeDropdown() }
function onDropdownKeydown(e) { if (e.key === 'Escape') closeDropdown() }
function selectLevel(val) {
  closeDropdown()
  emit('update:level', val)
  emit('changeLevel', val)
  clearAllTimers()
  resetHint()
  resetRewards()
  saveSession()
  stopClearPulse()
}

/* ---------- game state ---------- */
const pool  = ref([...(props.shuffledWords || [])])
const slots = ref(Array(props.correctWords?.length || pool.value.length).fill(null))
const slotStatus = ref(Array(slots.value.length).fill(null))

const allFilled = computed(() => pool.value.length === 0 && slots.value.every(s => s !== null))
const isCorrect = computed(() => allFilled.value && slots.value.every((w, i) => w === props.correctWords[i]))

let hasEmittedStarted = false
const fillSlot = (word, index) => {
  const emptyIndex = slots.value.findIndex(s => s === null)
  if (emptyIndex !== -1) {
    slots.value[emptyIndex] = word
    pool.value.splice(index, 1)
    if (!hasEmittedStarted) { hasEmittedStarted = true; emit('started') }
    handleSlotChange(emptyIndex)
  }
  resetHintTimer()
  cancelAutoClear()
  cancelWrongPreview()
  stopClearPulseTemporarily()
}

const returnToPool = (word, index) => {
  if (!word) return
  pool.value.push(word)
  slots.value[index] = null
  slotStatus.value[index] = null
  clearWrongHint(index)
  resetHintTimer()
  cancelAutoClear()
  cancelWrongPreview()
  stopClearPulseTemporarily()
}

const clearSlots = () => {
  slots.value.forEach((w, i) => { if (w) pool.value.push(w); clearWrongHint(i) })
  slots.value.fill(null)
  slotStatus.value.fill(null)
  hasEmittedStarted = false
  resetHintTimer()
  cancelAutoClear()
  cancelWrongPreview()
  stopClearPulse()
}

/* ---------- modals ---------- */
const showModal = ref(false)
const modalType = ref('success')
const modalMessage = ref('')
let wrongPreviewTimer = null
function cancelWrongPreview() { clearTimeout(wrongPreviewTimer); wrongPreviewTimer = null }

/* NEW: decide whether to show image (star) or video (badge) */
const celebrationMode = ref('star') // 'star' | 'badge'

function checkAnswer() {
  slots.value.forEach((w, i) => {
    if (!w) slotStatus.value[i] = null
    else if (w === props.correctWords[i]) slotStatus.value[i] = true
    else slotStatus.value[i] = false
  })
  cancelWrongPreview()

  if (isCorrect.value) {
    const nextStars = rewards.starsTotal + 1
    celebrationMode.value = (nextStars % 5 === 0) ? 'badge' : 'star'

    if (nextStars >= 15) {
      modalMessage.value = 'Great you mastered this level, Now lets play next level.'
    } else if (nextStars % 5 === 0) {
      const t = nextStars >= 10 ? (nextStars >= 15 ? 'Gold' : 'Silver') : 'Bronze'
      modalMessage.value = `Yippee! You earned a ${t} medal!`
    } else {
      modalMessage.value = 'Yippee! You earned a STAR!… let’s go next.'
    }

    modalType.value = 'success'
    showModal.value = true
    clearAllTimers()
    nextTick(async () => { await awardAndAnimate() })
  } else if (allFilled.value) {
    wrongPreviewTimer = setTimeout(() => {
      modalType.value = 'failure'
      showModal.value = true
      startAutoClear()
    }, 3000)
  }
  stopClearPulseTemporarily()
}

function closeModal() {
  showModal.value = false
  cancelAutoClear()
  if (modalType.value === 'success') {
    emit('next')
  } else {
    clearSlots()
  }
}

/* ---------- hints & timers ---------- */
const HINT_DELAY_MS = 5000
let inactivityTimer = null
const hinted = ref({ index: -1, word: null })
function triggerHint() {
  if (showModal.value) return
  const emptyIdx = slots.value.findIndex(s => s === null)
  if (emptyIdx === -1) { resetHint(); return }
  const neededWord = props.correctWords[emptyIdx]
  const poolIdx = pool.value.findIndex(w => w === neededWord)
  hinted.value = (poolIdx !== -1) ? { index: poolIdx, word: neededWord } : { index: -1, word: null }
}
function resetHint() { hinted.value = { index: -1, word: null } }
function resetHintTimer() { clearTimeout(inactivityTimer); resetHint(); inactivityTimer = setTimeout(triggerHint, HINT_DELAY_MS) }

const PERIODIC_HINT_MS = 5000
let periodicHintTimer = null
function startPeriodicHints() { stopPeriodicHints(); periodicHintTimer = setInterval(() => { if (!isCorrect.value) triggerHint() }, PERIODIC_HINT_MS) }
function stopPeriodicHints() { if (periodicHintTimer) clearInterval(periodicHintTimer); periodicHintTimer = null }

const AUTOCLEAR_MS = 55000
let autoClearTimer = null
function startAutoClear() { clearTimeout(autoClearTimer); autoClearTimer = setTimeout(() => { clearSlots(); showModal.value = false }, AUTOCLEAR_MS) }
function cancelAutoClear() { clearTimeout(autoClearTimer); autoClearTimer = null }
function clearAllTimers() {
  clearTimeout(inactivityTimer)
  clearTimeout(autoClearTimer)
  cancelWrongPreview()
  inactivityTimer = null
  autoClearTimer = null
  resetHint()
  stopPeriodicHints()
  cancelAllWrongHints()
}

/* ---------- wrong-word buzz ---------- */
const WRONG_HINT_DELAY_MS = 0
const buzzSlots = ref([])
let wrongHintTimers = []
function clearWrongHint(i) { if (wrongHintTimers[i]) clearTimeout(wrongHintTimers[i]); wrongHintTimers[i] = null; buzzSlots.value[i] = false }
function scheduleWrongHint(i) {
  clearWrongHint(i)
  const w = slots.value[i]
  if (w && w !== props.correctWords[i]) wrongHintTimers[i] = setTimeout(() => { if (!showModal.value) buzzSlots.value[i] = true }, WRONG_HINT_DELAY_MS)
}
function cancelAllWrongHints() { wrongHintTimers.forEach(t => t && clearTimeout(t)); wrongHintTimers = Array(slots.value.length).fill(null); buzzSlots.value = Array(slots.value.length).fill(false) }
function handleSlotChange(i) {
  const w = slots.value[i]
  if (!w || w === props.correctWords[i]) clearWrongHint(i)
  else scheduleWrongHint(i)
}

/* ---------- Rewards (session persistence) ---------- */
const rewards = reactive({ starsTotal: 0 })
const filledInCycle = computed(() => rewards.starsTotal % 5)
const currentBadge = computed(() => {
  const total = rewards.starsTotal
  if (total >= 15) return 'Gold'
  if (total >= 10) return 'Silver'
  if (total >= 5)  return 'Bronze'
  return null
})
function badgeImgFor(type) {
  if (type === 'Bronze') return props.badgeBronzeImg
  if (type === 'Silver') return props.badgeSilverImg
  if (type === 'Gold')   return props.badgeGoldImg
  return null
}
function resetRewards() { rewards.starsTotal = 0 }

/* session storage helpers (keep on reload, reset on fresh entry) */
const SS_KEY = 'sr_rewards_session_v1'
function saveSession() {
  try { sessionStorage.setItem(SS_KEY, JSON.stringify({ level: props.level, starsTotal: rewards.starsTotal })) } catch {}
}
function readSession() {
  try { const raw = sessionStorage.getItem(SS_KEY); return raw ? JSON.parse(raw) : null } catch { return null }
}
function bootRewardsSession() {
  const nav = performance.getEntriesByType?.('navigation')?.[0]
  const navType = nav?.type || 'navigate'
  if (navType === 'navigate') sessionStorage.removeItem(SS_KEY)
  const stored = readSession()
  if (stored && stored.level === props.level) rewards.starsTotal = stored.starsTotal || 0
  else { resetRewards(); saveSession() }
}

/* slide-in reveal for the side bar */
const rewardsBarVisible = ref(false)
function showRewardsBar(immediate = false) {
  rewardsBarVisible.value = true
  if (!immediate) setTimeout(() => { rewardsBarVisible.value = false }, 1800)
}

/* modal targets for star/badge landing */
const modalStarSlotRefs = ref([])
function setModalStarSlotRef(el, i) { if (el) modalStarSlotRefs.value[i] = el }
const modalBadgeTargetRef = ref(null)

/* ---------- flyers (star/badge) ---------- */
const flyers = ref([])
let flyerId = 0

async function awardAndAnimate() {
  await nextTick()

  const nextIndex = filledInCycle.value
  const nextStarEl = modalStarSlotRefs.value?.[nextIndex]
  if (nextStarEl) {
    const r = nextStarEl.getBoundingClientRect()
    await flyToTarget(props.starImg, r)
  }

  rewards.starsTotal += 1
  celebrationMode.value = (rewards.starsTotal % 5 === 0) ? 'badge' : 'star' // keep in sync
  showRewardsBar()
  saveSession()

  const total = rewards.starsTotal
  if (total % 5 === 0) {
    const type = currentBadge.value
    const badgeTarget = modalBadgeTargetRef.value?.getBoundingClientRect()
    const img = badgeImgFor(type)
    if (img && badgeTarget) await flyToTarget(img, badgeTarget, true)
  }

  if (rewards.starsTotal >= 15) {
    setTimeout(() => advanceDifficulty(), 1200)
  }
}

function advanceDifficulty() {
  const order = ['Easy', 'Medium', 'Hard', 'Extremely hard']
  const idx = order.indexOf(props.level)
  if (idx !== -1 && idx < order.length - 1) {
    const next = order[idx + 1]
    resetRewards()
    saveSession()
    emit('update:level', next)
    emit('changeLevel', next)
  }
}

function getStartPoint() {
  const modal = document.querySelector('.modal-card')
  const art = modal?.querySelector('.modal-mascot-video, .modal-mascot')
  const r = (art || modal)?.getBoundingClientRect()
  if (!r) return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.35 }
}

function flyToTarget(img, targetRect, isBadge = false) {
  return new Promise(resolve => {
    const start = getStartPoint()
    const end = { x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 }
    const id = ++flyerId
    flyers.value.push({ id, img, x: start.x, y: start.y, scale: isBadge ? 0.75 : 0.9 })

    const apply = () => {
      const el = document.querySelector(`.flyer[data-id="${id}"]`)
      if (!el) return
      el.style.setProperty('--start-x', `${start.x}px`)
      el.style.setProperty('--start-y', `${start.y}px`)
      el.style.setProperty('--end-x', `${end.x}px`)
      el.style.setProperty('--end-y', `${end.y}px`)
      el.classList.add('animate-fly')
    }

    requestAnimationFrame(() => { requestAnimationFrame(apply) })
    setTimeout(() => { flyers.value = flyers.value.filter(f => f.id !== id); resolve() }, 900)
  })
}

/* ---------- clear-button pulse nudger ---------- */
const clearPulseDisabled = ref(false)
let clearPulseTimer = null
function stopClearPulse() { clearPulseDisabled.value = true; if (clearPulseTimer) { clearTimeout(clearPulseTimer); clearPulseTimer = null } }
function stopClearPulseTemporarily(ms = 1000) {
  stopClearPulse()
  clearPulseTimer = setTimeout(() => { clearPulseDisabled.value = false }, ms)
}
const hasWrongPlacement = computed(() =>
  slots.value.some((w, i) => w !== null && w !== props.correctWords[i])
)
const nudgeClearActive = computed(() => hasWrongPlacement.value && !clearPulseDisabled.value)

/* ---------- lifecycle ---------- */
watch(
  () => [props.correctWords, props.shuffledWords],
  () => {
    pool.value  = [...(props.shuffledWords || [])]
    slots.value = Array(props.correctWords?.length || pool.value.length).fill(null)
    slotStatus.value = Array(slots.value.length).fill(null)
    hasEmittedStarted = false
    wrongHintTimers = Array(slots.value.length).fill(null)
    buzzSlots.value = Array(slots.value.length).fill(false)
    clearAllTimers()
    resetHintTimer()
    startPeriodicHints()
    stopClearPulse()
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  bootRewardsSession()
  resetHintTimer()
  startPeriodicHints()
  document.addEventListener('click', onDocClick)
  showRewardsBar(true)
})
onBeforeUnmount(() => {
  clearAllTimers()
  document.removeEventListener('click', onDocClick)
})

const donePulseActive = computed(() => {
  return slots.value.length > 0 &&
         slots.value.every((w, i) => w === props.correctWords[i]);
});
</script>

<template>
  <div class="sb">
    <!-- right-side sliding rewards navbar (overlay) -->
    <div class="rewards-bar side" :class="{ show: rewardsBarVisible }" aria-live="polite">
      <div class="rb-inner">
        <div class="rb-stars-row">
          <div v-for="i in 5" :key="'rb-star-'+i" class="rb-star-slot" :class="{ filled: (i-1) < filledInCycle }">
            <img :src="starImg" alt="" />
          </div>
        </div>
        <div class="rb-badges-col">
          <img v-if="currentBadge" :src="badgeImgFor(currentBadge)" :alt="currentBadge" class="rb-badge" />
        </div>
      </div>
    </div>

    <!-- flyers layer -->
    <div class="flyers-layer" aria-hidden="true">
      <div
        v-for="f in flyers"
        :key="f.id"
        class="flyer"
        :data-id="f.id"
        :style="{ left: f.x + 'px', top: f.y + 'px', transform: `translate(-50%, -50%) scale(${f.scale})` }"
      >
        <img :src="f.img" class="flyer-img" alt="" />
      </div>
    </div>

    <!-- Board -->
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
              'slot-hint': hinted.index === -1 && slot === null && i === slots.findIndex(s => s === null),
              buzz: buzzSlots[i]
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

    <!-- Toolbar -->
    <div class="sb-toolbar">
      <div ref="dropdownRef" class="dropdown" @keydown="onDropdownKeydown">
        <button class="btn buttonLevel dropdown-toggle" :aria-expanded="ddOpen" aria-haspopup="listbox" type="button" @click.stop="toggleDropdown">
          {{ levelLabel }}
        </button>
        <div v-if="ddOpen" class="dropdown-menu" role="listbox">
          <div v-for="l in levels" :key="l.value" class="dropdown-item" role="option" :aria-selected="level === l.value" @click.stop="selectLevel(l.value)">
            {{ l.label }}
          </div>
        </div>
      </div>

      <button class="btn buttonClear cd" :class="{ pulse: nudgeClearActive }" @click="clearSlots" :disabled="!slots.some(s => s)">
        <FontAwesomeIcon :icon="faEraser" />
        <span>Clear</span>
      </button>

      <button class="btn buttonNext" @click="emit('next'); stopClearPulse()">Next ▸</button>

      <button
        class="btn buttonDone cd"
        :class="{ pulse: donePulseActive }"
        @click="checkAnswer"
        :disabled="pool.length > 0"
      >
        <FontAwesomeIcon :icon="faCircleCheck" />
        <span>Check</span>
      </button>
    </div>

    <!-- Modal -->
    <teleport to="body">
      <div v-if="showModal" class="modal" @click.self="closeModal">
        <div class="modal-card" :class="modalType === 'success' ? 'modal-success' : 'modal-failure'">
          <button class="modal-close" aria-label="Close" @click="closeModal">×</button>

          <!-- SUCCESS: image for STAR, video for BADGE -->
          <template v-if="modalType === 'success'">
            <img
              v-if="celebrationMode === 'star'"
              class="modal-mascot"
              :src="successStarImg"
              alt="Great job!"
            />
            <video
              v-else
              class="modal-mascot-video"
              :src="successImg"
              autoplay
              loop
              muted
              playsinline
            ></video>
          </template>

          <!-- FAILURE -->
          <img v-else :src="failureImg" class="modal-mascot" alt="Try again" />

          <!-- Fixed message -->
          <div v-if="modalType === 'success'" class="modal-text success">{{ modalMessage }}</div>
          <div v-else class="modal-text failure">Ohh ooo… No worries! Let’s give it another go!</div>

          <div class="modal-rewards">
            <div class="mr-stars">
              <div
                v-for="i in 5"
                :key="'mr-star-'+i"
                class="mr-star"
                :class="{ filled: (i-1) < filledInCycle }"
                :ref="el => setModalStarSlotRef(el, i-1)"
              >
                <img :src="starImg" alt="" />
              </div>
            </div>
            <div class="mr-badges" ref="modalBadgeTargetRef">
              <img v-if="currentBadge" :src="badgeImgFor(currentBadge)" :alt="currentBadge" class="mr-badge" />
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
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
  --cta-glow-rgb: 136, 207, 157;
}

.sb { display: grid; grid-template-columns: fit-content(820px) 232px; column-gap: 50px; align-items: start; justify-content: center; }
.sb-board { min-width: 0; justify-self: left; }
.sb-toolbar { width: 200px; display: flex; flex-direction: column; gap: 16px; justify-self: left; }
@media (max-width: 820px) { .sb { grid-template-columns: 1fr; } .sb-toolbar { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 10px; justify-content: flex-end; } }

.wrapper1, .slots, .pool { user-select: none; -webkit-user-select: none; -ms-user-select: none; -webkit-touch-callout: none; }
.wrapper1 { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 18px 24px; border-radius: 20px; background: #f7e8b6; box-shadow: 2px 2px 20px rgba(120,48,77,0.2); inline-size: clamp(520px, 54vw, 820px); }
.slots, .pool { margin: 10px 0; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

.btn { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; color: var(--c-ink); padding: 12px 14px; border-radius: var(--btn-radius); border: var(--btn-border) solid var(--white-br); box-shadow: var(--shadow); background: var(--white-bg); display: inline-flex; align-items: center; gap: 10px; cursor: pointer; transition: transform .06s ease, filter .2s ease, background-color .2s ease; }
.btn:active { transform: translateY(1px); }
.btn:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
.buttonLevel { background: var(--lav-bg); border-color: var(--lav-br); }
.buttonClear { background: var(--pink-bg); border-color: var(--pink-br); }
.buttonNext  { background: var(--yellow-bg); border-color: var(--yellow-br); }
.buttonDone  { background: var(--green-bg); border-color: var(--green-br); }
.cd:disabled { opacity: .55; cursor: not-allowed; filter: grayscale(.1); }

/* dropdown fix */
.dropdown { position: relative; }
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border: 2px solid var(--lav-br);
  border-radius: 12px;
  padding: 8px 10px;
  box-shadow: var(--shadow);
  z-index: 20;
  min-width: 210px;
}
.dropdown-item { padding: 8px 10px; border-radius: 8px; cursor: pointer; }
.dropdown-item:hover { background: var(--lav-bg); }

.slot, .word { padding: 10px 15px; border: 1px solid #ccc; border-radius: 8px; cursor: pointer; font-size: 22px; }
.slot { background: #efeeee; color: #6c6c6c; box-shadow: inset 0 2px 3px rgba(0,0,0,.19); }
.slot.filled { color: #000; background: #fff; box-shadow: 1px 2px 3px rgba(0,0,0,.2); }
.slot.correct   { border-color:#9bd3b2; font-weight:700; border-width: 5px; }
.slot.incorrect { border-color:#ed1e07; font-weight:700; border-width: 5px; }
.word { background: #fff; box-shadow: 1px 2px 3px rgba(0,0,0,.19); }

@keyframes hintPulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(216,129,203,0); } 70%{ transform: scale(1.05); box-shadow: 0 0 0 12px rgba(216,129,203,0); } 100%{transform: scale(1); box-shadow: 0 0 0 0 rgba(216,129,203,0);} }
.word.hint { outline: 3px solid #d881cb; animation: hintPulse 1.2s ease-in-out infinite; }
.slot-hint { outline: 3px dashed #4a90e2; }

@keyframes ctaGlow {
  0% { transform: translateY(0) scale(1); box-shadow: var(--shadow), 0 0 0 0 rgba(var(--cta-glow-rgb),0), 0 0 0 0 rgba(var(--cta-glow-rgb),0); }
  50% { transform: translateY(-1px) scale(1.05); box-shadow: var(--shadow), 0 6px 18px 0 rgba(var(--cta-glow-rgb), .55), 0 0 36px 14px rgba(var(--cta-glow-rgb), .28); }
  100%{ transform: translateY(0) scale(1); box-shadow: var(--shadow), 0 0 0 0 rgba(var(--cta-glow-rgb),0), 0 0 0 0 rgba(var(--cta-glow-rgb),0); }
}
.pulse { animation: ctaGlow 2.2s ease-in-out infinite; }

.modal { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: grid; place-items: center; z-index: 9999; backdrop-filter: blur(1px); }
.modal-card { width: min(150vw, 1000px); background: #ffffff; padding: 22px 22px 18px; box-shadow: 0 18px 40px rgba(0,0,0,.25); display: grid; justify-items: center; row-gap: 10px; position: relative; }
.modal-close { position: absolute; top: 10px; right: 12px; background: transparent; border: none; font-size: 28px; line-height: 1; cursor: pointer; color: #6b7280; }
.modal-close:hover { color: #111827; }
.modal-mascot { width: 150px; max-width: 80%; height: auto; border-radius: 14px; display: block; }
.modal-mascot-video { width: 320px; max-width: 85vw; height: auto; border-radius: 14px; display: block; }
.modal-text { font-size: 24px; font-family: Opendyslexic; font-weight: 800; text-align: center; color: #1e2633; letter-spacing: .5px; }

.modal-rewards { display: flex; gap: 16px; align-items: center; margin-top: 6px; }
.mr-stars { display: inline-flex; gap: 12px; align-items: center; }
.mr-star { width: 100px; height: 120px; border-radius: 50%; display: grid; place-items: center; background: #fff; border: 3px solid var(--white-br); box-shadow: var(--shadow); }
.mr-star img { width: 120px; height: 140px; filter: grayscale(100%) opacity(.35); transition: filter .25s ease; }
.mr-star.filled img { filter: none; }
.mr-badges { display: inline-flex; gap: 8px; align-items: center; }
.mr-badge { width: 100px; height: 120px; }

.rewards-bar.side {
  position: fixed;
  top: 50%;
  right: 16px;
  transform: translate(140%, -50%);
  opacity: 0;
  transition: transform .5s ease, opacity .5s ease;
  z-index: 10000;
  pointer-events: none;
}
.rewards-bar.side.show { transform: translate(50%, -50%); opacity: 1; }
.rewards-bar .rb-inner {
  backdrop-filter: blur(6px);
  background: rgba(255,255,255,.55);
  border: 2px solid rgba(217,222,231,.8);
  border-radius: 16px;
  padding: 10px;
  display: grid;
  gap: 12px;
  align-items: center;
  box-shadow: var(--shadow);
  pointer-events: auto;
}
.rb-stars-row { display: grid; gap: 8px; justify-items: center; }
.rb-star-slot { width: 70px; height: 70px; display: grid; place-items: center; }
.rb-star-slot img { width: 60px; height: 80px; filter: grayscale(100%) opacity(.35); transition: filter .25s ease; transform: translateY(-12px); }
.rb-star-slot.filled img { filter: none; }
.rb-badges-col { display: grid; gap: 8px; justify-items: center; }
.rb-badge { width: 50px; height: 70px; }

.flyers-layer { position: fixed; inset: 0; pointer-events: none; z-index: 10001; }
.flyer { position: absolute; will-change: transform, opacity; }
.flyer-img { width: 44px; height: 44px; filter: drop-shadow(0 4px 12px rgba(0,0,0,.25)); }
@keyframes flyTo {
  0%   { transform: translate(var(--start-x), var(--start-y)) scale(0.6); opacity: 0; }
  10%  { transform: translate(calc(var(--start-x) + 0px), calc(var(--start-y) - 10px)) scale(1); opacity: 1; }
  70%  { transform: translate(calc(var(--end-x) - 12px), calc(var(--end-y) - 18px)) scale(1); opacity: 1; }
  100% { transform: translate(var(--end-x), var(--end-y)) scale(1); opacity: 0; }
}
.flyer.animate-fly { animation: flyTo 0.9s cubic-bezier(.2,1,.2,1) forwards; }

@keyframes buzzShake {
  0% { transform: translateX(0) rotate(0); }
  15% { transform: translateX(-2px) rotate(-1deg); }
  30% { transform: translateX(2px) rotate(1deg); }
  45% { transform: translateX(-2px) rotate(-1deg); }
  60% { transform: translateX(2px) rotate(1deg); }
  75% { transform: translateX(-1px) rotate(0.5deg); }
  100%{ transform: translateX(0) rotate(0); }
}
.slot.buzz { animation: buzzShake 700ms ease-in-out infinite; border-color: #f03800; border-width: 3px; }

@media (prefers-reduced-motion: reduce) {
  .pulse { animation: none; }
  .flyer.animate-fly { animation: none; opacity: 1; }
}
</style>
