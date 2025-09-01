<template>
  <nav class="nav">
    <img src="@/assets/logo.png" alt="Logo" class="logo" />

    <div class="nav-links">
      <router-link to="/"        class="link" active-class="active">About Us</router-link>
      <router-link to="/learn"   class="link" active-class="active">Start Learning</router-link>
      <router-link to="/parents" class="link" active-class="active">Parents Hub</router-link>
    </div>
  </nav>
</template>

<script setup>
// 不需要任何脚本逻辑了
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0; left: 0;
  height: 60px; width: 100%;
  display: flex; justify-content: space-between; align-items: center;
  background: #fff; padding: 12px 50px; z-index: 1000; overflow: visible;
}
.logo { height: 100px; transform: translateY(24px); }
.nav-links { display: flex; gap: 30px; transform: translateX(-20%); }

.link { color: #000; text-decoration: none; font-weight: 600; }
.link:hover { color: #FD9B2D; background: none; }

.active { color: #FD9B2D; }
</style>