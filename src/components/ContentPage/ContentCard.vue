<script setup>
defineProps({
  content: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="content-card">
    <div class="content-text" v-html="content"></div>
  </div>
</template>

<style scoped>
.content-card {
  width: 100%;
}

.content-text {
  font-size: 18px;
  line-height: 1.8;
  color: #333;
  text-align: left;
}

.content-text :deep(mark),
.content-text :deep(.highlight) {
  background-color: #ffeb3b;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
}

.content-text :deep(p) {
  margin-bottom: 16px;
}
</style>