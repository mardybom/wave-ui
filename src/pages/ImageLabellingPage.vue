<script setup>
import { ref, onMounted } from 'vue'
import GameTopBar from '@/components/GameTopBar.vue'
import WaveHeader from '@/components/WaveHeader.vue'
import GameTitleNDescribe from'@/components/GameTitleNDescribe.vue'

</script>


<!-- ——————————————————————TEMPLATE—————————————————————————————— -->
<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <GameTopBar title="ImageLabellingPage" />

    <!-- 头部装饰“天空+波浪” -->
    <WaveHeader top="80px" height="200px" zIndex="0"/>

    <GameTitleNDescribe 
      title="Picture Word Matching" 
      description="Look at the picture and choose the correct word from the options!" 
    />






  </div>
</template>


<!-- ——————————————————————CSS—————————————————————————————— -->
<style scoped>
.page-container {
  min-height: 100vh;  /* 垂直方向填满屏幕 */
  width: 100vw;       /* 横向撑满屏幕 */
  position: relative; /* 让子元素 absolute 定位基于它 */
}


</style>