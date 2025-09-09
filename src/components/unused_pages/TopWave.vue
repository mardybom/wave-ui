<template>
  <!-- 顶部波浪背景 -->
  <div class="top-wave" aria-hidden="true"></div>
</template>

<script setup>
// 这里不需要逻辑，所以可以留空
</script>

<style scoped>
.top-wave {
  position: relative;                         /* 不固定，随页面滚动 */
  width: 100vw;                               /* 铺满屏幕宽度 */
  height: var(--wave-h, clamp(70px, 8vw, 140px)); /* 高度，可用变量控制 */
  margin-left: calc(-50vw + 50%);             /* full-bleed，突破 #app 宽度限制 */
  background: url('@/assets/wave-navi.svg') top center / cover no-repeat;
}
.top-wave {
  margin-top: -30px; /* 例如往上提 30px */
}
</style>