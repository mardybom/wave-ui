<template>
  <div class="wave" aria-hidden="true"></div>
</template>

<script setup>

</script>

<style scoped>
.wave {
  position: relative;                         /* 不固定，随页面滚动 */
  width: 100vw;                               /* 铺满屏幕宽度 */
  height: var(--wave-h, clamp(70px, 8vw, 140px)); /* 高度，可用变量控制 */
  margin-left: calc(-50vw + 50%);             /* full-bleed，突破 #app 宽度限制 */
  background: url('@/assets/wave-1.svg') top center / cover no-repeat;
  transform: translateY(-1px); /* 👈 上抬 1px 覆盖接缝 */
}

</style>