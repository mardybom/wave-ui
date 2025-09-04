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
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules'


</script>

<template>
  
  <GameTopBar title="Letter Sound Mapping" />
  <div class="start-learning-page">
    <div class="background">
      
        <div class="swiper-box">
          <div class="textWrapper">
             <p class="text">
              This game helps children connect letters with their sounds.<br/>  
              Click the cards to play the sound, and use the keyboard arrows, trackpad, 
              or navigation buttons to explore all letters.  
            </p>
          </div>
          <Swiper
            ref="swiperRef"
            :modules="[Navigation, Mousewheel, Keyboard]" 
            :slides-per-view="3"
            :centered-slides="true"
            :space-between="30"
            :navigation="true"
            :mousewheel="true"
            :keyboard="{ enabled: true }"
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
  padding-top: 20px;  
}
.wrapper {
  display: flex;
  justify-content: center;
}

.textWrapper {
  display: flex;
  text-align: center;
}

.text {
  color: #000;
  font-size: 18px;
  font-family: 'OpenDyslexic', Arial, sans-serif; 
  padding-bottom: 30px;
}

.swiper-box {
  max-width: 960px;
  margin: 96px auto 48px;     /* 顶部留给顶部栏 */
}

:deep(.my-swiper) {
  padding: 40px 30px;         /* 给轮播上下留一点空隙 */
}

:deep(.swiper-slide) {
  display: flex;           /* 让每个 slide 内的卡片水平居中 */
  justify-content: center;
}

/* 中间活动卡片放大 + 100% 不透明 */
:deep(.swiper-slide-active) {
  transform: scale(1.1);
}

/* 左右两边稍微大一点 */
:deep(.swiper-slide-prev),
:deep(.swiper-slide-next) {
  transform: scale(0.9);
}


/* 添加左右渐变遮罩 */
:deep(.my-swiper)::before,
:deep(.my-swiper)::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 260px; /* 遮罩宽度，可以调 */
  pointer-events: none; /* 遮罩不挡鼠标点击 */
  z-index: 2;
  overflow: hidden; 
}

:deep(.my-swiper)::before {
  left: 0;
  background: linear-gradient(to right, rgba(205, 255, 224, 1), rgba(253, 253, 253, 0));
}

:deep(.my-swiper)::after {
  right: 0;
  background: linear-gradient(to left, rgba(205, 255, 224, 1), rgba(253, 253, 253, 0));
}

:deep(.my-swiper) {
  --swiper-navigation-color: #000;   

}

:deep(.swiper-button-prev:hover),
:deep(.swiper-button-next:hover) {
  --swiper-navigation-color: #FD9B2D; 
}



</style>