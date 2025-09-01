<template>
    <section class="section section--blue">
<!-- 内容容器：限制最大宽度，居中 -->
    <div class="container">
      <img src="@/assets/logo.png" alt="logo-image" class="logo-img" />
    <!-- 上方两段文字放在同一行 -->
    <div class="title-row">
      <h1 class="main-title">WAVE</h1>
        <p class="subtitle">
            Words and Vocabulary for Everyone
        </p>
    </div>
    <div class="under-title-row">
            <p class="description">
            Our platform offers engaging tools, games, and resources designed
            to support children with dyslexia on their reading journey.
            </p>
    </div>
    </div>
    </section>

</template>

<style scoped>

  /* 让该区段“破出” #app 的最大宽度限制，横向铺满整个视口 */
  .section {
    position: relative;                     /* 为后续可能的绝对定位子元素提供定位上下文 */
    margin-left: calc(-50vw + 50%);         /* 关键：把容器左边拉到视口左边，实现全宽 */
    width: 100vw;                           /* 宽度=100%视口宽度 */
  }

  /* 蓝色区块：设置最小高度与背景色，作为页面主体的一个内容带 */
    .section--blue {
    min-height: 550px;  /* 至少 500px 高 */
    background: linear-gradient(to bottom, #44c2f8 0%, #BCF8FF 80%, #BCF8FF 100%);
    margin-top: -70px;  /* 👈 往上顶，盖住缝 */
    }

  /* ✅ 内容容器：宽度限制 + 居中 + 两侧留白 */
  .container {
    min-height: 500px;
    width: 1200px;  /* 大屏最大 1200px，小屏占 92% */
    margin: 0 auto;            /* 居中 */
    position: relative;        /* 作为子元素（白盒子/松鼠等）的定位参考 */
  }

  .logo-img {
    position: absolute;   /* 绝对定位，相对父容器 */
    top: 20%;             /* 距离父容器顶部 30% */
    right: 38%;            /* 距离父容器左边 38% */
    width: 300px;   /* 控制图片大小 */
    clip-path: inset(0 0 37% 0); /* 从下裁掉 37% */
  }

.title-row {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translateX(-50%);
  
  display: flex;
  flex-direction: column;  /* 👈 改为纵向排列 */
  justify-content: center; 
  align-items: center;     /* 居中对齐 */
  gap: 6px;                /* 上下间距 */
}

.main-title {
  font-size: 60px;
  font-weight: bold;
  color: black;

}

.subtitle {
  font-size: 22px;
  font-weight: bold;
  color: black;
  position: relative;
  top: -20px; /* 往上移动 5px */
  line-height: 1.1;
  font-family: 'OpenDyslexic', Arial, sans-serif; /* 👈 单独指定 */

}

.under-title-row {
  position: absolute;      /* 绝对定位，相对父容器 */
  top: 80%;                /* 距离父容器顶部 70% */
  left: 50%;               /* 水平居中 */
  transform: translateX(-50%); /* 修正居中 */
  
  display: flex;
  justify-content: center; /* 内部元素横向居中 */
  align-items: baseline;   /* 保证文字对齐 */
  gap: 10px;               /* 两个文字之间的间距 */
}

/* 下面的介绍文字 */
.description {
  font-size: 20px;
  margin-left: auto;
  margin-right: auto; /* 保证说明文字在中间 */
  color: black;
  font-family: 'OpenDyslexic', Arial, sans-serif; /* 👈 单独指定 */

}
</style>