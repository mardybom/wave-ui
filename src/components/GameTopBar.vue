<template>
  <header class="game-topbar">
    <!-- 固定返回到 /learn -->
    <router-link to="/learn" class="back">< Back</router-link>
    <!-- 中间显示当前游戏名（由父组件传入） -->
    <h1 class="title">{{ title }}</h1>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Game' }
})
</script>

<style scoped>
.game-topbar {
  height: 60px;
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
}

.back {
  position: absolute;
  left: 5%;
  top: 50%;
  transform: translate(-50%, -50%); 
  padding:10px 20px;
  text-decoration: none;
  font-size: 18px;
  font-family: 'OpenDyslexic', Arial, sans-serif; 
  color: black;
}

.title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); 
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  pointer-events: none;     /* 不挡住返回按钮的点击 */
  font-family: 'OpenDyslexic', Arial, sans-serif; 
  color: black;
}

.back:hover {
  color: #FD9B2D;
  background: none;
  font-size: 22px;
  font-weight: bold;
}
</style>