<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    class="button-card"
    :class="{ 'button-card--compact': compact }"
    role="button"
    v-bind="$attrs"
    :style="{
      '--bg-url': bg ? `url(${bg})` : 'none',
      '--bg-size': bgSize,
      '--bg-pos': bgPosition,
      '--bg-opacity': bgOpacity
    }"
  >
    <!-- decorative background image -->
    <span class="card-bg" aria-hidden="true"></span>

    <span class="label"><slot>{{ label }}</slot></span>
  </component>
</template>

<script setup>
defineProps({
  label:   { type: String, default: 'assign a name!!' },
  to:      { type: String, default: '' },
  compact: { type: Boolean, default: false },

  /* NEW props for background image */
  bg:          { type: String, default: '' },     // image url / import
  bgSize:      { type: String, default: '120px auto' }, // CSS background-size
  bgPosition:  { type: String, default: 'right 10px bottom 10px' }, // CSS background-position
  bgOpacity:   { type: String, default: '0.18' }  // 0..1, as string for inline var
})
</script>

<style scoped>
/* Base "playing card" styles (used on Start page) */
.button-card {
  position: relative;
  overflow: hidden;
  width: 220px;
  aspect-ratio: 5/7;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1f1f1f;
  border-radius: 18px;
  box-shadow: 0 10px 20px rgba(0,0,0,.12);
  text-decoration: none;
  color: #0f2236;               /* make base text very dark */
  cursor: pointer;
  user-select: none;
  transition: transform .15s ease, box-shadow .15s ease;
}
.button-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px rgba(0,0,0,.16);
  color: #fd9b2d;
}

.label {
  position: relative;           /* stack above bg */
  z-index: 1;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  font-family: 'OpenDyslexic', Arial, sans-serif;
  padding: 0 .7rem;
}

.card-bg {
  position: absolute;
  inset: 0;
  background-image: var(--bg-url);
  background-repeat: no-repeat;
  background-position: var(--bg-pos);
  background-size: var(--bg-size);
  opacity: var(--bg-opacity);
  pointer-events: none;
  mix-blend-mode: normal;
  z-index: 0;                   /* keep bg behind text */
}
/* Compact variant for the MODAL (restores smaller pill/button look) */
.button-card--compact {
  width: auto;
  aspect-ratio: auto;
  min-width: 220px;
  height: auto;
  padding: .85rem 1.25rem;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0,0,0,.10);
}
.button-card--compact .label {
  font-size: 25px;
  line-height: 1.25;
}
</style>
