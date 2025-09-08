<script setup>
import ButtonCard from '@/components/StartLearningPage/ButtonCard.vue'

const emit = defineEmits(['close'])
const close = () => emit('close')
</script>


<template>
  <teleport to="body">
    <div
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <div class="modal-box">
        <h2 class="modal-text">Alphabet Mastery</h2>
        <p class="modal-text">Learn the alphabet in a fun and interactive way!</p>

        <div class="modal-actions">
          <ButtonCard compact label="Letter sound mapping" to="/letter-sound" />
        </div>
        <div class="modal-actions">
          <ButtonCard compact label="Digital writing" to="/Digital-writing" />
        </div>
      </div>
    </div>
  </teleport>
</template>



<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-box {
  background: #fff;
  border-radius: 30px;
  padding: 50px 50px;

  text-align: center;
  box-shadow: 0 8px 100px rgba(0,0,0,0.2);
  background-color: var(--bg-cream);
  
  display: flex; 
  flex-direction: column;
  gap: 25px;

}

.modal-text {
  font-family: 'OpenDyslexic', sans-serif;
  font-size: 25px;
  color: #000000;
  line-height: 1.5;
}



</style>