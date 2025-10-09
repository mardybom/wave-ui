<!--
==========================================================
Component: ParentHubPage.vue
==========================================================

This component represents the Parent Hub main page of the application.
It renders two key parts: a navigation bar (`NavBar.vue`) and a chatbot (`ChatBot.vue`).

The component handles communication between the chatbot interface and the backend API.
When a user sends a message, it:
1. Sends the question to the backend.
2. Receives and parses the JSON response.
3. Cleans and formats the `sources` to prevent auto-linking.
4. Checks the `answer` for refusal messages.
5. Passes a clean, structured result back to the ChatBot component for display.

This component acts as a container that manages API interaction and
provides a standardized data structure to its child ChatBot.

Dependencies:
- Vue 3 Composition API (`ref`)
- Environment variable `VITE_API_SENTENCE` for backend URL
- Child components: `NavBar`, `ChatBot`

==========================================================
组件：ParentHubPage.vue
==========================================================

此组件是应用程序的家长端主页面（Parent Hub）。
它包含两个核心部分：导航栏 (`NavBar.vue`) 与 聊天机器人 (`ChatBot.vue`)。

该组件负责管理聊天界面与后端 API 之间的通信逻辑。
当用户发送消息时，它会：
1. 将问题发送至后端。
2. 接收并解析 JSON 响应。
3. 对返回的 `sources`（来源链接）进行格式化，防止自动识别为超链接。
4. 检查 `answer` 是否为拒答信息。
5. 将清理后的结果对象传递给 ChatBot 子组件显示。

此组件主要作为一个逻辑容器（container），
负责处理与后端的数据交互，并为子组件提供标准化数据结构。

依赖项：
- Vue 3 Composition API (`ref`)
- 环境变量 `VITE_API_SENTENCE`（用于拼接后端 URL）
- 子组件：`NavBar`、`ChatBot`
-->

<script setup>
import NavBar from '@/components/NavBar.vue'
import ChatBot from '@/components/ChatBot.vue'
import { ref } from 'vue'

const isChatOpen = ref(false)
const API_BASE = import.meta.env.VITE_API_SENTENCE
const API_URL = `${API_BASE}/parent_chat`

/**
 * ==========================================================
 * Function: handleSend
 * ==========================================================
 * 
 * Handles sending the user's question to the backend API and returning the chatbot's structured response.
 * This function is asynchronous and is triggered whenever the user sends a message from the ChatBot.
 * 
 * Workflow:
 * 1. Sends a POST request to the backend endpoint `/parent_chat` with the user's question.
 * 2. Parses the JSON response and extracts `answer`, `sources`, and `disclaimer`.
 * 3. Applies zero-width non-breaking spaces (`\u2060`) after every dot (`.`) within the `[text]` portion
 *    of Markdown links, preventing the front-end from auto-rendering them as hyperlinks.
 * 4. Reformats each `source` into plain text `text(url)` format, keeping only the URL clickable.
 * 5. Checks whether the chatbot response is a refusal message ("Sorry, I can't answer this question."),
 *    and clears the disclaimer in that case.
 * 6. Returns an object containing the cleaned `answer`, formatted `sources`, and optional `disclaimer`.
 * 
 * @async
 * @param {string} text - The user's input message to be sent to the backend.
 * @returns {Promise<{ answer: string, sources: string[], disclaimer: string }>}
 * 
 * ==========================================================
 * 函数：handleSend
 * ==========================================================
 * 
 * 处理用户发送到后端 API 的问题，并返回结构化的聊天机器人响应。
 * 这是一个异步函数，当用户在 ChatBot 中发送消息时被触发。
 * 
 * 工作流程：
 * 1. 向后端接口 `/parent_chat` 发送包含用户问题的 POST 请求。
 * 2. 解析返回的 JSON 数据，提取 `answer`、`sources` 和 `disclaimer`。
 * 3. 在每个 Markdown 链接 `[text]` 中的点号（`.`）后插入零宽不间断空格 (`\u2060`)，
 *    以防止前端自动将其识别为超链接。
 * 4. 将每个 `source` 重新格式化为 `text(url)` 形式，使 `text` 不可点击而 `url` 可点击。
 * 5. 检查回答内容是否为拒答（如 "Sorry, I can't answer this question."），若是则清空 `disclaimer`。
 * 6. 返回包含清理后的 `answer`、格式化的 `sources` 和可选 `disclaimer` 的对象。
 * 
 * @async
 * @param {string} text - 用户输入的消息文本，将被发送至后端。
 * @returns {Promise<{ answer: string, sources: string[], disclaimer: string }>}
 * 返回一个 Promise 对象，包含回答文本、来源链接列表和免责声明。
 */
async function handleSend(text) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: text, kb_hit: '' }),
  });
  const json = await res.json();

  const ZWNBSP = '\u2060';

  const rawSources = json?.data?.sources ?? [];
  const processedSources = rawSources.map((src) => {
    const m = src.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!m) return src;
    const displayText = m[1].replace(/\./g, `.${ZWNBSP}`);
    const url = m[2];
    return `${displayText}(${url})`;
  });

  // 读取返回的 answer 和 disclaimer
  const answer = json?.data?.answer ?? 'Sorry, something went wrong.';
  let disclaimer = json?.data?.disclaimer ?? '';

  // 判断：如果是拒答句，就去掉 disclaimer
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

  <ChatBot
    v-model="isChatOpen"
    title="Dyslexia Chatbot"
    :participants="[{ id: 'bot', name: 'Dyslexia Helper' }]"
    :initialMessages="[{ type:'text', author:'bot', data:{ text: `Hi! I'm here to answer your questions about dyslexia.` }}]"
    :onSend="handleSend"
  />
</template>