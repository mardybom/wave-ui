<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true }, // 1-based
  total:   { type: Number, required: true },
})

const pct = computed(() => Math.min(100, Math.max(0, (props.current ) / (props.total - 1) * 100)))

const emit = defineEmits(['jump'])

const jumpTo = (n) => emit('jump', n)
</script>

<template>
  <div class="rail" role="navigation" aria-label="Progress by letter">
  <!-- TOP label should be the total -->
  <div class="numbers top">{{ total }}</div>

  <!-- Track + thumb -->
  <div class="track">
    <div class="fill" :style="{ height: pct + '%' }"></div>
  </div>

  <!-- BOTTOM label should be 1 -->
  <div class="numbers bottom">01</div>
</div>
</template>

<style scoped>
.rail {
  width: 84px;              /* was ~56–72px */
  gap: 12px;
}

/* Labels */
.numbers {
  font-weight: 800;
  position:inherit;
  font-size: 20px;          /* bigger text */
  color: #0f2b46;
}

/* Thicker & taller track */
.track {
  width: 50px;                                /* was ~14–18px */
  height: min(60vh, 520px);                   /* make the bar tall */
  background: rgba(0,0,0,0.15);
  border-radius: 999px;
  position: relative;
  overflow: hidden;
}

/* Fill remains your brand orange */
.fill {
  background: #FD9B2D;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  box-shadow: inset 0 0 7.6px rgba(0,0,0,0.15);
}

/* Larger thumb */
.thumb {
  width: 34px;              /* was 26–32px */
  height: 34px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.9);
  box-shadow: 0 6px 14px rgba(0,0,0,0.18);
}
</style>
