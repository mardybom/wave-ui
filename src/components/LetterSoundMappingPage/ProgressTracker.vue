<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true }, // 1-based
  total:   { type: Number, required: true },
})

const pct = computed(() =>
  Math.min(100, Math.max(0, (props.current) / (props.total - 1) * 100))
)

const emit = defineEmits(['jump'])
const jumpTo = (n) => emit('jump', n)
</script>

<template>
  <div class="rail" role="navigation" aria-label="Progress by letter">
    <div class="numbers">{{ total }}</div>

    <div class="track">
      <div class="fill" :style="{ height: pct + '%' }"></div>
    </div>

    <div class="numbers">01</div>
  </div>
</template>

<style scoped>
/* Use one width variable so labels and track always match */
.rail {
  --track-w: 50px;            /* change this once to resize everything */
  display: flex;
  flex-direction: column;
  align-items: center;        /* center labels with the bar */
  width: var(--track-w);      /* rail matches track width */
  gap: 12px;
}

/* Labels */
.numbers {
  width: 100%;                /* same width as track */
  text-align: center;         /* horizontally center the digits */
  font-weight: 800;
  font-size: 20px;
  color: #0f2b46;
  line-height: 1;
  /* remove previous translateY offsets */
}

/* Track */
.track {
  width: var(--track-w);
  height: min(60vh, 520px);
  background: rgba(0,0,0,0.15);
  border-radius: 999px;
  position: relative;
  overflow: hidden;
}

/* Fill */
.fill {
  background: #FD9B2D;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  box-shadow: inset 0 0 7.6px rgba(0,0,0,0.15);
}

/* Optional: if you later render a circular thumb */
.thumb {
  width: 34px;
  height: 34px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.9);
  box-shadow: 0 6px 14px rgba(0,0,0,0.18);
}
</style>
