<script setup>
const props = defineProps({
  char:  { type: String, required: true },
  index: { type: Number, required: true },
})
</script>

<template>
  <div class="letter-card">
    <div class="letters">
      <div class="upper">{{ char.toUpperCase() }}</div>
      <div class="lower">{{ char.toLowerCase() }}</div>
    </div>
  </div>
</template>

<style scoped>
.letter-card {
  position: relative;
  width: 240px;
  height: 240px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  place-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.letter-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0,0,0,.15);
}

.letters {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30px;
}

.upper {
  font-size: 84px;
  font-weight: bold;
}
.lower {
  font-size: 64px;
  margin-top: 20px;
}
</style>
