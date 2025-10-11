<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import GameTopBar from '@/components/GameTopBar.vue'
import WaveHeader from '@/components/WaveHeader.vue'
import GameTitleNDescribe from '@/components/GameTitleNDescribe.vue'
import '@/assets/readingSpeed.css'
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

async function handleNext() {
  // Reset all progress
  currentWordIndex.value = 0
  transcript.value = ''
  wrongAttempts.value = 0
  resetTimer()
  isNextAvailable.value = false
  finalWPM.value = 0
  isReading.value = false
  isPaused.value = false

  // Fetch new content for the same level
  await fetchContent()

  // Optional: auto-start reading again
  // handleStartReading()
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
        
        <button 
          class="btn"
          :class="isNextAvailable ? 'btn-next' : 'btn-stop'"
          @click="isNextAvailable ? handleNext() : handleStop()"
        >
          <span class="icon">{{ isNextAvailable ? '➡️' : '⏹' }}</span>
          {{ isNextAvailable ? 'Next' : 'Stop Reading' }}
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
  </div>
</template>