<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    class="button-card"
    :class="{ 'button-card--compact': compact }"
    role="button"
    v-bind="$attrs"
  >
    <span class="label"><slot>{{ label }}</slot></span>
  </component>
</template>

<script setup>
defineProps({
  label:   { type: String, default: 'assign a name!!' },
  to:      { type: String, default: '' },   // e.g. '/learn/alphabet'
  compact: { type: Boolean, default: false } // 👈 new
})
</script>

<style scoped>
/* Base “playing card” styles (used on Start page) */
.button-card {
  width: 240px;
  aspect-ratio: 5 / 7;                 /* 2.5in:3.5in look */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #1f1f1f;
  border-radius: 18px;
  box-shadow: 0 10px 18px rgba(0,0,0,.12);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  user-select: none;
  transition: transform .15s ease, box-shadow .15s ease;
}
.button-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 28px rgba(0,0,0,.16);
  color: #FD9B2D;
}
.label {
  font-size: 25px;
  font-weight: 300;
  text-align: center;
  font-family: 'OpenDyslexic', Arial, sans-serif;
  padding: 0 .75rem;
}

/* 👇 Compact variant for the MODAL (restores smaller pill/button look) */
.button-card--compact {
  width: auto;
  aspect-ratio: auto;        /* cancel card ratio */
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
