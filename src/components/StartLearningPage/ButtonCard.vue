<template>
  <!-- 有 to 就用 router-link，否则就是普通 div -->
  <component :is="to ? 'router-link' : 'div'" :to="to" class="button-card" role="button">
    <span class="label">{{ label }}</span>
  </component>
</template>

<script setup>
defineProps({
  label: { type: String, default: 'assign a name!!' },
  to:    { type: String, default: '' } // 例如 '/learn/alphabet'
})
</script>

<style scoped>
.button-card {
  display: inline-flex;                  /* 行内块级弹性容器，可以和别的元素在一行 */
  align-items: center;                   /* 子元素（文字）在垂直方向居中 */
  justify-content: center;               /* 子元素（水平方向居中） */
  width: 400px;                          /* 固定按钮宽度 */
  height: 80px;                          /* 固定按钮高度 */
  background: #fff;                      /* 背景颜色：白色 */
  border: 1px solid #d6d6d6;             /* 灰色边框（stroke 效果） */
  border-radius: 20px;                   /* 圆角半径 20px */
  box-shadow: 0 8px 18px rgba(0,0,0,.08);/* 阴影，向下 8px，模糊 18px，黑色透明度 0.08 */
  text-decoration: none;                 /* 去掉文字下划线（a 标签默认有） */
  color: #111;                           /* 文字颜色为深灰（接近黑色） */
  cursor: pointer;                       /* 鼠标悬停时显示小手 */
  user-select: none;                     /* 禁止文字被选中 */
  transition: transform .15s ease,       /* 鼠标交互时，缩放动画 */
              box-shadow .15s ease;      /* 鼠标交互时，阴影动画 */
}
.button-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0,0,0,.12);
  color: #FD9B2D;   /* 悬停时文字变橘色 */
}
.label {
  font-size: 20px;
  text-align: center;
  font-family: 'OpenDyslexic', Arial, sans-serif;
}
</style>