<template>
    <section class="section section--green">
<!-- 内容容器：限制最大宽度，居中 -->
    <div class="container">
      <div class="white-box">
        <!-- 标题 -->
        <h2 class="circle-title"> HELLO!! and Welcome to WAVE</h2>
        <!-- 一整个 p，用 <br> 来分行 -->
        <p class="circle-text">
           <br>
          Ready for an adventure with ENGLISH? <br>
          Lets play, learn and grow together!!! <br>
        </p>
        <router-link to="/learn" class="buttonToLearningPage">
          <p class="Learn_button">LEARN</p> 
        </router-link>
      </div>

      <!-- 小松鼠图片 -->
      <img src="@/assets/squirrel_1.png" alt="squirrel_img_1" class="squirrel-img" />

      <!-- 两个气泡 -->
      <div class="bubble_1"></div>
      <div class="bubble_2"></div>
    </div>
    </section>

</template>

<style scoped>

  .buttonToLearningPage {
    height: 50px;
    width: 100px;
    background-color: rgb(232, 5, 122);
    position: absolute;
    left:40%;
    top: 80%;
    border-radius: 20px;
    text-align: center;
    line-height: 50px;
  }

  .Learn_button {
    color: rgb(242, 242, 242);
    font-family: 'OpenDyslexic', Arial, sans-serif; 
  }

  /* 让该区段“破出” #app 的最大宽度限制，横向铺满整个视口（全出血） */
  .section {
    position: relative;                     /* 为后续可能的绝对定位子元素提供定位上下文 */
    margin-left: calc(-50vw + 50%);         /* 关键：把容器左边拉到视口左边，实现全宽 */
    width: 100vw;                           /* 宽度=100%视口宽度 */
  }

  /* 绿色区块：设置最小高度与背景色，作为页面主体的一个内容带 */
  .section--green {
    min-height: 500px;                     /* 至少 800px 高 */
    background: #BCF8FF;                    /* 绿色背景 */
  }

  /* ✅ 内容容器：宽度限制 + 居中 + 两侧留白 */
  .container {
    min-height: 500px;
    width: 1200px;  /* 大屏最大 1200px，小屏占 92% */
    margin: 0 auto;            /* 居中 */
    position: relative;        /* 作为子元素（白盒子/松鼠等）的定位参考 */
  }

  .white-box {
    position: absolute;   /* 绝对定位，相对父容器 */
    top: 5%;             /* 距离父容器顶部 20% */

    left: 10%;
    width: 550px;               /* 宽度 */
    height: 450px;              /* 高度 */
    background: white;           /* 白色背景 */
    border-radius: 300px;         /* 圆角 */
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
    font-size: 24px;
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

  .bubble_1 {
    position: absolute;   /* 绝对定位，相对父容器 */
    top: 50%;             /* 距离父容器顶部 20% */
    right: 35%;            /* 距离父容器左边 35% */
    width: 80px;               /* 宽度 */
    height: 80px;              /* 高度 */
    background: white;           /* 白色背景 */
    border-radius: 200px;         /* 圆角 */
    box-shadow: 0 8px 16px rgba(0,0,0,0.2); /* 阴影，可选 */
  }

  .bubble_2 {
    position: absolute;   /* 绝对定位，相对父容器 */
    top: 58%;             /* 距离父容器顶部 58% */
    right: 30%;            /* 距离父容器左边 30% */
    width: 40px;               /* 宽度 */
    height: 40px;              /* 高度 */
    background: white;           /* 白色背景 */
    border-radius: 200px;         /* 圆角 */
    box-shadow: 0 8px 16px rgba(0,0,0,0.2); /* 阴影，可选 */
  }

  .squirrel-img {
    position: absolute;   /* 绝对定位，相对父容器 */
    top: 40%;             /* 距离父容器顶部 50% */
    right: 10%;            /* 距离父容器左边 10% */
    width: 200px;   /* 控制图片大小 */
  }


</style>