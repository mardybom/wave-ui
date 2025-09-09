<template>
  <div class="text-contents">
    <h1 class="title">They Prove Dyslexia is Not a Barrier</h1>
    <p class="contents">Albert Einstein, Leonardo da Vinci, Steve Jobs, <br>
        and many others lived with dyslexia. <br>
        Through creativity and perseverance, they showed the world the power of thinking differently.<br>
    </p>
    <p class="YouCan contents">You can too!!</p>    
  </div>

  <div class="wrap-box">
    <div class="people-slider">
         <div class="people-card">
            <img src="@/assets/HomePage_famous_image/Keira_Knightley.jpg" alt="Keira Knightley" class="card-img" />
            <p class="card-name">Keira Knightley</p>
        </div>       
        <div class="people-card">
            <img src="@/assets/HomePage_famous_image/Albert_Einstein.jpg" alt="Einstein" class="card-img" />
            <p class="card-name">Albert Einstein</p>
        </div>
        <div class="people-card">
            <img src="@/assets/HomePage_famous_image/Leonardo_da_Vinci.jpg" alt="Vinci" class="card-img" />
            <p class="card-name">Leonardo da Vinci</p>
        </div>
        <div class="people-card">
            <img src="@/assets/HomePage_famous_image/Steven_Paul_Jobs.jpg" alt="Steve Jobs" class="card-img" />
            <p class="card-name">Steve Jobs</p>
        </div>
        <div class="people-card">
            <img src="@/assets/HomePage_famous_image/Richard_Branson.jpg" alt="Richard Branson" class="card-img" />
            <p class="card-name">Richard Branson</p>
        </div>
        <div class="people-card">
            <img src="@/assets/HomePage_famous_image/Walt_Disney.jpg" alt="Walt Disney" class="card-img" />
            <p class="card-name">Walt Disney</p>
        </div>

    </div>
    <div class="edge edge--right"></div>
    <div class="edge edge--left"></div>
  </div>
</template>

<style scoped>

.text-contents {
  position: absolute;
  text-align: center;          /* 整体居中*/
  top: 110%;
  left: 12%;
}

.title {
  font-family: 'OpenDyslexic', Arial, sans-serif;  /* 👈 使用 Dyslexic 字体 */
  font-size: 32px;             /* 标题字号 */
  font-weight: bold;           /* 粗体 */
  color: #333;                 /* 深灰色，比纯黑柔和 */
  margin-bottom: 20px;         /* 和下面内容保持距离 */
}

.contents {
  font-family: 'OpenDyslexic', Arial, sans-serif;  /* 👈 使用 Dyslexic 字体 */
  font-size: 18px;             /* 正文字号 */
  line-height: 1.6;            /* 行高，让文字更好读 */
  color: #2a2a2a;                 /* 深灰色 */
  max-width: 700px;            /* 限制宽度避免太长 */
  margin: 0 auto;              /* 水平居中 */
}

.YouCan {
  font-size: 24px;             /* 正文字号 */
  line-height: 2;            /* 行高，让文字更好读 */
  color: #212121;                 /* 深灰色 */
}

/* Slider bar part */
.wrap-box{
  position: absolute;
  top: 135%;
  left: 16%;
  /* 距离上方的间距，用 margin 控制，而不是 top:100% */
  /* 居中并限制宽度（也可写成 width: 800px; margin: 100px auto 0;） */
  height: 330px;
  width: 800px;
  margin-left: auto;
  margin-right: auto;

  /* 如果你希望 wrap-box 背景或阴影包住整个滑动区域，可以在这里加 */
  /* background: #fff; border-radius: 20px; box-shadow: 0 4px 8px rgba(0,0,0,.2); */
}
.people-slider {
  display: flex;                  /* 横向排列 */
  overflow-x: auto;               /* 开启横向滚动 */
  scroll-snap-type: x mandatory;  /* 滚动捕捉，自动对齐 */
  -webkit-overflow-scrolling: touch; /* 移动端流畅滚动 */
  gap: 20px;                      /* 卡片间距 */
  padding: 0 40px;   /* 上下 0，左右 40px */
  margin: 0 auto;                      /* 横向居中父容器 */
  border-radius: 20px;
  height: 100%;
  box-sizing: border-box;   /* 让 padding 计入 100% 宽高中，避免撑破 */
  align-items: center; /* 先垂直居中 */

}

.people-card {
  flex: 0 0 auto;                 /* 保持固定宽度，不被压缩 */
  width: 150px;
  height: 210px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  display: flex;                  
  align-items: center;            
  font-weight: bold;
  margin-top: 30px;  /* 每张卡片下移 40px */
  transition: transform 200ms ease, box-shadow 200ms ease;
  will-change: transform, box-shadow;   /* 可选：提升性能 */
  transform-origin: center bottom;      /* 可选：以底边为参考放大，更自然 */
  flex-direction: column;   /* 让图片和名字上下排列 */
}

.people-card:hover {
  transform: scale(1.1);                      /* 悬停放大 */
  box-shadow: 0 10px 24px rgba(0,0,0,0.22);    /* 阴影更明显（可选） */
  z-index: 1;                                  /* 叠在邻居上（可选） */
}

.card-img {
  width: 100%;        /* 图片宽度等于卡片宽度 */
  height: auto;       /* 高度自动，保持比例 */
  border-radius: 12px 12px 12px 12px;  /* 上面两个角圆角，和卡片贴合 */
  display: block;     /* 避免图片下面有空隙 */

}

.card-name {
  font-size: 14px;
  font-family: 'OpenDyslexic', Arial, sans-serif;
  text-align: center;   /* 居中 */
  margin-top: 8px;      /* 与图片留一点间距 */
  color:rgb(0, 0, 0);
}

/* 右侧遮罩条：贴右边，100% 高，20px 宽，做透明度渐变 */
.edge{
  position: absolute;
  top: 0;
  height: 100%;
  width: 20px;
  z-index: 2;             /* ⬅️ 盖在卡片上 */
  pointer-events: none;   /* ⬅️ 只做装饰，不阻挡滚动/点击 */
  border-radius: inherit; /* 圆角跟随父容器 */
  border-radius: 20px;
}
/* 右侧遮罩：从 100% 不透明蓝 → 50% 透明蓝（方向：右 → 左） */
.edge--right{
  right: 0;
  width: 40px;
  height: 100%;
    background: linear-gradient(
    to left,
    rgba(255, 224, 224, 1)   0%,
    rgba(255, 224, 224, 0) 100%
  );
  position: absolute;
  top: 0;
  z-index: 2;
  pointer-events: none;
  border-radius: inherit;
}

.edge--left{
  left: 0;
  width: 40px;
  height: 100%;
    background: linear-gradient(
    to left,
    rgba(255, 224, 224, 0)   0%,
    rgba(255, 224, 224, 1) 100%
  );
  position: absolute;
  top: 0;
  z-index: 2;
  pointer-events: none;
  border-radius: inherit;
}



</style>