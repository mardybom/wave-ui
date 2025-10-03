<!-- 
  这是一个通用的游戏页面头部组件。
  它会在页面开头渲染一个标题（h1）和一段简短的描述文字，适合复用在不同的游戏页面。

  可传入的参数 (Props):
  - title: String，必填 (required)
    页面标题（显示在 h1 中）
    Example: <GameHeader title="Sentence Rearranging" description="Rearrange the words..." />
    
  - description: String，必填 (required)
    页面简短描述（显示在标题下方）
    Example: <GameHeader title="Image Labelling" description="Look at the picture and choose the correct word!" />


  A reusable header component for game pages.  
  It displays a title (h1) and a short description below it, useful for multiple game screens.  

  Props you can pass in:
  - title: String, required  
    The page title (displayed in <h1>).  
    Example: <GameHeader title="Sentence Rearranging" description="Rearrange the words..." />

  - description: String, required  
    The short description (displayed under the title).  
    Example: <GameHeader title="Image Labelling" description="Look at the picture and choose the correct word!" />
-->
<template>
  <div class="titlePart">
    <header class="dw-head">
      <div class="head-row">
        <h1>{{ title }}</h1>
      </div>
      <p>{{ description }}</p>
    </header>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
})
</script>

<style scoped>
.titlePart {
  width: 100vw;
  display: flex;
  align-items: center;      
  justify-content: center;  
  flex-direction: row;
  position: relative;
  z-index: 100;
  margin-top: 30px;   
  margin-bottom: 20px;
}

.head-row { 
  display: flex; 
  align-items: center; 
}
.dw-head h1 { 
  font-size: clamp(36px, 4vw, 56px); 
  margin: 0; 
}
.dw-head p { 
  font-size: clamp(20px, 4vw, 22px); 
  margin: 0; 
  transform: translateX(30px);
}
</style>