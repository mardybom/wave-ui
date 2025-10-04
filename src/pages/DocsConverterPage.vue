<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

const fileInput = ref(null)
const isProcessing = ref(false)
const statusMessage = ref('')
const progress = ref(0)

let pdfjsLib = null
let pdfMake = null

onMounted(async () => {
  // Load pdf.js
  pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/+esm')
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs'
  
  // Load pdfmake
  pdfMake = window.pdfMake
  
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
  if (!file || file.type !== 'application/pdf') {
    statusMessage.value = 'Please select a valid PDF file'
    return
  }
  
  await processPDF(file)
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
      }
      
      // Add page break except for last page
      if (i < pdf.numPages) {
        content.push({ text: '', pageBreak: 'after' })
      }
      
      progress.value = 30 + (i / pdf.numPages) * 50
    }
    
    statusMessage.value = 'Generating new PDF with OpenDyslexic font...'
    progress.value = 85
    
    // Create new PDF with OpenDyslexic font
    const docDefinition = {
      content: content,
      defaultStyle: {
        font: 'OpenDyslexic',
        fontSize: 12,
        lineHeight: 1.5
      },
      pageMargins: [60, 60, 60, 60]
    }
    
    pdfMake.createPdf(docDefinition).download('converted-opendyslexic.pdf')
    
    statusMessage.value = 'PDF converted successfully!'
    progress.value = 100
    
    // Reset after 1 seconds
    setTimeout(() => {
      isProcessing.value = false
      statusMessage.value = ''
      progress.value = 0
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }, 1000)
    
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
</script>

<template>
  <NavBar />
  
  <div class="container">
    <div class="upload-section">
      <h1>PDF to OpenDyslexic Converter</h1>
      <p class="description">
        Upload a PDF file to convert its text to the OpenDyslexic font, 
        which is designed to improve readability for people with dyslexia.
      </p>
      
      <input 
        ref="fileInput"
        type="file" 
        accept="application/pdf"
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
        {{ isProcessing ? 'Processing...' : 'Upload PDF' }}
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
      
      <div v-else-if="statusMessage" class="status-message success">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
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
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 32px;
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
</style>