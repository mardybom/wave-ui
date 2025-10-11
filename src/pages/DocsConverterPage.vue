<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import WaveHeader from '@/components/WaveHeader.vue'

const fileInput = ref(null)
const isProcessing = ref(false)
const statusMessage = ref('')
const progress = ref(0)
const extractedText = ref('')
const pdfBlob = ref(null)
const currentFileName = ref('')
const isReading = ref(false)
const isPaused = ref(false)
const currentWordIndex = ref(-1)
const words = ref([])
const utterance = ref(null)
const isInstructionsOpen = ref(false)

let pdfjsLib = null
let pdfMake = null
let Tesseract = null

onMounted(async () => {
  // Load pdf.js
  pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/+esm')
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs'
  
  // Load Tesseract.js
  const tesseractModule = await import('https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/+esm')
  Tesseract = tesseractModule.default
  
  // Load pdfmake
  const pdfMakeModule = await import('https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/+esm')
  pdfMake = pdfMakeModule.default
  
  // Register OpenDyslexic font
  if (pdfMake) {
    pdfMake.fonts = {
      OpenDyslexic: {
        normal: 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/ttf/OpenDyslexic-Regular.ttf',
        bold: 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/ttf/OpenDyslexic-Bold.ttf',
        italics: 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/ttf/OpenDyslexic-Italic.ttf',
        bolditalics: 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/ttf/OpenDyslexic-BoldItalic.ttf'
      }
    }
  }
})

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) {
    statusMessage.value = 'Please select a file'
    return
  }
  
  // Reset previous state
  extractedText.value = ''
  pdfBlob.value = null
  currentFileName.value = ''
  stopReading()
  
  const fileType = file.type
  const imageTypes = ['image/bmp', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/x-portable-bitmap']
  
  if (fileType === 'application/pdf') {
    await processPDF(file)
  } else if (imageTypes.includes(fileType) || file.name.match(/\.(bmp|jpg|jpeg|png|pbm|webp)$/i)) {
    await processImage(file)
  } else {
    statusMessage.value = 'Please select a valid PDF or image file (BMP, JPG, PNG, PBM, WEBP)'
  }
}

const processImage = async (file) => {
  isProcessing.value = true
  statusMessage.value = 'Loading image...'
  progress.value = 10
  
  try {
    statusMessage.value = 'Recognizing text from image...'
    progress.value = 20
    
    // Perform OCR
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const ocrProgress = Math.floor(m.progress * 60)
            progress.value = 20 + ocrProgress
            statusMessage.value = `Recognizing text: ${Math.floor(m.progress * 100)}%`
          }
        }
      }
    )
    
    statusMessage.value = 'Generating PDF with OpenDyslexic font...'
    progress.value = 85
    
    const text = result.data.text.trim()
    
    if (!text) {
      throw new Error('No text found in the image')
    }
    
    currentFileName.value = file.name.replace(/\.[^/.]+$/, '') + '-opendyslexic.pdf'
    
    // Create PDF with extracted text
    const docDefinition = {
      content: [
        {
          text: text,
          fontSize: 12,
          margin: [0, 0, 0, 10]
        }
      ],
      defaultStyle: {
        font: 'OpenDyslexic',
        fontSize: 12,
        characterSpacing: 1.5,
        lineHeight: 2
      },
      pageMargins: [60, 60, 60, 60]
    }
    
    // Generate PDF blob
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      pdfBlob.value = blob
      statusMessage.value = 'Image converted successfully!'
      progress.value = 100
      isProcessing.value = false
      prepareTextForSpeech(text)
    })
    
  } catch (error) {
    console.error('Error processing image:', error)
    statusMessage.value = `Error: ${error.message}`
    isProcessing.value = false
    progress.value = 0
  }
}

const processPDF = async (file) => {
  isProcessing.value = true
  statusMessage.value = 'Loading PDF...'
  progress.value = 10
  
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    statusMessage.value = `Extracting text from ${pdf.numPages} pages...`
    progress.value = 30
    
    const content = []
    let fullText = ''
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      // Extract text items and maintain structure
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .trim()
      
      if (pageText) {
        content.push({
          text: pageText,
          fontSize: 12,
          margin: [0, 0, 0, 10]
        })
        fullText += pageText + ' '
      }
      
      // Add page break except for last page
      if (i < pdf.numPages) {
        content.push({ text: '', pageBreak: 'after' })
      }
      
      progress.value = 30 + (i / pdf.numPages) * 50
    }
    
    statusMessage.value = 'Generating new PDF with OpenDyslexic font...'
    progress.value = 85
    
    currentFileName.value = file.name.replace(/\.[^/.]+$/, '') + '-opendyslexic.pdf'
    
    // Create new PDF with OpenDyslexic font
    const docDefinition = {
      content: content,
      defaultStyle: {
        font: 'OpenDyslexic',
        fontSize: 12,
        characterSpacing: 1.5,
        lineHeight: 2
      },
      pageMargins: [60, 60, 60, 60]
    }
    
    // Generate PDF blob
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      pdfBlob.value = blob
      statusMessage.value = 'PDF converted successfully!'
      progress.value = 100
      isProcessing.value = false
      prepareTextForSpeech(fullText.trim())
    })
    
  } catch (error) {
    console.error('Error processing PDF:', error)
    statusMessage.value = `Error: ${error.message}`
    isProcessing.value = false
    progress.value = 0
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const prepareTextForSpeech = (text) => {
  // Split text into words, preserving punctuation
  words.value = text.match(/\S+/g) || []
  // Normalize extractedText to match how words are split (single spaces only)
  extractedText.value = words.value.join(' ')
  currentWordIndex.value = -1
}

const startReading = () => {
  if (!extractedText.value || !('speechSynthesis' in window)) {
    return
  }
  
  if (isPaused.value) {
    window.speechSynthesis.resume()
    isPaused.value = false
    isReading.value = true
    return
  }
  
  stopReading()
  
  utterance.value = new SpeechSynthesisUtterance(extractedText.value)
  utterance.value.rate = 0.9
  utterance.value.pitch = 1
  utterance.value.volume = 1
  
  utterance.value.onboundary = (event) => {
    if (event.name === 'word' && event.charIndex !== undefined) {
      // Find which word index corresponds to this character position
      let charCount = 0
      for (let i = 0; i < words.value.length; i++) {
        // Account for the word and the space after it
        if (charCount <= event.charIndex && event.charIndex < charCount + words.value[i].length) {
          currentWordIndex.value = i
          
          // Auto-scroll to current word
          setTimeout(() => {
            const currentWordEl = document.querySelector('.word.current')
            if (currentWordEl) {
              currentWordEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 0)
          break
        }
        charCount += words.value[i].length + 1 // +1 for space
      }
    }
  }
  
  utterance.value.onend = () => {
    isReading.value = false
    isPaused.value = false
    currentWordIndex.value = -1
  }
  
  utterance.value.onerror = () => {
    isReading.value = false
    isPaused.value = false
    currentWordIndex.value = -1
  }
  
  window.speechSynthesis.speak(utterance.value)
  isReading.value = true
}

const pauseReading = () => {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause()
    isPaused.value = true
    isReading.value = false
  }
}

const stopReading = () => {
  if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
    window.speechSynthesis.cancel()
  }
  isReading.value = false
  isPaused.value = false
  currentWordIndex.value = -1
}

const downloadPDF = () => {
  if (pdfBlob.value && currentFileName.value) {
    const url = URL.createObjectURL(pdfBlob.value)
    const link = document.createElement('a')
    link.href = url
    link.download = currentFileName.value
    link.click()
    URL.revokeObjectURL(url)
  }
}

const toggleInstructions = () => {
  isInstructionsOpen.value = !isInstructionsOpen.value
}
</script>

<template>
  <NavBar />

  <WaveHeader />
  
  <div class="container">
    <div class="upload-section">
      <h1>PDF & Image to OpenDyslexic Converter</h1>
      <p class="description">
        Transform your documents into dyslexia-friendly formats with text-to-speech support.
      </p>
      
      <div class="instructions">
        <button class="instructions-toggle" @click="toggleInstructions">
          <h2>How to Use</h2>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            :class="{ rotated: isInstructionsOpen }"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        
        <div v-show="isInstructionsOpen" class="instructions-content">
          <ol>
            <li><strong>Upload:</strong> Click the button below to select a PDF or image file (BMP, JPG, PNG, PBM, WEBP)</li>
            <li><strong>Convert:</strong> Wait while the app extracts text and converts it to OpenDyslexic font</li>
            <li><strong>Listen:</strong> Use the Play button to hear the text read aloud with word highlighting</li>
            <li><strong>Download:</strong> Save the converted PDF with the OpenDyslexic font for future use</li>
          </ol>
          <p class="tip">💡 <strong>Tip:</strong> Follow along as each word is highlighted while being read aloud. Use Pause to stop temporarily or Stop to restart from the beginning.</p>
        </div>
      </div>
      
      <input 
        ref="fileInput"
        type="file" 
        accept="application/pdf,image/bmp,image/jpeg,image/jpg,image/png,image/webp,.pbm"
        @change="handleFileUpload"
        style="display: none"
      />
      
      <button 
        @click="triggerFileInput"
        :disabled="isProcessing"
        class="upload-btn"
      >
        <svg 
          v-if="!isProcessing" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {{ isProcessing ? 'Processing...' : 'Upload PDF or Image' }}
      </button>
      
      <div v-if="isProcessing" class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <p class="status-message">{{ statusMessage }}</p>
      </div>
      
      <div v-else-if="statusMessage && !extractedText" class="status-message success">
        {{ statusMessage }}
      </div>
    </div>
    
    <!-- Text Display and Controls -->
    <div v-if="extractedText" class="result-section">
      <div class="controls">
        <button 
          @click="startReading"
          :disabled="isReading"
          class="control-btn play-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {{ isPaused ? 'Resume' : 'Play' }}
        </button>
        
        <button 
          @click="pauseReading"
          :disabled="!isReading"
          class="control-btn pause-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          Pause
        </button>
        
        <button 
          @click="stopReading"
          :disabled="!isReading && !isPaused"
          class="control-btn stop-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="5" width="14" height="14" />
          </svg>
          Stop
        </button>
        
        <button 
          @click="downloadPDF"
          class="control-btn download-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
        </button>
      </div>
      
      <div class="text-display">
        <span
          v-for="(word, index) in words"
          :key="index"
          :class="['word', { current: index === currentWordIndex }]"
        >
          {{ word }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.upload-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 16px;
}

.description {
  color: #555;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 24px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.instructions {
  background: #f8f9fa;
  border-left: 4px solid #4CAF50;
  border-radius: 8px;
  padding: 0;
  margin-bottom: 32px;
  text-align: left;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
}

.instructions-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  padding: 20px 28px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.instructions-toggle:hover {
  background: rgba(76, 175, 80, 0.05);
}

.instructions-toggle h2 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin: 0;
  text-align: left;
}

.instructions-toggle svg {
  flex-shrink: 0;
  transition: transform 0.3s ease;
  color: #4CAF50;
}

.instructions-toggle svg.rotated {
  transform: rotate(180deg);
}

.instructions-content {
  padding: 0 28px 24px 28px;
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

.instructions ol {
  margin: 0 0 16px 0;
  padding-left: 24px;
}

.instructions li {
  color: #444;
  font-size: 0.95rem;
  line-height: 1.8;
  margin-bottom: 10px;
}

.instructions li strong {
  color: #2c3e50;
  font-weight: 600;
}

.instructions .tip {
  background: #fff;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 0;
  font-size: 0.9rem;
  color: #555;
  border: 1px solid #e0e0e0;
}

.instructions .tip strong {
  color: #4CAF50;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.upload-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.progress-container {
  margin-top: 32px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.status-message {
  color: #666;
  font-size: 14px;
  margin-top: 12px;
}

.status-message.success {
  color: #4CAF50;
  font-weight: 600;
  margin-top: 24px;
}

.result-section {
  margin-top: 32px;
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.control-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-btn {
  background: #4CAF50;
  color: white;
}

.play-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.pause-btn {
  background: #FF9800;
  color: white;
}

.pause-btn:hover:not(:disabled) {
  background: #F57C00;
  transform: translateY(-2px);
}

.stop-btn {
  background: #f44336;
  color: white;
}

.stop-btn:hover:not(:disabled) {
  background: #d32f2f;
  transform: translateY(-2px);
}

.download-btn {
  background: #2196F3;
  color: white;
}

.download-btn:hover {
  background: #1976D2;
  transform: translateY(-2px);
}

.text-display {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  line-height: 2.5;
  font-size: 16px;
  text-align: left;
  max-height: 500px;
  overflow-y: auto;
  font-family: 'OpenDyslexic', sans-serif;
}

.word {
  display: inline-block;
  margin-right: 0.4em;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.word.current {
  background: #FFD700;
  color: #000;
  font-weight: bold;
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.4);
}
</style>