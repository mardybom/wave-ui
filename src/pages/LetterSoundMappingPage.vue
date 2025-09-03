<script setup>
import GameTopBar from '@/components/GameTopBar.vue'
import LetterCard from '@/components/LetterSoundMappingPage/LetterCard.vue'

import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css' 

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const playSound = (char) => {
  console.log('Clicked letter:', char)
}

import 'swiper/css/navigation'
</script>

<template>
  
  <GameTopBar title="Letter Sound Mapping" />
  <div class="start-learning-page">
    <!-- 给轮播一个容器，避免被顶栏遮住，并居中 -->
    <div class="background">
      <div class="swiper-box">
        <Swiper
          :slides-per-view="3"
          :centered-slides="true"
          :space-between="30"
          :navigation="true"
          class="my-swiper"
        >
          <SwiperSlide v-for="(char, i) in letters" :key="char">
            <LetterCard :char="char" :index="i + 1" @play="playSound" />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>
</template>


<style scoped>
.background {
  background-color: #CDFFE0; 
  min-height: 100vh;        
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding-top: 96px;  
}

.swiper-box {
  max-width: 960px;
  margin: 96px auto 48px;     /* 顶部留给顶部栏 */
}

:deep(.my-swiper) {
  padding: 20px 0;         /* 给轮播上下留一点空隙 */
  border: 2px solid #ccc;   /* 边框 */
  border-radius: 12px;      /* 圆角 */
  background: #fdfdfd;      /* 背景色 */
  
}
:deep(.swiper-slide) {
  display: flex;           /* 让每个 slide 内的卡片水平居中 */
  justify-content: center;
}


</style>