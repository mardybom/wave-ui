<script setup>
import { ref } from 'vue'
import axios from 'axios'
import GameTopBar from '@/components/GameTopBar.vue'
import DrawingPad from '@/components/DigitalWritingPage/DrawingPad.vue'
import UpperPart from '@/components/DigitalWritingPage/UpperPart.vue'

import trueImg from '@/assets/SquirrelCelebrating.png'
import falseImg from '@/assets/SquirrelEncouragement.png'

const expectedLetter = ref('')              // 接收子组件抛来的字母
const onReveal = (ch) => { expectedLetter.value = ch }  // 事件回调

// 两个响应式变量
const isCorrect = ref(null)        // true / false / null
const detectedCount = ref(0)       // 默认 0

const drawingPadRef = ref(null)
const toPureBase64 = (dataURL) => dataURL.split(',')[1] ?? dataURL
const captureAndBuildJson = async () => {
  const dataURL = drawingPadRef.value.getImage()
  const payload = {
    expected_letter: expectedLetter.value,
    canvas_input: toPureBase64(dataURL),
  }
  console.log('JSON payload →', payload)

  try {
    const res = await axios.post(
      'https://wave-api-monashie.azurewebsites.net/alphabet_mastery',
      payload
    )
    console.log('Server response:', res.data)

    // 更新响应式变量
    isCorrect.value = res.data.is_correct
    detectedCount.value = res.data.detected_count

    // 检查是否拿到了
    console.log('isCorrect:', isCorrect.value)
    console.log('detectedCount:', detectedCount.value)
  } catch (err) {
    console.error('API request failed:', err)
  }
}

</script>


<template>
  
  <div class="background">
    <div class="wrapper">
      <GameTopBar title="Digital writing" />
      <div class="imgWrapper">
        <div class="imgResponse">
          <img class="imgtrue" v-if="isCorrect === true" :src="trueImg" alt="Correct" />
          <img class="imgfalse" v-else-if="isCorrect === false" :src="falseImg" alt="Incorrect" />
        </div>
      </div>
      <UpperPart @reveal="onReveal"/>
      <DrawingPad ref="drawingPadRef" />
      <div class="capButtonWrapper">
        <button class="captureButton" @click="captureAndBuildJson">Capture</button>
      </div>
    </div>
    <div class="test"></div>
  </div>
  
</template>



<style scoped>
.page {
  padding-top: 100px;            /* 给顶部栏让出空间 */
  display: flex;
  justify-content: center;      /* 居中画布（可选） */
}

.background {
  position: relative;
  display: flex;
  background-color: #CDFFE0; 
  min-height: 100vh;        
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding-top: 10px;  
  justify-content: center; 
}

.capButtonWrapper {
  display: flex;
}

.captureButton {
  position: relative;
  top: -45px; 
  margin-left: auto;
  padding: 6px 12px;
  background: #f7f7f7;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-family: 'OpenDyslexic', Arial, sans-serif; 
}


.captureButton:hover {
  color: #FD9B2D;
}

.imgWrapper {
  display: flex;
  justify-content: center; 
}

.imgResponse {
  height: 150px;
  width: 150px;
}

.imgResponse img {
  position: static;
  margin-top: 73px;
  
  max-width: 100%;   /* 图片不会超出容器宽 */
  max-height: 100%;  /* 图片不会超出容器高 */
  object-fit: contain; /* 保持比例缩放，完整显示 */
}

</style>