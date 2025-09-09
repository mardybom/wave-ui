<template>
    <section class="section section--green">
<!-- 内容容器：限制最大宽度，居中 -->
    <div class="container">
      <div class="white-box">
        <!-- 标题 -->
        <h2 class="circle-title">ITS OKAY NOT TO BE OKAY</h2>
        <!-- 一整个 p，用 <br> 来分行 -->
        <p class="circle-text">
          Every challenge is a step forward!!! <br>
          With out tools, practice can feel like PLAY <br>
          So every child can grow up in confidence <br>
          Because. Dyslexia is not a disability <br>
          Its a DIFFERENT ABILITY <br>
        </p>
      </div>

      <!-- hibby图片 -->
      <img src="@/assets/hibby_1.png" alt="hibby_1" class="hibby-img" />

    </div>
    </section>

</template>

<style scoped>

  /* 让该区段“破出” #app 的最大宽度限制，横向铺满整个视口（全出血） */
  .section {
    position: relative;                     /* 为后续可能的绝对定位子元素提供定位上下文 */
    margin-left: calc(-50vw + 50%);         /* 关键：把容器左边拉到视口左边，实现全宽 */
    width: 100vw;                           /* 宽度=100%视口宽度 */
    transform: translateY(-1px); /* 👈 上抬 1px 覆盖接缝 */

  }

  /* 绿色区块：设置最小高度与背景色，作为页面主体的一个内容带 */
  .section--green {
    min-height: 700px;                     /* 至少 800px 高 */
    background: #CDFFE0;                    /* 绿色背景 */
  }

  /* ✅ 内容容器：宽度限制 + 居中 + 两侧留白 */
  .container {
    min-height: 700px;
    width: 1200px;  /* 大屏最大 1200px，小屏占 92% */
    margin: 0 auto;            /* 居中 */
    position: relative;        /* 作为子元素（白盒子/松鼠等）的定位参考 */
  }

  .white-box {
    position: absolute;   /* 绝对定位，相对父容器 */
    top: 20%;             /* 距离父容器顶部 20% */
    Right: 15%;
    width: 600px;               /* 宽度 */
    height: 450px;              /* 高度 */
    background: white;           /* 白色背景 */
    border-radius: 200px 80px 200px 0;         /* 圆角 */
    box-shadow: 0 8px 16px rgba(0,0,0,0.2); /* 阴影，可选 */
    /* 关键修改 ↓↓↓ */
    display: flex;              /* 开启弹性布局 */
    flex-direction: column;     /* 子元素竖向排列（标题在上、段落在下） */
    justify-content: center;    /* 垂直方向整体居中（想靠上可用 flex-start） */
    padding: 10px 10px;         /* 给内部留点边距，避免文字贴边 */
    text-align: center;         /* 文本居中 */
  }

  /* 标题样式 */
  .circle-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    color: rgb(0, 0, 0);
    font-family: 'OpenDyslexic', Arial, sans-serif; 

  }

  /* 内容文字样式 */
  .circle-text {
    font-size: 18px;
    line-height: 1.6;
    text-align: center; /* 居中对齐 */
    color: rgb(0, 0, 0);
    font-family: 'OpenDyslexic', Arial, sans-serif; 

  }

  .hibby-img {
    position: absolute;   /* 绝对定位，相对父容器 */
    top: 50%;             /* 距离父容器顶部 50% */
    left: 13%;            /* 距离父容器左边 10% */
    width: 230px;   /* 控制图片大小 */
  }


</style>