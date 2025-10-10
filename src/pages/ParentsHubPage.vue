<!--
==========================================================
Component: ParentHubPage.vue
==========================================================

This component represents the Parent Hub main page of the application.
It renders three key parts: a navigation bar (`NavBar.vue`), a FAQ/myths
section (`ParentsFaqMyths`), and a chatbot (`ChatBot.vue`).

The component handles communication between the chatbot interface and the backend API.
When a user sends a message, it:
1. Sends the question to the backend.
2. Receives and parses the JSON response.
3. Cleans and formats the `sources` to prevent auto-linking.
4. Checks the `answer` for refusal messages.
5. Passes a clean, structured result back to the ChatBot component for display.

Dependencies:
- Vue 3 Composition API (`ref`)
- Environment variable `VITE_API_SENTENCE` for backend URL
- Child components: `NavBar`, `ParentsFaqMyths`, `ChatBot`

==========================================================
组件：ParentHubPage.vue
==========================================================

页面包含三个主要区域：导航栏、家长常见误区（FAQ/Myths）以及聊天机器人。
该组件负责把用户问题转发给后端并清洗返回数据（处理 sources/免责声明），
然后把标准化结果交给 ChatBot 显示；同时展示 Myths 区块与顶部波浪背景。
-->

<script setup>
import NavBar from '@/components/NavBar.vue'
import ParentsFaqMyths from '@/components/ParentsHub/myths.vue'
import ChatBot from '@/components/ChatBot.vue'
import { ref } from 'vue'

const isChatOpen = ref(false)
const API_BASE = import.meta.env.VITE_API_SENTENCE
const API_URL = `${API_BASE}/parent_chat`

/**
 * Handles sending the user's question to the backend API and returns a structured response
 * for the ChatBot component (answer + cleaned sources + optional disclaimer).
 *
 * - POST to `/parent_chat`
 * - Insert \u2060 after every dot in [text] of markdown links to avoid auto-linking the label
 * - Reformat to `text(url)` so only URL stays clickable
 * - Drop disclaimer if the reply is the standard refusal line
 */
async function handleSend(text) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: text, kb_hit: '' }),
  });
  const json = await res.json();

  const ZWNBSP = '\u2060'; // zero-width no-break space

  const rawSources = json?.data?.sources ?? [];
  const processedSources = rawSources.map((src) => {
    // Expect markdown: [label](url)
    const m = src.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!m) return src;
    const displayText = m[1].replace(/\./g, `.${ZWNBSP}`); // break all dots in label
    const url = m[2];
    return `${displayText}(${url})`; // keep url clickable, label plain
  });

  const answer = json?.data?.answer ?? 'Sorry, something went wrong.';
  let disclaimer = json?.data?.disclaimer ?? '';

  // If refusal, hide disclaimer
  if (answer.trim() === "Sorry, I can't answer this question.") {
    disclaimer = '';
  }

  return {
    answer,
    sources: processedSources,
    disclaimer
  };
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
  <ParentsFaqMyths />

  <!-- 聊天机器人 -->
  <ChatBot
    v-model="isChatOpen"
    title="Dyslexia Chatbot"
    :participants="[{ id: 'bot', name: 'Dyslexia Helper' }]"
    :initialMessages="[{ type:'text', author:'bot', data:{ text: `Hi! I'm here to answer your questions about dyslexia.` }}]"
    :onSend="handleSend"
  />
</template>

<style scoped>
.sky{
  position: absolute;
  top: var(--nav-h);
  left: 0; right: 0;
  height: 200px;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}
.wave{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 50%;
}
.sc-launcher { position: fixed !important; z-index: 99999 !important; }
</style>