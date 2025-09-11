<script setup>
import { ref, computed, onMounted, watch, toRefs } from 'vue'

const props = defineProps({
  caseMode: { type: String, default: 'upper' }, // 'upper' | 'lower'
  level:    { type: String, default: 'easy'  }, // 'easy' | 'hard'
})
const { caseMode, level } = toRefs(props)

const base = 'abcdefghijklmnopqrstuvwxyz'.split('')
const idx = ref(Math.floor(Math.random() * base.length))

const make = (cm, lv) => {
  const pick = () => base[Math.floor(Math.random() * base.length)]
  if (lv === 'hard') {
    let a = pick(), b = pick()
    if (b === a) b = pick()
    let s = a + b
    return cm === 'upper' ? s.toUpperCase() : s.toLowerCase()
  } else {
    let a = pick()
    return cm === 'upper' ? a.toUpperCase() : a.toLowerCase()
  }
}

const current = ref(make(caseMode.value, level.value))
const emit = defineEmits(['reveal'])

const nextCard = (cm = caseMode.value, lv = level.value) => {
  current.value = make(cm, lv)
  emit('reveal', current.value)
}

onMounted(() => emit('reveal', current.value))

watch([caseMode, level], () => {
  // regenerate when flips change
  nextCard()
})

// expose next to parent
defineExpose({ nextCard })
</script>

<template>
  <div style="display:none"></div>
</template>
