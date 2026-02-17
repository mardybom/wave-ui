// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/pages/HomePage.vue'
import LetterSoundMappingPage from '@/pages/LetterSoundMappingPage.vue'
import DigitalWritingPage from '@/pages/DigitalWritingPage.vue'
import SentenceRearrangingPage from '@/pages/SentenceRearrangingPage.vue'
import ImageLabellingPage from '@/pages/ImageLabellingPage.vue'
import DocsConverterPage from '@/pages/DocsConverterPage.vue'
import ReadingSpeedPage from '@/pages/ReadingSpeedPage.vue'



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
  { path: '/docs-converter', name: 'docsConverter', component: DocsConverterPage },
  { path: '/reading-speed', name: 'ReadingSpeed', component:  ReadingSpeedPage},
  // iteration1
  { 
    path: '/iteration1',
    name: 'iteration1',
    beforeEnter() {
      window.location.href = 'https://orange-water-0c6bfac00.2.azurestaticapps.net/'
    }
  },
  // iteration2
  { 
    path: '/iteration2',
    name: 'iteration2',
    beforeEnter() {
      window.location.href = 'https://black-smoke-0149afd00.1.azurestaticapps.net'
    }
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
  
]

export default createRouter({
  history: createWebHistory(),
  routes,
    scrollBehavior() {
    return new Promise((resolve) => {
        setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        resolve()
        }, 100)
    })
    },
})