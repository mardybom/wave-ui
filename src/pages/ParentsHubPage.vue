<!-- ==========================================================
Component: ParentHubPage.vue
==========================================================

This component represents the Parent Hub main page of the application.
It renders three key parts: a navigation bar (`NavBar.vue`), a FAQ/myths
section (`ParentsFaqMyths`), and a chatbot (`ChatBot.vue`).

Now it uses the global `apiPost()` helper for backend calls, which
automatically handles authentication and base URL from environment vars.

========================================================== -->

<script setup>
import NavBar from '@/components/NavBar.vue'
import ParentsFaqMyths from '@/components/ParentsHub/myths.vue'
import ChatBot from '@/components/ChatBot.vue'
import { ref } from 'vue'
import { apiPost } from '@/utils/api'  //  use the shared API helper

const isChatOpen = ref(false)

/**
 * Handles sending the user's question to the backend API and returns a structured response
 * for the ChatBot component (answer + cleaned sources + optional disclaimer).
 *
 * - Uses apiPost('/parent_chat', { question, kb_hit })
 * - Cleans markdown labels to prevent unwanted auto-linking
 * - Hides disclaimer for refusal answers
 */
async function handleSend(text) {
  try {
    //  Call shared API helper
    const json = await apiPost('/parent_chat', { question: text, kb_hit: '' })

    const ZWNBSP = '\u2060' // zero-width no-break space
    const rawSources = json?.data?.sources ?? []

    // Process markdown sources
    const processedSources = rawSources.map((src) => {
      const m = src.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (!m) return src
      const displayText = m[1].replace(/\./g, `.${ZWNBSP}`)
      const url = m[2]
      return `${displayText}(${url})`
    })

    const answer = json?.data?.answer ?? 'Sorry, something went wrong.'
    let disclaimer = json?.data?.disclaimer ?? ''

    if (answer.trim() === "Sorry, I can't answer this question.") {
      disclaimer = ''
    }

    return { answer, sources: processedSources, disclaimer }

  } catch (error) {
    console.error('❌ ParentHub API Error:', error)
    return {
      answer: 'Sorry, something went wrong while contacting the chatbot.',
      sources: [],
      disclaimer: ''
    }
  }
}
</script>

<template>
  <NavBar />

  <!-- 顶部波浪背景 -->
  <div class="sky" aria-hidden="true">
    <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
      <path
        d="M0,100 
           C180,180 360,20 540,100 
           C720,180 1000,20 1080,100 
           C1260,180 1440,20 1440,100 
           L1440,0 L0,0 Z"
        fill="#CFEFFF"
      />
    </svg>
  </div>

  <!-- 家长常见误区 / FAQ 模块 -->
  <div class="faq-wrapper">
    <ParentsFaqMyths />
  </div>

  <!-- 聊天机器人 -->
  <ChatBot
    v-model="isChatOpen"
    title="Dyslexia Chatbot"
    :participants="[{ id: 'bot', name: 'Dyslexia Helper' }]"
    :initialMessages="[
      { 
        type:'text', 
        author:'bot', 
        data:{ text: `Hi! I'm here to answer your questions about dyslexia.` } 
      }
    ]"
    :onSend="handleSend"
  />
</template>

<style scoped>
.faq-wrapper {
  width: 100vw;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.sky {
  position: absolute;
  top: var(--nav-h);
  left: 0; right: 0;
  height: 200px;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}
.wave {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 50%;
}
.sc-launcher { position: fixed !important; z-index: 99999 !important; }

@media (max-width: 720px) {
  .faq-wrapper {
    transform: scale(0.8);
    transform-origin: top center;
  }
}
</style>