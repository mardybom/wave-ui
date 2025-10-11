<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import GameTopBar from '@/components/GameTopBar.vue'
import WaveHeader from '@/components/WaveHeader.vue'
import GameTitleNDescribe from '@/components/GameTitleNDescribe.vue'

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
const showInstructions = ref(false) // Add this line

// WPM tracking
const startTime = ref(0)
const elapsedTime = ref(0)
const timerInterval = ref(null)
const finalWPM = ref(0)

// const API = `${import.meta.env.VITE_API_CONTENT}/consent/list`
const API = `${import.meta.env.VITE_API_SENTENCE}/sentence/next`

const levels = [
  { value: 'Easy', label: 'Easy', icon: '🌱' },
  { value: 'Medium', label: 'Medium', icon: '🌿' },
  { value: 'Hard', label: 'Hard', icon: '🌳' },
  { value: 'Extremely hard', label: 'Extremely hard', icon: '🔥' }
]

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
  try {
    loading.value = true
    
    // HARDCODED STRING - Replace with your text
    currentContent.value = `With your consent we can show you content that truly matches your apple`
    
    // Split content into words
    words.value = currentContent.value.split(' ').map(word => word.trim()).filter(word => word.length > 0)
    
    loading.value = false
    
    // Comment out the actual API call for now
    /*
    const res = await fetch(API, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    contentList.value = data.data || []
    if (contentList.value.length > 0) {
      currentContent.value = contentList.value[0].text
      words.value = currentContent.value.split(' ')
      currentWordIndex.value = 0
    }
    */
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Failed to load content.'
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
  
  // Stop timer
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
  
  // Show completion message with WPM
  setTimeout(() => {
    alert(`🎉 Great job! You completed the reading!\n\n📊 Your reading speed: ${finalWPM.value} WPM\n⏱️ Time taken: ${formattedTime.value}`)
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
    <GameTitleNDescribe
      title="Reading Practice"
      description="Read the text aloud and watch the words highlight as you go!"
    />

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
        >
          <span class="icon">⏹</span> Stop Reading
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

      <!-- Completion Message -->
      <div v-if="isComplete && !loading" class="completion-message">
        <div class="completion-title">🎉 Congratulations! 🎉</div>
        <div class="completion-subtitle">You've completed the reading!</div>
        <div class="completion-stats">
          <div class="completion-stat">
            <div class="completion-stat-label">Final WPM</div>
            <div class="completion-stat-value">{{ finalWPM }}</div>
          </div>
          <div class="completion-stat">
            <div class="completion-stat-label">Total Time</div>
            <div class="completion-stat-value">{{ formattedTime }}</div>
          </div>
          <div class="completion-stat">
            <div class="completion-stat-label">Words Read</div>
            <div class="completion-stat-value">{{ words.length }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100vw;
  position: relative;
  background: #f5f5f5;
}

.content-wrapper {
  max-width: 1400px;
  margin: 50px auto;
  padding: 0 20px;
}

.control-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
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
}
</style>