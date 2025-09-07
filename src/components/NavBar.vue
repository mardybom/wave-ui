<template>
  <nav class="nav">
    <div class="navbar-inner">
      <router-link to="/" class="link">
        <img src="@/assets/logo.png" alt="" class="logo" />
        <span class="brand-text">Wave</span>
      </router-link>

      <div class="links">
        <router-link to="/"        class="link" active-class="active">
          <span class="icon" aria-hidden="true">🏠</span> Home
        </router-link>
        <router-link to="/learn"   class="link" active-class="active">
          <span class="icon" aria-hidden="true">📖</span> Start Learning
        </router-link>
        <router-link to="/parents" class="link" active-class="active">
          <span class="icon" aria-hidden="true">💜</span> Parents Hub
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
/* none */
</script>

<style scoped>
.nav{
  position: sticky; top: 0; left: 0; right: 0;
  width: 100%;
  z-index: 1000;
  background: linear-gradient(to right, #cfeffe 0%, #cfeffe 100%);
  backdrop-filter: saturate(140%) blur(6px);
  border-bottom: 1px solid rgba(15,42,67,0.06);
  border: none !important;
  box-shadow: none !important;
}

/* full width bar, but center the contents up to a max width */
.navbar-inner{
  height: 100px;          /* pick the exact height your bar uses */
  max-width: 1700px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.brand{ display:flex; align-items:center; gap:10px; }
.logo{ width:100px; height:100px; object-fit:contain; }
.brand-text{
  font-family: 'OpenDyslexic', system-ui, sans-serif;
  font-weight: 800; letter-spacing: .4px;
  transform: translateX(-15%);
  color: var(--ink-900);
  font-size: 24px;
}

.links{ display:flex; align-items:center; gap:8px; }
.link{
  display:flex; align-items:center; gap:8px;
  padding:8px 10px; border-radius: 12px;
  color: var(--ink-700); font-weight: 600;
  font-size: 24px; font-family: 'OpenDyslexic';
}
.link:hover{ background: rgba(15,42,67,.06); }
.active{ background: rgba(15,42,67,.08); color: var(--ink-900); }

@media (max-width: 720px){
  .brand-text{ display:none; }
  .link{ gap:6px; padding:8px; }
}
</style>
