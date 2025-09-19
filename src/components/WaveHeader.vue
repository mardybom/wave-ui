<!-- 
  🌊 WaveHeader 组件介绍 / Component Introduction

  这是一个用于页面顶部的装饰性波浪组件。
  它会渲染一条蓝色的 SVG 波浪，通常用来美化页面头部背景。
  
  可传入的参数 (Props):
  - top: String，默认值 '80px'
    用于设置组件距离页面顶部的偏移。
    Example: <WaveHeader top="100px" />
  
  - height: String，默认值 '200px'
    设置波浪区域的高度。
    Example: <WaveHeader height="250px" />
  
  - zIndex: Number | String，默认值 0
    设置组件的层级位置（图层堆叠顺序）。
    Example: <WaveHeader zIndex="-1" />

  🌊 WaveHeader Component

  This is a decorative wave component for the top of a page.  
  It renders a blue SVG wave, usually used to enhance the page header background.  

  Props you can pass in:
  - top: String, default '80px'  
    Controls the offset distance from the top of the page.  
    Example: <WaveHeader top="100px" />

  - height: String, default '200px'  
    Controls the height of the wave area.  
    Example: <WaveHeader height="250px" />

  - zIndex: Number | String, default 0  
    Controls the stacking order (layering) of the wave.  
    Example: <WaveHeader zIndex="-1" />
-->

<template>
  <div
    class="sky"
    :style="{
      top: top,
      height: height,
      zIndex: zIndex,
    }"
    aria-hidden="true"
  >
    <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
      <path
        d="M0,100 
          C180,180 360,20 540,100 
          C720,180 1000,20 1080,100 
          C1260,180 1440,20 1440,100 
          L1440,0 L0,0 Z"
        fill="#CFEFFF"   
      />
    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  top: { type: String, default: '80px' },
  height: { type: String, default: '200px' },
  zIndex: { type: [Number, String], default: 0 },
})
</script>

<style scoped>
.sky {
  position: absolute;
  left: 0;
  right: 0;
  overflow: hidden;
  pointer-events: none;
}

.wave {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
}
</style>