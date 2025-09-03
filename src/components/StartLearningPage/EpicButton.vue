<template>
  <button class="epic-button" @click="$emit('click')">{{ label }}</button>
</template>
<script setup>
defineProps({ label: { type: String, default: 'assign a epic name pls!' } })
</script>

<style scoped>
.epic-button {
  width: 400px;           /* 横向长方形 */
  height: 60px;           /* 固定高度 */
  background: #fff;       /* 白色背景 */
  border: 1px solid #ccc; /* 简单灰色边框 */
  border-radius: 15px;     /* 圆角 */
  font-size: 16px;
  cursor: pointer;
  display: block;       /* 改成块级 */
  margin: 0 auto;       /* 左右自动 margin → 横向居中 */
  box-shadow: 0 8px 18px rgba(0,0,0,.08);/* 阴影，向下 8px，模糊 18px，黑色透明度 0.08 */
  color: #111;                           /* 文字颜色为深灰（接近黑色） */
  transition: transform .15s ease,       /* 鼠标交互时，缩放动画 */
              box-shadow .15s ease;      /* 鼠标交互时，阴影动画 */
}

.epic-button {
  font-size: 18px;     /* 修改文字大小 */
  font-weight: bold;   /* 加粗 */
  font-family: 'OpenDyslexic', Arial, sans-serif; /* 指定字体 */
  color: #333;         /* 深灰文字 */
}

.epic-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0,0,0,.15);
  color: #FD9B2D;   /* 悬停时文字变橘色 */
}
</style>