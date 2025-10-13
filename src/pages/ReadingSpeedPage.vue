<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import GameTopBar from '@/components/GameTopBar.vue'
import WaveHeader from '@/components/WaveHeader.vue'
import GameTitleNDescribe from '@/components/GameTitleNDescribe.vue'
import { apiPost } from '@/utils/api'

// -------------------- State --------------------
const currentContent = ref('')
const loading = ref(true)
const errorMsg = ref('')
const isReading = ref(false)
const isPaused = ref(false)
const currentWordIndex = ref(0)
const contentList = ref([])
const selectedLevel = ref('Easy')
const isDropdownOpen = ref(false)
const transcript = ref('')
const recognition = ref(null)
const words = ref([])
const wrongAttempts = ref(0)
const hintTimer = ref(null)
const lastWordTime = ref(Date.now())
const showInstructions = ref(false)
const wordCount = ref(0)
const isNextAvailable = ref(false)
const showResultModal = ref(false)
const resultStats = ref({ wpm: 0, time: '' })
const locale = ref(localStorage.getItem('reading_locale') || 'en-AU')

// WPM tracking
const startTime = ref(0)
const elapsedTime = ref(0)
const timerInterval = ref(null)
const finalWPM = ref(0)

const levels = [
  { value: 'Easy', label: 'Easy', icon: '🌱' },
  { value: 'Medium', label: 'Medium', icon: '🌿' },
  { value: 'Hard', label: 'Hard', icon: '🌳' },
  { value: 'Extreme', label: 'Extreme', icon: '🔥' }
]

const isComplete = computed(() => currentWordIndex.value >= words.value.length)

const currentWPM = computed(() => {
  if (elapsedTime.value === 0 || currentWordIndex.value === 0) return 0
  const minutes = elapsedTime.value / 60
  return Math.round(currentWordIndex.value / minutes)
})

const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedTime.value / 60)
  const seconds = Math.floor(elapsedTime.value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Watch for word changes to reset the hint timer
watch([currentWordIndex, isReading, isPaused], () => {
  resetHintTimer()
})

// -------------------- Content (API) + Grammar --------------------
async function fetchContent() {
  loading.value = true
  try {
    const data = await apiPost('/reading_speed', { level: selectedLevel.value })
    const { text, word_count } = data.data
    currentContent.value = text
    wordCount.value = word_count
    words.value = text
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0)

    // After words are set, bias ASR toward them
    applyGrammar(words.value)
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Failed to load reading content.'
  } finally {
    loading.value = false
  }
}

function applyGrammar(wordsArr) {
  if (!recognition.value) return
  const SRGL = window.SpeechGrammarList || window.webkitSpeechGrammarList
  if (!SRGL) return
  try {
    const grammarList = new SRGL()
    const uniq = Array.from(new Set(wordsArr.map((w) => normalizeWord(w)).filter(Boolean)))
    if (uniq.length === 0) return
    const jsgf = `#JSGF V1.0; grammar words; public <word> = ${uniq.join(' | ')} ;`
    grammarList.addFromString(jsgf, 1.0)
    recognition.value.grammars = grammarList
    recognition.value.maxAlternatives = 5
  } catch (err) {
    console.debug('Grammar apply failed', err)
  }
}

// -------------------- Timer --------------------
function startTimer() {
  startTime.value = Date.now() - elapsedTime.value * 1000
  timerInterval.value = setInterval(() => {
    elapsedTime.value = (Date.now() - startTime.value) / 1000
  }, 100)
}

function pauseTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

function resetTimer() {
  pauseTimer()
  startTime.value = 0
  elapsedTime.value = 0
  finalWPM.value = 0
}

// -------------------- UI helpers --------------------
function toggleInstructions() { showInstructions.value = !showInstructions.value }
function toggleDropdown() { isDropdownOpen.value = !isDropdownOpen.value }
function selectLevel(level) { selectedLevel.value = level; isDropdownOpen.value = false; handleStop(); fetchContent() }
function getCurrentLevelIcon() { const l = levels.find((x) => x.value === selectedLevel.value); return l ? l.icon : '🌱' }
function getWordClass(index) {
  if (isComplete.value) return 'word-completed'
  if (index < currentWordIndex.value) return 'word-completed'
  if (index === currentWordIndex.value) return 'word-current'
  return 'word-pending'
}

// -------------------- ASR init --------------------
function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    errorMsg.value = 'Speech recognition is not supported in your browser. Please use Chrome or Edge.'
    return false
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const sr = new SpeechRecognition()
  sr.continuous = true
  sr.interimResults = true
  sr.lang = locale.value // default AU; adjust if you expose a setting
  sr.maxAlternatives = 5

  sr.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscriptPart = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i]
      const best = res[0]?.transcript || ''
      if (res.isFinal) finalTranscriptPart += best + ' '
      else interimTranscript += best + ' '
    }
    const combined = (finalTranscriptPart + interimTranscript).trim()
    transcript.value = combined

    if (combined.length > 0) {
      lastWordTime.value = Date.now()
      resetHintTimer()
    }

    const recentTokens = combined.toLowerCase().split(/\s+/).slice(-4)
    checkWordCandidates(recentTokens, event)
  }

  sr.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    if (event.error === 'no-speech') {
      if (isReading.value && !isPaused.value) sr.start()
    }
  }

  sr.onend = () => {
    if (isReading.value && !isPaused.value && !isComplete.value) {
      try { sr.start() } catch (e) { console.log('Recognition restart failed:', e) }
    }
  }

  recognition.value = sr
  return true
}

// -------------------- Matching helpers --------------------
function stripDiacritics(s) { return s.normalize('NFD').replace(/\p{Diacritic}+/gu, '') }
function normalizeWord(word) {
  if (!word) return ''
  const cleaned = stripDiacritics(String(word))
    .toLowerCase()
    .replace(/[“”"()\[\],.?!;:]/g, '')
    .replace(/’/g, "'")
    .replace(/[^a-z0-9'\-\s]/g, '')
    .trim()
  const map = { cant: "can't", dont: "don't", im: "i'm", youre: "you're", wasnt: "wasn't", isnt: "isn't", couldnt: "couldn't", wouldnt: "wouldn't" }
  return map[cleaned] || cleaned
}
function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const v0 = new Array(b.length + 1)
  const v1 = new Array(b.length + 1)
  for (let i = 0; i < v0.length; i++) v0[i] = i
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost)
    }
    for (let j = 0; j < v0.length; j++) v0[j] = v1[j]
  }
  return v1[b.length]
}
function similarity(a, b) {
  a = normalizeWord(a); b = normalizeWord(b)
  if (!a || !b) return 0
  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  return 1 - dist / Math.max(1, maxLen)
}
function similar(a, b, threshold = 0.75) { return similarity(a, b) >= threshold }

// -------------------- Word checking (fuzzy + alternatives) --------------------
function checkWordCandidates(recentTokens, event) {
  if (currentWordIndex.value >= words.value.length) { handleComplete(); return }
  const target = normalizeWord(words.value[currentWordIndex.value])

  // 1) recent tokens
  for (const tok of recentTokens) {
    if (similar(tok, target)) { acceptCorrect(); return }
  }
  // 2) alternatives
  const lastRes = event.results[event.results.length - 1]
  if (lastRes) {
    for (let k = 0; k < lastRes.length; k++) {
      const altPhrase = normalizeWord(lastRes[k].transcript || '')
      for (const t of altPhrase.split(/\s+/)) {
        if (similar(t, target)) { acceptCorrect(); return }
      }
    }
  }
  // 3) count wrong if a clear non-match token was spoken
  const lastToken = recentTokens[recentTokens.length - 1] || ''
  if (lastToken && !similar(lastToken, target)) {
    wrongAttempts.value++
    transcript.value = ''
    lastWordTime.value = Date.now()
    resetHintTimer()
  }

  function acceptCorrect() {
    currentWordIndex.value++
    transcript.value = ''
    wrongAttempts.value = 0
    lastWordTime.value = Date.now()
    if (currentWordIndex.value >= words.value.length) handleComplete()
  }
}

// -------------------- Hints (TTS) --------------------
function resetHintTimer() {
  if (hintTimer.value) { clearTimeout(hintTimer.value); hintTimer.value = null }
  if (isReading.value && !isPaused.value && !isComplete.value) {
    hintTimer.value = setTimeout(() => { speakHint() }, 5000)
  }
}
function speakHint() {
  if (currentWordIndex.value >= words.value.length || !isReading.value || isPaused.value) return
  if (Date.now() - lastWordTime.value < 4500) return // avoid speaking over the learner
  const currentWord = words.value[currentWordIndex.value]
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(currentWord)
    u.rate = 0.8; u.pitch = 1; u.volume = 1
    u.onend = () => resetHintTimer()
    window.speechSynthesis.speak(u)
  }
}

// -------------------- Flow controls --------------------
function handleStartReading() {
  if (!recognition.value) { const ok = initSpeechRecognition(); if (!ok) return }
  isReading.value = true
  isPaused.value = false
  if (currentWordIndex.value === 0 || isComplete.value) { currentWordIndex.value = 0; wrongAttempts.value = 0; resetTimer() }
  startTimer()
  transcript.value = ''
  lastWordTime.value = Date.now()
  try { recognition.value.start() } catch (e) { console.log('Recognition already started') }
  resetHintTimer()
}

function handlePauseOrContinue() {
  if (isPaused.value) {
    isPaused.value = false
    isReading.value = true
    lastWordTime.value = Date.now()
    startTimer()
    try { recognition.value.start() } catch (e) { console.log('Recognition already started') }
    resetHintTimer()
  } else {
    isPaused.value = true
    isReading.value = false
    pauseTimer()
    if (hintTimer.value) { clearTimeout(hintTimer.value); hintTimer.value = null }
    if (recognition.value) recognition.value.stop()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }
}

function handleStop() {
  isReading.value = false
  isPaused.value = false
  currentWordIndex.value = 0
  transcript.value = ''
  wrongAttempts.value = 0
  resetTimer()
  if (hintTimer.value) { clearTimeout(hintTimer.value); hintTimer.value = null }
  if (recognition.value) recognition.value.stop()
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

async function handleNext() {
  isNextAvailable.value = false
  loading.value = true
  currentWordIndex.value = 0
  transcript.value = ''
  wrongAttempts.value = 0
  resetTimer()
  finalWPM.value = 0
  isReading.value = false
  isPaused.value = false
  await fetchContent()
  loading.value = false
}

function handleComplete() {
  isReading.value = false
  isPaused.value = false
  if (elapsedTime.value > 0) {
    const minutes = elapsedTime.value / 60
    finalWPM.value = Math.round(words.value.length / minutes)
  }
  pauseTimer()
  if (hintTimer.value) { clearTimeout(hintTimer.value); hintTimer.value = null }
  if (recognition.value) recognition.value.stop()
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()

  // Enable Next + modal
  isNextAvailable.value = true
  setTimeout(() => {
    resultStats.value = { wpm: finalWPM.value, time: formattedTime.value }
    showResultModal.value = true
  }, 500)
}

// -------------------- Mounted --------------------
onMounted(() => {
  fetchContent()
  initSpeechRecognition()
})
</script>

<template>
  <div class="page-container">
    <GameTopBar title="Reading Practice" />
    <WaveHeader top="80px" height="200px" zIndex="0" />

    <div class="title-wrapper">
      <GameTitleNDescribe
        title="Reading Practice"
        description="Read the text aloud and watch the words highlight as you go!"
      />
    </div>
    
    <div class="content-wrapper">
      <div class="control-buttons">
        <button 
          class="btn btn-resume" 
          @click="handleStartReading"
          :disabled="(isReading && !isPaused) || isComplete"
        >
          <span class="icon">▶</span> Start Reading
        </button>
        <button 
          class="btn btn-pause" 
          @click="handlePauseOrContinue"
          :disabled="!isReading && !isPaused"
        >
          <span class="icon">{{ isPaused ? '▶' : '⏸' }}</span> {{ isPaused ? 'Continue' : 'Pause' }}
        </button>
        
        <button 
          class="btn btn-stop"
          @click="handleStop"
          :disabled="!isReading && !isPaused && !isComplete"
        >
          <span class="icon">⏹</span> Stop Reading
        </button>

        <button 
          class="btn btn-next"
          @click="handleNext"
        >
          <span class="icon">➡️</span> Next
        </button>

        <div class="custom-dropdown">
          <button 
            class="dropdown-button"
            @click="toggleDropdown"
          >
            <span class="level-icon">{{ getCurrentLevelIcon() }}</span>
            <span class="level-text">{{ selectedLevel }}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <div 
              v-for="level in levels" 
              :key="level.value"
              class="dropdown-item"
              :class="{ active: selectedLevel === level.value }"
              @click="selectLevel(level.value)"
            >
              <span class="level-icon">{{ level.icon }}</span>
              <span class="level-text">{{ level.label }}</span>
              <span class="level-arrow">▼</span>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-label">⏱️ Time</div>
          <div class="stat-value">{{ formattedTime }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">📊 Current WPM</div>
          <div class="stat-value">{{ currentWPM }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">📖 Words Read</div>
          <div class="stat-value">{{ currentWordIndex }} / {{ words.length }}</div>
        </div>
      </div>

      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${(currentWordIndex / words.length) * 100}%` }"
          ></div>
        </div>
        <div class="progress-text">
          {{ currentWordIndex }} / {{ words.length }} words completed
        </div>
      </div>

      <div class="content-display">
        <p v-if="loading">Loading...</p>
        <p v-else-if="errorMsg" class="error">{{ errorMsg }}</p>
        <div v-else class="reading-content">
          <div class="words-container">
            <span
              v-for="(word, index) in words"
              :key="index"
              :class="['word', getWordClass(index)]"
            >
              {{ word }}
            </span>
          </div>
          
          <div v-if="isReading && !isPaused" class="transcript-display">
            <div class="transcript-label">🎤 Listening...</div>
            <div class="transcript-text">{{ transcript || 'Speak now...' }}</div>
            <div v-if="wrongAttempts > 0" class="wrong-attempts">
              ⚠️ Try again! Attempts: {{ wrongAttempts }}
            </div>
            <div class="hint-info">
              💡 Hint: If you're stuck for 5 seconds, I'll read the word for you!
            </div>
          </div>

          <div v-if="isPaused" class="paused-display">
            <div class="paused-label">⏸️ Reading Paused</div>
            <div class="paused-text">Click "Continue" to resume from word {{ currentWordIndex + 1 }}</div>
            <div class="paused-stats">Timer paused at {{ formattedTime }}</div>
          </div>

          <div class="instructions-toggle">
            <button 
                class="btn-instructions" 
                @click="toggleInstructions"
            >
                <span class="icon">{{ showInstructions ? '📖' : '❓' }}</span>
                {{ showInstructions ? 'Hide Instructions' : 'Show Instructions' }}
            </button>
            </div>

            <div v-if="showInstructions" class="instructions">
            <h3>📖 How to use:</h3>
            <ol>
                <li>Click "Start Reading" to begin (timer starts automatically)</li>
                <li>Read each word aloud clearly</li>
                <li>The current word will be highlighted in <span class="highlight-yellow">yellow</span></li>
                <li>Completed words turn <span class="highlight-green">green</span></li>
                <li>If you say the wrong word, you'll need to try again</li>
                <li>If you don't speak for 5 seconds, the system will read the word as a hint</li>
                <li>Use "Pause" to take a break (timer pauses) and "Continue" to resume</li>
                <li>Your WPM (Words Per Minute) score is calculated in real-time</li>
                <li>Complete all words to see your final WPM score!</li>
            </ol>
            </div>
        </div>
      </div>

    </div>
    
    <div v-if="showResultModal" class="modal-backdrop" @click.self="showResultModal = false">
      <div class="modal-card">
        <button class="modal-close" @click="showResultModal = false">×</button>
        <h2 class="modal-title">🎉 Great job!</h2>
        <p class="modal-text">You completed the reading session.</p>
        <div class="stats-box">
          <p><strong>📊 Words Per Minute (WPM):</strong> {{ resultStats.wpm }}</p>
          <p><strong>⏱️ Time Taken:</strong> {{ resultStats.time }}</p>
        </div>
        <button class="btn-modal" @click="showResultModal = false">OK</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* General Styles */
.content-wrapper {
  max-width: 1400px;
  margin: 50px auto;
  padding: 0 20px;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}


.btn {
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  font-size: 20px;
}

.btn-resume {
  background: #4caf50;
}

.btn-resume:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-pause {
  background: #ffa726;
}

.btn-pause:hover:not(:disabled) {
  background: #fb8c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 167, 38, 0.3);
}

.btn-stop {
  background: #ef5350;
}

.btn-stop:hover:not(:disabled) {
  background: #e53935;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 83, 80, 0.3);
}

/* Custom Dropdown Styling */
.custom-dropdown {
  position: relative;
}

.dropdown-button {
  padding: 16px 24px;
  border: 3px solid #b8a8e8;
  border-radius: 20px;
  background: #d4c5f9;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2d2d2d;
  font-family: inherit;
  transition: all 0.3s ease;
  min-width: 180px;
}

.dropdown-button:hover {
  background: #c9b8f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(184, 168, 232, 0.4);
}

.level-icon {
  font-size: 20px;
}

.level-text {
  flex: 1;
  text-align: left;
}

.dropdown-arrow {
  font-size: 12px;
  margin-left: 4px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 3px solid #b8a8e8;
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 240px;
}

.dropdown-item {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  font-size: 17px;
  font-weight: 600;
  color: #2d2d2d;
}

.dropdown-item:hover {
  background: #f0f0f0;
}

.dropdown-item.active {
  background: #d4c5f9;
}

.dropdown-item .level-icon {
  font-size: 20px;
}

.dropdown-item .level-text {
  flex: 1;
  text-align: left;
}

.dropdown-item .level-arrow {
  font-size: 12px;
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 600;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2196f3;
}

/* Progress Bar */
.progress-container {
  margin-bottom: 30px;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.5s ease;
  border-radius: 15px;
}

.progress-text {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #555;
}

/* Content Display */
.content-display {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}

.content-display p {
  text-align: center;
  font-size: 18px;
  color: #666;
}

.error {
  color: #ef5350;
}

.reading-content {
  width: 100%;
}

.words-container {
  font-size: 28px;
  line-height: 2.5;
  margin-bottom: 30px;
  text-align: left;
}

.word {
  display: inline-block;
  margin: 0 8px 12px 0;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.word-pending {
  background: #f5f5f5;
  color: #999;
}

.word-current {
  background: #ffeb3b;
  color: #000;
  font-weight: 700;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 235, 59, 0.5);
  animation: pulse 1s infinite;
}

.word-completed {
  background: #4caf50;
  color: white;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1.15);
  }
}

/* Transcript Display */
.transcript-display {
  background: #f0f7ff;
  border: 2px solid #2196f3;
  border-radius: 12px;
  padding: 20px;
  margin: 30px 0;
}

.transcript-label {
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 10px;
}

.transcript-text {
  font-size: 20px;
  color: #333;
  min-height: 30px;
  font-style: italic;
}

.wrong-attempts {
  margin-top: 15px;
  padding: 10px;
  background: #ffebee;
  border-radius: 8px;
  color: #c62828;
  font-weight: 600;
  text-align: center;
}

.hint-info {
  margin-top: 15px;
  padding: 10px;
  background: #fff9c4;
  border-radius: 8px;
  color: #f57f17;
  font-weight: 600;
  text-align: center;
  font-size: 14px;
}

/* Paused Display */
.paused-display {
  background: #fff3e0;
  border: 2px solid #ffa726;
  border-radius: 12px;
  padding: 20px;
  margin: 30px 0;
  text-align: center;
}

.paused-label {
  font-size: 20px;
  font-weight: 600;
  color: #f57c00;
  margin-bottom: 10px;
}

.paused-text {
  font-size: 18px;
  color: #555;
  margin-bottom: 10px;
}

.paused-stats {
  font-size: 16px;
  color: #777;
  font-style: italic;
}

/* Instructions */
.instructions {
  background: #e3f2fd;
  border-radius: 12px;
  padding: 25px;
  margin-top: 30px;
}

.instructions h3 {
  color: #1976d2;
  margin-bottom: 15px;
  font-size: 20px;
}

.instructions ol {
  margin-left: 20px;
  line-height: 1.8;
  color: #555;
}

.instructions li {
  margin-bottom: 8px;
}

.highlight-yellow {
  background: #ffeb3b;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.highlight-green {
  background: #4caf50;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

/* Completion Message */
.completion-message {
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  color: white;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  margin-top: 30px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Next Button Styling */
.btn-next {
  background: #2196f3;
}

.btn-next:hover:not(:disabled) {
  background: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

/* ----- Title Section Styling ----- */
.title-wrapper {
  text-align: center;
  margin-top: 60px;
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
}

.title-wrapper h1 {
  font-size: 48px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.title-wrapper p {
  font-size: 20px;
  color: #555;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .title-wrapper h1 {
    font-size: 36px;
  }

  .title-wrapper p {
    font-size: 16px;
    padding: 0 10px;
  }
}

/* Responsive title tweaks for your WaveHeader layout */
.title-wrapper .titlePart { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; margin-top: 40px !important; margin-bottom: 40px !important; padding: 0 10vw !important; width: 100%; }
.title-wrapper .dw-head .head-row { display: flex !important; justify-content: center !important; align-items: center !important; }
.title-wrapper .dw-head h1 { text-align: center !important; font-size: clamp(36px, 4vw, 56px) !important; margin-bottom: 10px !important; color: #1a1a1a !important; font-weight: 800 !important; letter-spacing: 0.5px !important; }
.title-wrapper .dw-head p { text-align: center !important; margin: 0 auto !important; color: #555 !important; transform: none !important; line-height: 1.6 !important; max-width: 800px !important; font-size: clamp(18px, 2.5vw, 22px) !important; }
.title-wrapper .dw-head { animation: fadeInUp 0.6s ease-out; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-container {
  background-color: #fdf8ea;
}

/* --- Result Modal (larger, more prominent) --- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  z-index: 9999;
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  padding: 50px 60px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 650px;
  width: 90%;
  position: relative;
  animation: fadeInUp 0.3s ease;
}

.modal-title {
  font-size: 2.2rem;
  margin-bottom: 20px;
  color: #333;
  font-weight: 700;
}

.modal-text {
  color: #555;
  margin-bottom: 25px;
  font-size: 1.2rem;
  line-height: 1.8;
}

.stats-box {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 25px 30px;
  margin-bottom: 30px;
  line-height: 1.8;
  font-size: 1.1rem;
  text-align: left;
  border: 1px solid #ddd;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
}

.modal-close:hover {
  color: #000;
}

.btn-modal {
  background: #4CAF50;
  color: #fff;
  border: none;
  padding: 14px 35px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal:hover {
  background: #45a049;
  transform: translateY(-2px);
}
</style>
