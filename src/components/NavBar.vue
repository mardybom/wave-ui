<template>
  <nav class="nav">
    <div class="navbar-inner">
      <!-- Left section: slot for custom content or default branding -->
      <div class="left-section">
        <slot name="left">
          <router-link to="/" class="brand">
            <img src="@/assets/logo.png" alt="" class="logo" />
            <span class="brand-text">Wave</span>
          </router-link>
        </slot>
      </div>

      <!-- Right section: navigation links -->
      <div class="links">
        <router-link 
          v-for="link in links" 
          :key="link.to"
          :to="link.to" 
          class="link" 
          active-class="active"
        >
          <span class="icon" aria-hidden="true">{{ link.icon }}</span>
          <span class="link-text">{{ link.text }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
const links = [
  { to: '/', icon: '🏠', text: 'Home' },
  { to: '/learn', icon: '📖', text: 'Start Learning' },
  { to: '/docs-converter', icon: '🔄', text: 'Docs Converter' },
  { to: '/parents', icon: '💜', text: 'Parents Hub' }
];
</script>

<style scoped>
.nav{
  position: sticky; top: 0; left: 0; right: 0;
  width: 100%;
  z-index: 999;
  background: linear-gradient(to right, #cfeffe 0%, #cfeffe 100%);
  backdrop-filter: saturate(140%) blur(6px);
  border-bottom: 1px solid rgba(15,42,67,0.06);
  border: none !important;
  box-shadow: none !important;
}

.navbar-inner{
  height: 100px;
  max-width: 1700px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-section{
  display: flex;
  align-items: center;
}

.brand{ 
  border-radius: 12px;
  display:flex; 
  align-items:center; 
  gap:10px; 
}

.brand:hover{ 
  background: rgba(15,42,67,.06); 
}

.logo{ 
  width:100px; 
  height:100px; 
  object-fit:contain; 
}

.brand-text{
  font-family: 'OpenDyslexic', system-ui, sans-serif;
  font-weight: 800; 
  letter-spacing: .4px;
  transform: translateX(-15%);
  color: var(--ink-900);
  font-size: 24px;
}

.links{ 
  display:flex; 
  align-items:center; 
  gap:8px; 
}

.link{
  display:flex; 
  align-items:center; 
  gap:8px;
  padding:8px 10px; 
  border-radius: 12px;
  color: var(--ink-700); 
  font-weight: 600;
  font-size: 24px; 
  font-family: 'OpenDyslexic';
}

.link:hover{ 
  background: rgba(15,42,67,.06); 
}

.active{ 
  background: rgba(15,42,67,.08); 
  color: var(--ink-900); 
}

@media (max-width: 1350px) and (min-width: 721px) {
  .link {
    font-size: calc(16px + (24 - 16) * ((100vw - 720px) / (1350 - 720)));
    padding:8px 0px;
    gap:12px;
  }

}

@media (max-width: 720px){
  .brand-text{ display:none; }
  .link{ gap:6px; padding:8px; }
  .link-text{ display:none; }
  .icon{ font-size: 20px; }
}
</style>