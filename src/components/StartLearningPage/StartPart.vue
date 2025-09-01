<template>
<div class="startPart">
    <div class="leftImage">
        <img src="@/assets/squirrel_1.png" alt="Squirrel" class="squirrel-img" />
    </div>
    <div class="rightContent">
        <p class="textContent_1">
            Ready, set, go! !<br/>
            Choose a game and show how amazing you are!
        </p>
    </div>

</div>

</template>


<style scoped>

.startPart {
  position: relative;
  width: 1000px;
  height: 250px;
  padding-top: 80px; /* 给 NavBar 留点空间，不然文字会被覆盖 */
  text-align: center;
  background-color: aqua;
  margin: 0 auto;
}

.squirrel-img {
    position: absolute;
    height: 100%;   /* 图片高度和父容器对齐 */
    object-fit: contain; /* 保持比例缩放，不会被压扁 */
    width: 200px;
    top: 10%;
    left: 10%;
    transform: scaleX(-1); /* 👈 水平翻转 */
}
</style>