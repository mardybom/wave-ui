<template>
  <section class="hero" aria-labelledby="hero-title">
    <!-- Decorative wave spans the full viewport width -->
    <div class="sky" aria-hidden="true">
      <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0,60 C180,120 360,0 540,40 C720,80 900,200 1080,160 C1260,120 1440,40 1440,40 L1440,0 L0,0 Z"
          fill="#CFEFFF"/>
      </svg>
    </div>

    <!-- Inner content constrained -->
    <div class="container grid">
      <header class="copy">
        <h1 id="hero-title">Ride the WAVE to Reading Success!</h1>
        <p class="tagline">Play games, hear sounds, and practice writing. WAVE makes learning joyful!</p>

        <div class="cta">
          <router-link to="/learn" class="btn btn--primary" aria-label="Start Playing">
            🚀 <span>Start Playing</span>
          </router-link>
          <router-link to="/parents" class="btn btn--secondary" aria-label="For Parents">
            💡 <span>For Parents</span>
          </router-link>
        </div>
      </header>

      <div class="mascots">
        <img src="@/assets/group_photo_1.png" alt="" class="mascot" />
      </div>
    </div>
  </section>
</template>

<script setup>
/* none */
</script>

<style scoped>
.hero{
  position: relative;
  width: 100%;
  /* remove big bottom padding if any */
  padding: 24px 0 0;
  background: var(--bg-cream);
  overflow: hidden;

  /* key line: no scroll when only hero is visible */
  min-height: 70dvh; /* or 100svh on mobile */
  display: flex;
  align-items: center;
}

/* top sky wave */
.sky{
  position:absolute; inset:0 0 auto 0; height:160px; pointer-events:none;
}
.wave{ width:100%; height:100%; display:block; }

/* inner layout */
.container{
  max-width: 1650px;
  margin: 0 auto;
  padding: 24px 24px 56px;
}
.grid{
  display:grid;
  grid-template-columns: 1.1fr 1fr;
  align-items:center;
  margin-top: 72px;
}

/* NEW: constrain the copy column so .cta can align its ends */
.copy{
  max-width: clamp(480px, 52vw, 720px);
}

.copy h1{
  font-family: 'OpenDyslexic', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(28px, 4vw, 54px);
  margin: 0 0 8px 0;
  color: var(--ink-900);
}

.tagline{
  margin: 0 0 22px 0;
  font-size: clamp(18px, 2.2vw, 24px);
  color: var(--ink-700);
}

/* CTA row
   justify-between pushes the two buttons to the left/right edges
   of the copy column width above.
*/
.cta{
  display:flex;
  justify-content: space-between;   /* <-- spreads the two buttons */
  align-items: center;
  width: 100%;
  gap: 12px;                        /* keeps a gap if they wrap on small viewports */
  margin-top: 12px;
}

/* BIGGER buttons + icons */
.btn{
  display:inline-flex;
  align-items:center;
  gap: 12px;                        /* space between icon and label */
  padding: 18px 28px;               /* bigger hit area */
  font-size: clamp(16px, 1.6vw, 22px); /* scales text + emoji icon */
  line-height: 1;
  border-radius: 14px;
  font-weight: 800;
  letter-spacing: .2px;
  box-shadow: 0 8px 20px rgba(0,0,0,.08);
  transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
}

.btn--primary{ background: var(--cta-1);
  color:#14120F; 
  position: relative;
  z-index: 0;
  animation: popGlow 3s ease-in-out infinite; 
}
/* Keyframes for the glow */
@keyframes popGlow {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0px rgba(0, 180, 255, 0.6);   /* soft blue start */
  }
  50% {
    transform: scale(1.1); /* noticeable pop */
    box-shadow: 0 0 35px rgba(255, 230, 0, 0.9);  /* bright yellow glow */
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0px rgba(0, 180, 255, 0.6);   /* back to soft blue */
  }
}
.btn--secondary{ background: var(--cta-2); color:#14120F; transform:translateX(-20%) }

.btn:hover{ transform: translateY(-1px); box-shadow: 0 12px 24px rgba(0,0,0,.9); }
.btn:active{ transform: translateY(0);   box-shadow: 0 8px 20px rgba(0,0,0,.10); }
.btn--secondary:hover{transform:translateX(-20%)}

/* mascots */
.mascots{ display:flex; justify-content:center; gap: clamp(10px, 5vw, 48px); }
.mascot{
  width: clamp(700px, 22vw, 220px); height:auto;
  filter: drop-shadow(0 12px 12px rgba(0,0,0,.12));
}

</style>

