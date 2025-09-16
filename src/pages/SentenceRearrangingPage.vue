<!-- src/pages/SentenceRearrangingPage.vue -->
<script setup>
import GameTopBar from '@/components/GameTopBar.vue'
import SentenceBuilder from '@/components/SentenceRearrangingPage/SentenceBuilder.vue'
</script>


<!-- ——————————————————————TEMPLATE—————————————————————————————— -->
<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <GameTopBar title="Sentence Rearranging" />

    <!-- 头部装饰“天空+波浪” -->
    <div class="sky" aria-hidden="true">
      <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0,100 
            C180,180 360,20 540,100 
            C720,180 1000,20 1080,100 
            C1260,180 1440,20 1440,100 
            L1440,0 L0,0 Z"
          fill="#CFEFFF"/> <!-- 这里是顶部波浪的颜色 -->
      </svg>
    </div>

    <div class="titlePart">
        <!-- title -->
        <header class="dw-head">
            <div class="head-row">
                <h1>Sentence Rearranging</h1>
            </div>
            <p>Rearrange the words to build the correct sentence!</p>
        </header>
    </div>



    <div class="wrapperBoss">
        <div class="wrapperForSentenceBuilder">
            <SentenceBuilder
                :correctWords="['The','quick','brown','fox','jumps','over','the','lazy','dog']"
                :shuffledWords="['fox','The','lazy','over','quick','jumps','dog','the','brown']"
                />
        </div>
        <div class="wrapperForImage">
            <img src="@/assets/squirrel_1.png" alt="helper" />
        </div>
    </div>
  </div>
</template>


<!-- ——————————————————————CSS—————————————————————————————— -->
<style scoped>
.page-container {
  min-height: 100vh;  /* 垂直方向填满屏幕 */
  width: 100vw;       /* 横向撑满屏幕 */
  background: #ffecf6; /* 页面背景色 */
  position: relative; /* 让子元素 absolute 定位基于它 */
}

/* 保留原来的 sky 样式 */
.sky {
  position: absolute;   /* 绝对定位，脱离文档流，相对最近的有 position 的父容器定位 */
  top: 80px;            /* 元素的顶部距离父容器顶部 96 像素（这里正好是给导航栏留位置） */
  left: 0;              /* 元素左边紧贴父容器左边 */
  right: 0;             /* 元素右边紧贴父容器右边（和 left:0 一起撑满横向） */
  height: 200px;        /* 元素本身高度固定为 200 像素 */
  overflow: hidden;     /* 超出容器的内容隐藏（防止波浪 SVG 超出范围） */
  z-index: 0;           /* 图层层级设为 0，表示在较低层（被上层内容覆盖） */
  pointer-events: none; /* 禁止鼠标事件（点击、hover 等），避免挡住下方按钮等交互 */
}

.wave {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
}


.wrapperBoss {
  display: flex;
  flex-direction: row;
  align-items: center;     /* 让子元素在横向(水平方向)居中 */
  justify-content: center; /* 纵向(垂直方向)居中 */
  width: 100vw;       /* 横向撑满屏幕 */
}

.wrapperForSentenceBuilder {
  min-width: 300px;
  width: 60%;
}

.wrapperForImage {
  width: 20%;        /* 右侧占 20% */
  min-width: 100px;  /* 至少 100px */
}

/* 让图片不超出容器并保持比例 */
.wrapperForImage img {
  display: block;
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.titlePart {
  display: flex;
  align-items: center;     /* 让子元素在横向(水平方向)居中 */
  justify-content: center; /* 纵向(垂直方向)居中 */
  position: relative; 
  z-index: 100;
  margin-top: 40px;   /* 与上面元素的间距 */
  margin-bottom: 60px;/* 与下面元素的间距 */
}

.head-row { 
  display: flex; 
  align-items: center; 
}
.dw-head h1 { 
  font-size: clamp(36px, 4vw, 56px); 
  margin: 0; 
}
.dw-head p  { 
  margin: 4px 0 0; 
  opacity: .85; 
  font-size: 20px }
</style>