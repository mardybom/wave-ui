<!-- src/components/PasswordGate.vue -->
<template>
  <div class="gate">
    <h2>Enter Passcode</h2>
    <input
      v-model.trim="input"
      type="password"
      placeholder="Passcode"
      @keyup.enter="submit"
      :class="{ 'error-input': error }" 
    />
    <button @click="submit">Unlock</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const input = ref('')
const error = ref(false)
const route = useRoute()
const router = useRouter()

const PASS = 'hello'

function submit() {
  if (input.value === PASS) {
    sessionStorage.setItem('wave_pw', '1')
    router.replace('/')
  } else {
    error.value = true
    setTimeout(() => {
      error.value = false
    }, 3000)
  }
}
</script>

<style scoped>
.gate {
  min-height: 60vh;
  display: grid;
  place-items: center;
  gap: 12px;
}

input, button {
  font-size: 16px;
  padding: 10px 12px;
}

.error-input {
  border: 5px solid red;
  outline: none;
  transition: border 0.3s ease;
}
</style>