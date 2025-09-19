// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 页面组件（按你项目实际位置改名/改路径即可）
import HomePage from '@/pages/HomePage.vue'
import LetterSoundMappingPage from '@/pages/LetterSoundMappingPage.vue'
import DigitalWritingPage from '@/pages/DigitalWritingPage.vue'
import SentenceRearrangingPage from '@/pages/SentenceRearrangingPage.vue'
import ImageLabellingPage from '@/pages/ImageLabellingPage.vue'



const StartLearningPage = () => import('@/pages/StartLearningPage.vue')
const ParentsHubPage   = () => import('@/pages/ParentsHubPage.vue')

const routes = [
  { path: '/',          name: 'home',          component: HomePage },
  { path: '/learn',     name: 'startLearning', component: StartLearningPage },
  { path: '/parents',   name: 'parentsHub',    component: ParentsHubPage },
  { path: '/letter-sound',name: 'letterSoundMapping', component: LetterSoundMappingPage },
  { path: '/Digital-writing',name: 'DigitalWriting', component: DigitalWritingPage },
  { path: '/sentence-rearranging', name: 'SentenceRearranging', component: SentenceRearrangingPage },
  { path: '/image-labelling', name: 'ImageLabelling', component: ImageLabellingPage },
  // iteration1
  { 
    path: '/iteration1',
    name: 'iteration1',
    beforeEnter() {
      window.location.href = 'https://orange-water-0c6bfac00.2.azurestaticapps.net/'
    }
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
  
]

export default createRouter({
  history: createWebHistory(), // 不带 # 的 URL
  routes,
    scrollBehavior() {
    return new Promise((resolve) => {
        setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }) // 平滑滚动
        resolve()
        }, 100) // 等 DOM 渲染完再滚
    })
    },
})