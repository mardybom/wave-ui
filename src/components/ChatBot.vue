<!--
==========================================================
Component: ChatBot.vue
==========================================================

This component implements a chatbot interface for the Parent Hub page.
It integrates with the `vue3-beautiful-chat` library and provides:
- Real-time two-way chat between user and AI assistant
- Adjustable chat window width (30%, 50%, 70%)
- Typing indicator and launcher button

Core Responsibilities:
1. Handle mounting and cleanup of chatbot UI theme
2. Manage chat window state (open/close, message list, unread count)
3. Send user input to the parent component’s `onSend` method
4. Display backend responses including sources and disclaimers

Key Functions:
- onMounted: Initialize chatbot theme and inject resize button
- onUnmounted: Clean up when the component is destroyed
- openChat / closeChat: Control chat visibility via v-model
- onMessageWasSent: Main handler that sends user messages, processes replies, and updates UI

Dependencies:
- vue3-beautiful-chat
- Vue 3 Composition API (ref, watch, onMounted, onUnmounted)
- Parent-provided props such as `onSend`, `initialMessages`, `participants`

==========================================================
组件：ChatBot.vue
==========================================================

本组件实现了 Parent Hub 页面的聊天机器人界面。
它基于 `vue3-beautiful-chat` 库，实现以下功能：
- 用户与 AI 助手的实时双向对话
- 聊天窗口宽度可调（30%、50%、70%）
- “正在输入”动画和启动按钮

主要职责：
1. 挂载和清理聊天界面的主题样式
2. 管理聊天窗口状态（开关、消息列表、未读数）
3. 调用父组件的 `onSend` 方法发送用户输入
4. 展示后端返回的信息，包括来源链接与免责声明

核心函数：
- onMounted：初始化主题并动态插入调整按钮
- onUnmounted：组件卸载时清理主题类
- openChat / closeChat：通过 v-model 控制聊天窗口显示
- onMessageWasSent：主消息处理逻辑，负责发送、接收与更新界面

依赖项：
- vue3-beautiful-chat
- Vue 3 Composition API（ref、watch、onMounted、onUnmounted）
- 父组件传入的属性（如 `onSend`、`initialMessages`、`participants`）
-->

<script setup>
import { ref, watch, toRefs, onMounted, onUnmounted } from 'vue'
import 'vue3-beautiful-chat/dist/vue3-beautiful-chat.css'
import avatarSquirrel from '@/assets/avatar-squirrel.png'

/**
 * onMounted()
 * ------------------------------------------------------------
 * Lifecycle hook that runs when the ChatBot component is first mounted.
 * 
 * Responsibilities:
 * 1. Adds a global CSS class `chatbot-theme` to the `<body>` element
 *    — this class applies the chatbot-specific visual theme.
 * 2. Ensures that a default chat width (`chat-w30`) is applied if
 *    no width class exists. The available size classes are:
 *       - `chat-w30` → 30% width
 *       - `chat-w50` → 50% width
 *       - `chat-w70` → 70% width
 * 3. Dynamically injects a **resize button** (with SVG icon) into the
 *    chatbot header `.sc-header`, placed before the close button.
 * 4. Handles user interaction:
 *      - Clicking the button toggles `.chat-large` mode for layout scaling.
 *      - Each click cycles the chat width through 30% → 50% → 70% → 30%.
 * 
 * Implementation details:
 * - The resize button is created as a `<div>` with class `chat-size-btn`
 *   and SVG markup representing a diagonal resize arrow.
 * - DOM manipulation ensures the button is not duplicated upon re-render.
 * 
 * ------------------------------------------------------------
 * 生命周期钩子：在 ChatBot 组件挂载（初次渲染）时执行。
 * 
 * 功能与职责：
 * 1. 向 `<body>` 添加全局类 `chatbot-theme`，用于应用聊天主题样式。
 * 2. 检查当前是否存在宽度类；若无，则默认设置为 `chat-w30`（30%）。
 *    可用宽度类包括：
 *       - `chat-w30` → 30% 宽
 *       - `chat-w50` → 50% 宽
 *       - `chat-w70` → 70% 宽
 * 3. 动态向聊天头部 `.sc-header` 插入“调整大小”按钮，
 *    按钮包含 SVG 图标，并插入在关闭按钮前方。
 * 4. 用户交互行为：
 *      - 点击按钮可切换 `.chat-large` 模式；
 *      - 每次点击会在 30% → 50% → 70% → 30% 之间循环切换聊天窗口宽度。
 * 
 * 实现细节：
 * - 按钮以 `<div>` 元素形式创建，类名为 `chat-size-btn`，
 *   内嵌 SVG 矢量图标（表示双向放大箭头）。
 * - 使用 DOM 检查避免重复插入按钮。
 */
onMounted(() => {
  document.body.classList.add('chatbot-theme')
  const SIZE_CLASSES = ['chat-w30', 'chat-w50', 'chat-w70'];
  if (!SIZE_CLASSES.some(c => document.body.classList.contains(c))) {
    document.body.classList.add('chat-w30');
  }
  
  const header = document.querySelector('.sc-header')
  if (header && !header.querySelector('.chat-size-btn')) {
    const btn = document.createElement('div')
    btn.className = 'chat-size-btn'
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">
        <path d="M408 64L552 64C565.3 64 576 74.7 576 88L576 232C576 241.7 570.2 250.5 561.2 254.2C552.2 257.9 541.9 255.9 535 249L496 210L409 297C399.6 306.4 384.4 306.4 375.1 297L343.1 265C333.7 255.6 333.7 240.4 343.1 231.1L430.1 144.1L391.1 105.1C384.2 98.2 382.2 87.9 385.9 78.9C389.6 69.9 398.3 64 408 64zM232 576L88 576C74.7 576 64 565.3 64 552L64 408C64 398.3 69.8 389.5 78.8 385.8C87.8 382.1 98.1 384.2 105 391L144 430L231 343C240.4 333.6 255.6 333.6 264.9 343L296.9 375C306.3 384.4 306.3 399.6 296.9 408.9L209.9 495.9L248.9 534.9C255.8 541.8 257.8 552.1 254.1 561.1C250.4 570.1 241.7 576 232 576z"/>
        </svg>`;
        btn.innerHTML = svg;   // ⬅️ 用 SVG 替代文字

    const closeBtn = header.querySelector('.sc-header--close-button')

    if (closeBtn) header.insertBefore(btn, closeBtn)
    else header.appendChild(btn)

    btn.addEventListener('click', () => {
      document.body.classList.toggle('chat-large')
    })

    btn.addEventListener('click', () => {
      const currentIdx = SIZE_CLASSES.findIndex(c => document.body.classList.contains(c));
      const nextIdx = (currentIdx + 1) % SIZE_CLASSES.length;

      document.body.classList.remove(...SIZE_CLASSES);
      document.body.classList.add(SIZE_CLASSES[nextIdx]);
    });
  }
})

/**
 * onUnmounted()
 * ------------------------------------------------------------
 * Lifecycle hook executed when the component is unmounted.
 * Removes the chatbot theme class from the body element.
 *
 * 组件卸载生命周期钩子。
 * 在组件销毁时移除聊天主题样式类。
 */
onUnmounted(() => document.body.classList.remove('chatbot-theme'))

const props = defineProps({
  modelValue: { type: Boolean, default: false },         // v-model: 开合
  title: { type: String, default: 'Chatbot' },           // 标题
  participants: {                                        // 参与者
    type: Array,
    default: () => [{ id: 'bot', name: 'Helper' }],
  },
  initialMessages: {                                     // 初始消息
    type: Array,
    default: () => [
      { type: 'text', author: 'bot', data: { text: "Hi! I'm here to help." } },
    ],
  },
  onSend: { type: Function, required: true },            // 发送处理 (text) => Promise<string>

  // UI switch
  showLauncher: { type: Boolean, default: true },
  showCloseButton: { type: Boolean, default: true },
  alwaysScrollToBottom: { type: Boolean, default: true },
})
const isTyping = ref(false)
const emit = defineEmits(['update:modelValue'])
// 把 props 的字段变成可直接在模板里用的响应式引用
const {
  title,
  showLauncher,
  showCloseButton,
  alwaysScrollToBottom,
} = toRefs(props)

const participants = [
  { id: 'bot', name: 'Helper', imageUrl: avatarSquirrel }
]

// ---------- local state ----------
const messageList = ref([...props.initialMessages])
const isOpen = ref(props.modelValue)
const newMessagesCount = ref(0)

watch(
  () => props.modelValue,
  (v) => (isOpen.value = v)
)

function openChat() {
  emit('update:modelValue', true)
  newMessagesCount.value = 0
}
function closeChat() {
  emit('update:modelValue', false)
}


/**
 * onMessageWasSent(message, done)
 * ------------------------------------------------------------
 * Main handler for user messages sent through the chatbot interface.
 * This function is triggered automatically when a user submits input 
 * (by pressing Enter or clicking the send button).
 * 
 * Workflow:
 * 1. Pushes the user’s message to `messageList` for immediate display.
 * 2. Activates the “typing” indicator while waiting for a reply.
 * 3. Calls the parent component’s `onSend(text)` method to send the text 
 *    to the backend and waits for the response (Promise-based).
 * 4. Handles both response formats:
 *      - Simple string (legacy format): displayed directly.
 *      - Object { answer, sources, disclaimer } (new format):
 *          • Removes "Answer:" prefix if present.
 *          • Appends formatted “Sources” list with numbering.
 *          • Adds italic disclaimer text at the end, if available.
 * 5. Pushes the bot’s formatted reply into `messageList` for rendering.
 * 6. Handles errors by showing a network failure message.
 * 
 * Parameters:
 * @param {Object} message - The chat message object generated by the library.
 *   Example:
 *   {
 *     type: 'text',
 *     author: 'me',
 *     data: { text: 'Hello!' }
 *   }
 * @param {Function} [done] - Optional callback to clear the input box immediately.
 * 
 * Dependencies:
 * - Reads and modifies local state: `messageList`, `isTyping`
 * - Relies on parent-provided async handler `props.onSend(text)`
 * 
 * Error handling:
 * - Displays “Network error. Please try again.” if the backend call fails.
 * 
 * ------------------------------------------------------------
 * 聊天机器人消息发送主处理函数。
 * 当用户在输入框中按下回车或点击发送按钮时，该函数会自动触发。
 * 
 * 处理流程：
 * 1. 将用户发送的消息立即加入 `messageList`，显示在右侧气泡中；
 * 2. 开启“正在输入”状态指示；
 * 3. 调用父组件的异步方法 `onSend(text)` 将文本传给后端，并等待响应；
 * 4. 支持两种返回格式：
 *      - 纯字符串（旧格式）：直接展示；
 *      - 对象 { answer, sources, disclaimer }（新格式）：
 *          • 自动去掉 "Answer:" 或 "回答:" 前缀；
 *          • 格式化追加来源列表 Sources（带编号）；
 *          • 若存在免责声明（disclaimer），以斜体形式追加到结尾；
 * 5. 将格式化后的机器人回复加入 `messageList`，显示在左侧气泡；
 * 6. 若网络或逻辑错误，显示 “Network error. Please try again.” 提示。
 * 
 * 参数说明：
 * @param {Object} message - 聊天库生成的消息对象，例如：
 *   {
 *     type: 'text',
 *     author: 'me',
 *     data: { text: '你好！' }
 *   }
 * @param {Function} [done] - 可选回调，用于立即清空输入框。
 * 
 * 依赖与副作用：
 * - 读取与修改本地状态变量：`messageList`、`isTyping`
 * - 调用父组件传入的异步方法 `props.onSend(text)` 与后端交互。
 * 
 * 错误处理：
 * - 若与后端通信失败，会显示 “Network error. Please try again.” 错误提示。
 */
function onMessageWasSent(message, done) {
  if (typeof done === 'function') done()
  messageList.value.push(message)

  const userText = message?.data?.text ?? ''
  isTyping.value = true

  props.onSend(userText)
    .then(reply => {
      isTyping.value = false

      let replyText = ''
      if (typeof reply === 'string') {
        replyText = reply
      } else if (reply && typeof reply === 'object') {
        let { answer, sources, disclaimer } = reply

        let clean = (answer ?? '').replace(/^\s*(answer|回答)\s*:\s*/i, '').trim()

        replyText = clean
        if (Array.isArray(sources) && sources.length) {
          replyText += '\n\nSources:\n' + sources.map((s, i) => `${i + 1}. ${s}`).join('\n')
        }
        if (disclaimer) {
            replyText += `\n\n_${disclaimer}_`
        }
      }

      messageList.value.push({
        type: 'text',
        author: 'bot',
        data: { text: replyText || 'Sorry, no reply.' },
      })
    })
    .catch(() => {
      isTyping.value = false
      messageList.value.push({
        type: 'text',
        author: 'bot',
        data: { text: 'Network error. Please try again.' },
      })
    })
}
</script>

<template>
  <div class="chatbox-resizable" :class="{ 'typing-on': isTyping }">
    <beautiful-chat
      :participants="participants"
      :message-list="messageList"
      :on-message-was-sent="onMessageWasSent"
      :is-open="isOpen"
      :open="openChat"
      :close="closeChat"
      :new-messages-count="newMessagesCount"
      :show-launcher="!isOpen"                
      :show-close-button="showCloseButton"
      :always-scroll-to-bottom="alwaysScrollToBottom"
      :title="title"
      :show-typing-indicator="isTyping"
    />
  </div>
</template>

<style>
.chatbox-resizable .sc-typing-indicator { display: none !important; }
.chatbox-resizable.typing-on .sc-typing-indicator { display: flex !important; }

body.chatbot-theme .sc-header,
body.chatbot-theme .sc-launcher {
  background-color: #38b3ec !important;
}

body.chatbot-theme .sc-header--title.enabled {
  font-weight: 700 !important;
}

body.chatbot-theme .sc-message--content.sent .sc-message--text {
  background-color: #c1f9c8 !important;
  color: #000000 !important;
  border-radius: 16px 16px 4px 16px;
}

body.chatbot-theme .sc-typing-indicator,
body.chatbot-theme .sc-message--content.received .sc-message--text {
  background-color: #cfeffe !important;
  color: #000000 !important;
  border-radius: 16px 16px 16px 4px;
}

body.chatbot-theme .sc-message--text {
  color: #000000 !important;
  font-weight: 400 !important;
}

body.chatbot-theme .sc-chat-window.opened {
  height: 70vh !important;
  min-width: 300px;
  min-height: 400px;
}

body.chatbot-theme.chat-w30 .sc-chat-window.opened { width: 30vw !important; }
body.chatbot-theme.chat-w50 .sc-chat-window.opened { width: 50vw !important; }
body.chatbot-theme.chat-w70 .sc-chat-window.opened { width: 70vw !important; }

body.chatbot-theme .sc-message {
  width: 100% !important;
}

body.chatbot-theme .sc-message--content.received {
  margin-left: 10px !important;
}

body.chatbot-theme .sc-message--content.sent {
  margin-right: 10px !important;
}


body.chatbot-theme .sc-header--title.enabled:hover {
  box-shadow: none !important;
  filter: none !important;
  transform: none !important;
  opacity: 1 !important;
}

/* 1  */
body.chatbot-theme .sc-header {
  display: flex;              /* 组件本身就是 flex，这里确保一下 */
  align-items: center;        /* ⬅️ 关键：垂直居中对齐所有子项 */
}

/* 2 */
body.chatbot-theme .sc-header--title {
  flex: 1 1 auto;
}

/* 3 */
body.chatbot-theme .sc-header .sc-header--close-button,
body.chatbot-theme .sc-header .chat-size-btn {
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  margin-left: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

body.chatbot-theme .sc-header--close-button svg path {
  stroke: currentColor;
  stroke-width: 4;
}

body.chatbot-theme .sc-header .chat-size-btn svg {
  width: 55%;
  height: 55%;
  display: block;
}

body.chatbot-theme .sc-header .chat-size-btn svg path {
  fill: currentColor;
}

body.chatbot-theme .sc-header .chat-size-btn {
  background-color: #28C840;
  color: white;
}

body.chatbot-theme .sc-header .sc-header--close-button {
  background-color: #FF5F57;
  color: white;
}

body.chatbot-theme .sc-header .chat-size-btn:hover,
body.chatbot-theme .sc-header .sc-header--close-button:hover {
  box-shadow: 0 0 6px rgba(0,0,0,0.25) !important;
  transform: scale(1.05) !important;
  filter: brightness(0.95) !important;
  transition: all 0.15s ease !important;
}

.sc-message--text a {
  color: #007bff;
  text-decoration: underline;
}



</style>