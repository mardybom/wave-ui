<template>
  <nav class="nav">
    <img src="@/assets/logo.png" alt="Logo" class="logo" />

    <div class="nav-links">
      <a href="#"
         :class="{ active: currentHash === '#about' }"
         @click.prevent="scrollToTop">About Us</a>
         

      <a href="#learn"
         :class="{ active: currentHash === '#learn' }"
         @click="setHash('#learn')">Start Learning</a>

      <a href="#progress"
         :class="{ active: currentHash === '#progress' }"
         @click="setHash('#progress')">Parents Hub</a>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 当前 URL 的 hash（默认给个初值）
const currentHash = ref(window.location.hash || '#about')

// 点击时先更新一次（无需等浏览器触发 hashchange）
const setHash = (h) => { currentHash.value = h }

// ✅ 新增：平滑滚动到最顶端
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  currentHash.value = '#about'   // 标记「About Us」为激活状态
}

// 监听地址栏 # 变化（滚动或浏览器前进/后退都会触发）
const onHashChange = () => { currentHash.value = window.location.hash || '#about' }

onMounted(() => window.addEventListener('hashchange', onHashChange))
onBeforeUnmount(() => window.removeEventListener('hashchange', onHashChange))
</script>

<style scoped> /* scoped 表示这些样式只作用在本组件里 */

/* 导航栏整体样式 */
.nav {
  position: fixed;            /* 固定在屏幕顶部，不随页面滚动 */
  top: 0;                     /* 顶部位置为 0 */
  left: 0;                    /* 左边位置为 0 */
  height: 60px;               /* 导航栏高度 */
  width: 100%;                /* 占满整个宽度 */
  display: flex;              /* 启用 flex 布局 */
  justify-content: space-between; /* 左右两边对齐：logo 在左，链接在右 */
  align-items: center;        /* 垂直方向居中 */
  background: #ffffff;        /* 背景色为白色 */
  padding: 12px 50px;         /* 内边距：上下 12px，左右 50px */
  z-index: 1000;              /* 设置层级，保证在其他元素上面 */
  overflow: visible;          /* 内容允许溢出（例如 logo 比导航栏高时不会被裁掉） */
}

/* logo 样式 */
.logo {
  height: 100px;              /* logo 图片高度，明显比导航栏高 */
  transform: translateY(24px);/* 向下平移 24px，使 logo 探出导航栏底部 */
}

/* 导航文字的容器 */
.nav-links {
  display: flex;              /* 横向排列链接 */
  gap: 30px;                  /* 链接之间的间距 30px */
  transform: translateX(-20%);/* 向左移动 20% 宽度，让整体位置更靠中 */
}

/* 链接样式 */
a {
  color: #000000;             /* 字体颜色为黑色 */
  text-decoration: none;      /* 去掉下划线 */
  font-weight: 600;           /* 半粗体 */
}

/* 链接 hover 样式 */
a:hover {
  color: #FD9B2D;             /* 悬停时字体变成橙色 */
  background: none;           /* 去掉背景变化（防止继承全局 hover 样式） */
}

.active {
  color: #FD9B2D; /* 当前页面橘色 */
}

</style>