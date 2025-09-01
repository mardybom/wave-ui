// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 页面组件（按你项目实际位置改名/改路径即可）
import HomePage from '@/pages/HomePage.vue'
const StartLearningPage = () => import('@/pages/StartLearningPage.vue') // 可懒加载
const ParentsHubPage   = () => import('@/pages/ParentsHubPage.vue')     // 可懒加载

const routes = [
  { path: '/',          name: 'home',          component: HomePage },
  { path: '/learn',     name: 'startLearning', component: StartLearningPage },
  { path: '/parents',   name: 'parentsHub',    component: ParentsHubPage },
  // 404（可选）
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(), // 不带 # 的 URL
  routes,
    scrollBehavior() {
    return new Promise((resolve) => {
        setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }) // 👈 平滑滚动
        resolve()
        }, 100) // 等 DOM 渲染完再滚
    })
    },
})