<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import GameTopBar from '@/components/GameTopBar.vue'
import WaveHeader from '@/components/WaveHeader.vue'
import GameTitleNDescribe from '@/components/GameTitleNDescribe.vue'
import { apiPost } from '@/utils/api'

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
const resultStats = ref({
  wpm: 0,
  time: '',
})

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

console.log('Requested level:', selectedLevel.value)

const isComplete = computed(() => {
  return currentWordIndex.value >= words.value.length
})

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

async function fetchContent() {
  loading.value = true
  try {
    const data = await apiPost('/reading_speed', { level: selectedLevel.value })
    const { text, word_count } = data.data
    currentContent.value = text
    wordCount.value = word_count
    words.value = text.split(' ').map(w => w.trim()).filter(w => w.length > 0)
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Failed to load reading content.'
  } finally {
    loading.value = false
  }
}

function startTimer() {
  startTime.value = Date.now() - (elapsedTime.value * 1000)
  timerInterval.value = setInterval(() => {
    elapsedTime.value = (Date.now() - startTime.value) / 1000
  }, 100) // Update every 100ms for smooth display
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

function toggleInstructions() {
  showInstructions.value = !showInstructions.value
}

function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    errorMsg.value = 'Speech recognition is not supported in your browser. Please use Chrome or Edge.'
    return false
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition.value = new SpeechRecognition()
  recognition.value.continuous = true
  recognition.value.interimResults = true
  recognition.value.lang = 'en-US'

  recognition.value.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcriptPiece = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcriptPiece
      } else {
        interimTranscript += transcriptPiece
      }
    }

    transcript.value = (finalTranscript + interimTranscript).trim()
    
    // Reset hint timer when user speaks
    if (transcript.value.length > 0) {
      lastWordTime.value = Date.now()
      resetHintTimer()
    }
    
    checkWord(transcript.value)
  }

  recognition.value.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    if (event.error === 'no-speech') {
      // Restart recognition if no speech detected
      if (isReading.value && !isPaused.value) {
        recognition.value.start()
      }
    }
  }

  recognition.value.onend = () => {
    if (isReading.value && !isPaused.value && !isComplete.value) {
      // Restart recognition if still reading
      try {
        recognition.value.start()
      } catch (e) {
        console.log('Recognition restart failed:', e)
      }
    }
  }

  return true
}

function resetHintTimer() {
  // Clear existing timer
  if (hintTimer.value) {
    clearTimeout(hintTimer.value)
    hintTimer.value = null
  }

  // Set new timer only if reading and not paused
  if (isReading.value && !isPaused.value && !isComplete.value) {
    hintTimer.value = setTimeout(() => {
      speakHint()
    }, 5000) // 5 seconds
  }
}

function speakHint() {
  if (currentWordIndex.value >= words.value.length || !isReading.value || isPaused.value) {
    return
  }

  const currentWord = words.value[currentWordIndex.value]
  
  // Use Web Speech API for text-to-speech
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(currentWord)
    utterance.rate = 0.8 // Slower speech for clarity
    utterance.pitch = 1
    utterance.volume = 1
    
    // Optional: Add a brief pause before speaking
    utterance.onstart = () => {
      console.log('Speaking hint:', currentWord)
    }
    
    utterance.onend = () => {
      // Reset timer after hint is spoken
      resetHintTimer()
    }
    
    window.speechSynthesis.speak(utterance)
  }
}

function normalizeWord(word) {
  // Remove punctuation and convert to lowercase
  return word.toLowerCase().replace(/[.,!?;:'"]/g, '')
}

function checkWord(spokenText) {
  if (currentWordIndex.value >= words.value.length) {
    handleComplete()
    return
  }

  const currentWord = normalizeWord(words.value[currentWordIndex.value])
  const spokenWords = spokenText.toLowerCase().split(' ')
  
  // Check if the current word is in the spoken text
  for (let i = 0; i < spokenWords.length; i++) {
    const spokenWord = normalizeWord(spokenWords[i])
    
    if (spokenWord === currentWord) {
      // Correct word! Move to next
      currentWordIndex.value++
      transcript.value = '' // Reset transcript for next word
      wrongAttempts.value = 0
      lastWordTime.value = Date.now()
      
      // Check if reading is complete
      if (currentWordIndex.value >= words.value.length) {
        handleComplete()
      }
      break
    } else if (spokenWord.length > 0 && !currentWord.startsWith(spokenWord.substring(0, 2))) {
      // Wrong word spoken
      wrongAttempts.value++
      transcript.value = '' // Reset to try again
      lastWordTime.value = Date.now()
      resetHintTimer() // Reset timer on wrong attempt
    }
  }
}

function handleComplete() {
  isReading.value = false
  isPaused.value = false
  
  // Calculate final WPM
  if (elapsedTime.value > 0) {
    const minutes = elapsedTime.value / 60
    finalWPM.value = Math.round(words.value.length / minutes)
  }
  
  pauseTimer()
  
  if (hintTimer.value) {
    clearTimeout(hintTimer.value)
    hintTimer.value = null
  }
  
  if (recognition.value) {
    recognition.value.stop()
  }
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }

  //NEW — enable Next button
  isNextAvailable.value = true

  setTimeout(() => {
    resultStats.value = {
      wpm: finalWPM.value,
      time: formattedTime.value
    }
    showResultModal.value = true
  }, 500)

}


function handleStartReading() {
  if (!recognition.value) {
    const initialized = initSpeechRecognition()
    if (!initialized) return
  }

  isReading.value = true
  isPaused.value = false
  
  // Only reset if starting fresh (not continuing from pause)
  if (currentWordIndex.value === 0 || isComplete.value) {
    currentWordIndex.value = 0
    wrongAttempts.value = 0
    resetTimer()
  }
  
  // Start timer
  startTimer()
  
  transcript.value = ''
  lastWordTime.value = Date.now()
  
  try {
    recognition.value.start()
  } catch (e) {
    console.log('Recognition already started')
  }
  
  // Start hint timer
  resetHintTimer()
}

function handlePauseOrContinue() {
  if (isPaused.value) {
    // Continue from where we paused
    isPaused.value = false
    isReading.value = true
    lastWordTime.value = Date.now()
    
    // Resume timer
    startTimer()
    
    try {
      recognition.value.start()
    } catch (e) {
      console.log('Recognition already started')
    }
    
    // Restart hint timer
    resetHintTimer()
  } else {
    // Pause - save the current state
    isPaused.value = true
    isReading.value = false
    
    // Pause timer
    pauseTimer()
    
    // Clear hint timer
    if (hintTimer.value) {
      clearTimeout(hintTimer.value)
      hintTimer.value = null
    }
    
    if (recognition.value) {
      recognition.value.stop()
    }
    
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }
}

function handleStop() {
  isReading.value = false
  isPaused.value = false
  currentWordIndex.value = 0
  transcript.value = ''
  wrongAttempts.value = 0
  
  // Reset timer
  resetTimer()
  
  // Clear hint timer
  if (hintTimer.value) {
    clearTimeout(hintTimer.value)
    hintTimer.value = null
  }
  
  if (recognition.value) {
    recognition.value.stop()
  }
  
  // Cancel any ongoing speech
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

async function handleNext() {
  isNextAvailable.value = false
  loading.value = true
  // Reset all progress
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

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function selectLevel(level) {
  selectedLevel.value = level
  isDropdownOpen.value = false
  console.log('Level changed to:', selectedLevel.value)
  // Fetch new content based on level
  handleStop()
  fetchContent()
}

function getCurrentLevelIcon() {
  const level = levels.find(l => l.value === selectedLevel.value)
  return level ? level.icon : '🌱'
}

function getWordClass(index) {
  // If reading is complete, all words should be green
  if (isComplete.value) {
    return 'word-completed'
  }
  
  if (index < currentWordIndex.value) {
    return 'word-completed'
  } else if (index === currentWordIndex.value) {
    return 'word-current'
  } else {
    return 'word-pending'
  }
}

onMounted(() => {
  fetchContent()
  initSpeechRecognition()
})
</script>

<template>
  <div class="page-container">
    <GameTopBar title="Reading Practice" />
    <WaveHeader top="80px" height="200px" zIndex="0" />

    <!-- - Wrap this component -->
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
        
        <!-- Stop Reading Button (always visible) -->
        <button 
          class="btn btn-stop"
          @click="handleStop"
          :disabled="!isReading && !isPaused && !isComplete"
        >
          <span class="icon">⏹</span> Stop Reading
        </button>

        <!-- Next Button (always visible, but only active when complete) -->
        <button 
          class="btn btn-next"
          @click="handleNext"
        >
          <span class="icon">➡️</span> Next
        </button>


        <!-- Custom Dropdown -->
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

      <!-- WPM and Timer Display -->
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

      <!-- Reading Progress -->
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

      <!-- Content Display -->
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
          
          <!-- Live Transcript Display -->
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

          <!-- Paused Message -->
          <div v-if="isPaused" class="paused-display">
            <div class="paused-label">⏸️ Reading Paused</div>
            <div class="paused-text">Click "Continue" to resume from word {{ currentWordIndex + 1 }}</div>
            <div class="paused-stats">Timer paused at {{ formattedTime }}</div>
          </div>

          <!-- Instructions -->
          <div class="instructions-toggle">
            <button 
                class="btn-instructions" 
                @click="toggleInstructions"
            >
                <span class="icon">{{ showInstructions ? '📖' : '❓' }}</span>
                {{ showInstructions ? 'Hide Instructions' : 'Show Instructions' }}
            </button>
            </div>

            <!-- Instructions (conditionally shown) -->
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
    <!-- Result Popup Modal -->
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

@media (max-width: 768px) {
  .control-buttons {
    gap: 12px;
  }
  
  .btn {
    padding: 12px 24px;
    font-size: 16px;
  }
  
  .content-display {
    padding: 24px;
  }
  
  .dropdown-button {
    min-width: 160px;
    padding: 12px 20px;
  }

  .words-container {
    font-size: 22px;
    line-height: 2;
  }

  .word {
    margin: 0 6px 10px 0;
    padding: 6px 10px;
  }
}

/* Instructions Toggle */
.instructions-toggle {
  margin-top: 30px;
  text-align: center;
}

.btn-instructions {
  padding: 12px 24px;
  border: 2px solid #2196f3;
  border-radius: 12px;
  background: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2196f3;
  font-family: inherit;
}

.btn-instructions:hover {
  background: #e3f2fd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-instructions .icon {
  font-size: 18px;
}

/* Instructions - add slide animation */
.instructions {
  background: #e3f2fd;
  border-radius: 12px;
  padding: 25px;
  margin-top: 20px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
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
  margin-top: 60px;        /* pushes it nicely below the wave */
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

/* Responsive scaling for tablets/mobiles */
@media (max-width: 768px) {
  .title-wrapper h1 {
    font-size: 36px;
  }

  .title-wrapper p {
    font-size: 16px;
    padding: 0 10px;
  }
}

/* ---------------- Page-Specific Fix: ReadingSpeed ---------------- */
.title-wrapper .titlePart {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  margin-top: 40px !important;
  margin-bottom: 40px !important;
  padding: 0 10vw !important;
  width: 100%;
}

/* Center the title (h1) */
.title-wrapper .dw-head .head-row {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

.title-wrapper .dw-head h1 {
  text-align: center !important;
  font-size: clamp(36px, 4vw, 56px) !important;
  margin-bottom: 10px !important;
  color: #1a1a1a !important;
  font-weight: 800 !important;
  letter-spacing: 0.5px !important;
}

/* Center the description text */
.title-wrapper .dw-head p {
  text-align: center !important;
  margin: 0 auto !important;
  color: #555 !important;
  transform: none !important;   /* Removes the translateX(30px) offset */
  line-height: 1.6 !important;
  max-width: 800px !important;
  font-size: clamp(18px, 2.5vw, 22px) !important;
}

/* Optional: smooth fade-in animation (looks great below WaveHeader) */
.title-wrapper .dw-head {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
  max-width: 650px;       /* Increased width */
  width: 90%;
  position: relative;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  font-size: 2.2rem;       /* Bigger title */
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
  padding: 25px 30px;      /* More breathing room */
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
  font-size: 28px;         /* Bigger close icon */
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
  padding: 14px 35px;      /* Bigger button */
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