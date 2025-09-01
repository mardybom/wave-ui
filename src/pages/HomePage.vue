<script setup>
// 引入可复用的导航栏组件（位于 src/components/NavBar.vue）
import NavBar from '@/components/NavBar.vue'
import TopWave from '@/components/TopWave.vue' 
import HomePBlueSection from '@/components/HomePBlueSection.vue'
import HomePGreenSection from '@/components/HomePGreenSection.vue'
import HomePPinkSection from '@/components/HomePPinkSection.vue'
import WaveBlueToGreen from '@/components/WaveBlueToGreen.vue'
import WaveGreenToPink from '@/components/WaveGreenToPink.vue'
import HomePHeroSection from '@/components/HomePHeroSection.vue'




</script>

<template>
  <TopWave />   
  <NavBar />
  <main class="page">
    <HomePHeroSection />
    <HomePBlueSection />
    <WaveBlueToGreen />
    <HomePGreenSection />
    <WaveGreenToPink />
    <HomePPinkSection />






  </main>
</template>

