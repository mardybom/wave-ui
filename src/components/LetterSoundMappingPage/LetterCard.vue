<script setup>
defineProps({
  char: String,   // 传入字母
  index: Number,  // 当前第几个字母
})
defineEmits(['play']) // 点击时发出 play 事件
</script>


<template>
  <!-- 整个卡片就是可点击区域 -->
  <button
    class="letter-card"
    type="button"
    @click="$emit('play', char)"
  >
    <div v-if="index" class="idx">{{ index }}/26</div>
    <div class="upper">{{ char?.toUpperCase() }}</div>
    <div class="lower">{{ char?.toLowerCase() }}</div>
  </button>
</template>

<style scoped>
.letter-card {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  align-items: center;
  justify-content: center;
  width: 240px;
  height: 240px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.letter-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.idx {
  font-size: 14px;
  margin-bottom: 8px;
}

.upper {
  font-size: 64px;
  font-weight: bold;
}

.lower {
  font-size: 36px;
  color: #555;
}
</style>