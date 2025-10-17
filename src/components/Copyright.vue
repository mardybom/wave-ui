<template>
  <div class="footer-wrapper">
    <footer class="copyright-symbol">&copy;</footer>
    <footer class="copyright-text">2025 Wave Edu Project. All rights reserved.</footer>
  </div>
</template>

<style scoped>
.footer-wrapper {
  display: flex;
  flex-direction: row; 
  justify-content: center;
  align-items: center;
  transform: translateY(-30px);
  gap: 6px; 
}

.copyright-symbol {
  color: #888;
  font-size: 36px; 
  line-height: 1;
}

.copyright-text {
  color: #888;
  font-size: 20px;
  line-height: 1;
  text-align: center;
}
</style>
