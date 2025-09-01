<script setup>
import NavBar from '@/components/NavBar.vue'

import startPart from '@/components/StartLearningPage/StartPart.vue'

</script>

<template>
  <div class="start-learning-page">
    <NavBar />
    <!-- 页面内容 -->

    <startPart />
  </div>
</template>

<style scoped>
.start-learning-page {
  background-color: #CDFFE0; 
  min-height: 100vh;        
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}


</style>