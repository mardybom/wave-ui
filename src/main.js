import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/fonts.css'
import router from './router'
import 'animate.css'

// ✅ 新增：引入 vue3-beautiful-chat 插件和样式
import BeautifulChat from 'vue3-beautiful-chat'
import 'vue3-beautiful-chat/dist/vue3-beautiful-chat.css'

// ✅ 创建 Vue 应用
const app = createApp(App)

// ✅ 注册插件（必须在 mount 之前）
app.use(router)
app.use(BeautifulChat)

// ✅ 挂载应用
app.mount('#app')