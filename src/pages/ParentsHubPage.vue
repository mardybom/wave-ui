<script setup>
import NavBar from '@/components/NavBar.vue'
import ParentsFaqMyths from '@/components/ParentsHub/myths.vue'
</script>

<template>
    <NavBar />
    <div class="sky" aria-hidden="true">
     <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0,100 
            C180,180 360,20 540,100 
            C720,180 1000,20 1080,100 
            C1260,180 1440,20 1440,100 
            L1440,0 L0,0 Z"
          fill="#CFEFFF"/>
      </svg>
    </div>
    <ParentsFaqMyths/>
</template>

<style scoped>
.sky{
  position: absolute;
  top: var(--nav-h);
  left: 0; right: 0;
  height: 200px;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}
.wave{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 50%;
}
</style>