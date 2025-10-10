<template>
  <section class="wave-mythsfaqs" :class="{ 'is-faq': activeTab === 'faqs' }">
    <header class="wave-mythsfaqs__header">
      <h1 class="wave-mythsfaqs__title">FAQs / Myth Busters</h1>
    </header>

    <div class="segmented" role="tablist" aria-label="Content type">
      <button
        class="segmented__btn"
        :class="{ 'is-active': activeTab === 'myths' }"
        role="tab"
        :aria-selected="activeTab === 'myths'"
        @keydown.enter.prevent="activeTab='myths'"
        @keydown.space.prevent="activeTab='myths'"
        @click="activeTab = 'myths'"
      >MYTHS</button>
      <button
        class="segmented__btn"
        :class="{ 'is-active': activeTab === 'faqs' }"
        role="tab"
        :aria-selected="activeTab === 'faqs'"
        @keydown.enter.prevent="activeTab='faqs'"
        @keydown.space.prevent="activeTab='faqs'"
        @click="activeTab = 'faqs'"
      >FAQs</button>
      <span class="segmented__slider" :style="sliderStyle" aria-hidden="true"></span>
    </div>

    <div class="item-list" :key="activeTab">
      <div
        v-for="(it, i) in displayItems"
        :key="i"
        :class="['item-row', i % 2 === 0 ? 'right' : 'left']"
      >
        <article class="item-card">

          <h3 class="item-card__title">{{ it.title }}</h3>
          <p class="item-card__desc">{{ it.description }}</p>
        </article>

        <img
          class="item-mascot"
          :src="it.img"
          :alt="it.imgAlt"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import siloMyth from '@/assets/silo_myth.png'
import elleMyth from '@/assets/elle_myth.png'
import hibbyMyth from '@/assets/hibby_myth.png'
import siloFaq from '@/assets/silo_faq.png'
import elleFaq from '@/assets/elle_faq.png'
import hibbyFaq from '@/assets/hibby_faq.png'

const MYTHS = [
  { title: 'Reading and writing letters backwards is the main sign of dyslexia.', description: 'Letter reversals are common in young children and not always a sign of dyslexia. If they continue past first grade, it may signal the need for evaluation.' },
  { title: 'Dyslexia goes away once kids learn to read.', description: 'Dyslexia is lifelong. Even after learning to read, kids may still struggle with fluency, comprehension, spelling, and writing.' },
  { title: 'Dyslexia can be cured.', description: 'There’s no “cure” for dyslexia—it’s a lifelong difference. But interventions and strategies help people thrive.' },
  { title: 'All dyslexic people have the same struggles.', description: 'Dyslexia looks different for each person—some may struggle more with spelling, others with fluency or memory.' },
  { title: 'If you read well, you can’t have dyslexia.', description: 'Some individuals develop strong coping strategies and still have dyslexia—they may read fluently but struggle with spelling or working memory.' },
  { title: 'Dyslexia is caused by poor teaching.', description: 'While quality teaching matters, dyslexia is not caused by instruction—it’s a difference in how the brain processes language.' },
  { title: 'Dyslexia is caused by laziness or lack of effort.', description: 'Dyslexia is a neurobiological difference, not a motivation issue.' },
  { title: 'Assistive technology is “cheating” for students with dyslexia.', description: 'Tools like audiobooks, text-to-speech, and speech-to-text are accommodations that help level the playing field, not shortcuts.' },
  { title: 'Dyslexia is the same as a lack of focus or ADHD.', description: 'Dyslexia and ADHD are different conditions, though they can co-occur. Dyslexia is about language processing, not attention.' },
  { title: 'People with dyslexia can’t succeed academically or professionally.', description: 'Many highly successful scientists, entrepreneurs, artists, and leaders have dyslexia.' }
]

const FAQS = [
  { title: 'What is dyslexia?', description: 'Dyslexia is a learning difference that affects how the brain processes language, especially reading, writing, and spelling.' },
  { title: 'Is dyslexia related to intelligence?', description: 'No, dyslexia is not a measure of intelligence. People with dyslexia can be just as smart and capable as anyone else.' },
  { title: 'What causes dyslexia?', description: 'Dyslexia is believed to be genetic and neurological. It runs in families and is linked to how the brain processes written and spoken language.' },
  { title: 'Is dyslexia more common in boys than girls?', description: 'It affects boys and girls equally, though boys are often diagnosed more because their difficulties may be more noticeable.' },
  { title: 'Does dyslexia affect spoken language?', description: 'Sometimes. Some people with dyslexia may struggle with rhyming, word retrieval, or processing spoken instructions.' },
  { title: 'Who can diagnose dyslexia?', description: 'Licensed psychologists, neuropsychologists, or educational specialists typically do formal evaluations.' },
  { title: 'How does dyslexia affect self-esteem?', description: 'Without support, kids may feel “less smart.” Encouragement and celebrating strengths are essential.' },
  { title: 'What role does speech therapy play?', description: 'Speech-language pathologists can help with phonological awareness, which supports reading development.' },
  { title: 'What classroom accommodations are helpful?', description: 'Examples include extra time on tests, audiobooks, note-taking support, or reduced copying tasks.' },
  { title: 'Can people with dyslexia be successful in school and careers?', description: 'Absolutely. With the right support, people with dyslexia can thrive academically and professionally.' }
]

const mythArtSeq = [siloMyth, elleMyth, hibbyMyth]
const faqArtSeq  = [elleFaq, hibbyFaq, siloFaq]

const activeTab = ref('myths')
const displayItems = computed(() => {
  const src = activeTab.value === 'myths' ? MYTHS : FAQS
  const art = activeTab.value === 'myths' ? mythArtSeq : faqArtSeq
  const alt = activeTab.value === 'myths' ? 'Myth mascot' : 'FAQ mascot'
  return src.map((it, i) => ({ ...it, img: art[i % art.length], imgAlt: alt }))
})
const sliderStyle = computed(() => ({
  transform: activeTab.value === 'myths' ? 'translateX(0%)' : 'translateX(100%)'
}))
</script>

<style scoped>
@font-face{
  font-family: 'OpenDyslexic';
  font-style: normal;
  font-weight: 400;
  src: url('https://cdn.jsdelivr.net/gh/antijingoist/open-dyslexic/otf/OpenDyslexic3-Regular.otf') format('opentype');
  font-display: swap;
}
@font-face{
  font-family: 'OpenDyslexic';
  font-style: bold;
  font-weight: 700;
  src: url('https://cdn.jsdelivr.net/gh/antijingoist/open-dyslexic/otf/OpenDyslexic3-Bold.otf') format('opentype');
  font-display: swap;
}

:root{
  --wave-navy:#0d2b45;
  --wave-orange:#f58220;
  --cream:#fff7ef;
  --card:#ffe4c4;
  --border-yellow:#f2d24b;
  --border-yellow-soft:#f7e48c;
  --shadow:0 10px 24px rgba(13,43,69,.8);
  --radius:40px;
}

.wave-mythsfaqs{
  font-family: 'OpenDyslexic', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background: linear-gradient(180deg, var(--cream), #fff);
  color: var(--wave-navy);
  padding: 28px clamp(16px, 3vw, 40px) 56px;
  min-height: 100dvh;
  overflow-y: visible;
  width: 100%;
  position: relative;
  z-index: 1;
  --card:#f5eefb;
  --radius:40px;
}

.wave-mythsfaqs__header{ text-align:center; margin-bottom: 18px; position: relative; z-index: 2 }
.wave-mythsfaqs__title{ font-size: clamp(34px, 5vw, 56px); margin: 0 0 10px; letter-spacing:.5px; }
.wave-mythsfaqs__chip{
  display:inline-block; background: var(--wave-orange); color:#fff;
  font-weight:700; padding:.55rem 1.4rem; border-radius:999px; box-shadow: var(--shadow);
  font-size: clamp(14px, 1.6vw, 18px);
}

.segmented{
  position: relative;
  width: min(360px, 92%);
  margin: 18px auto 28px;
  background: #fff;
  border: 2px solid var(--border-yellow);
  border-radius: 999px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.segmented__btn{
  appearance: none; background: transparent; border: 0; padding: .7rem 0;
  font-weight: 700; color: var(--wave-navy); cursor: pointer; position: relative; z-index: 1;
}
.segmented__btn.is-active{ color:#000; }
.segmented__slider{
  position: absolute; top: 0; left: 0; width: 50%; height: 100%;
  background: #f7d5b8; border-left: 2px solid var(--border-yellow); border-right: 2px solid var(--border-yellow);
  transform: translateX(0%); transition: transform .25s ease;
}

.item-list{
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(20px, 3vw, 36px);
  place-items: center;
}

.item-row{
  position: relative;
  width: min(1200px, 92vw);
  margin-top: clamp(64px, 6vw, 110px);
}
.item-row:first-child{
  margin-top: 0;
}

.item-card{
  position: relative;
  background: var(--card);
  border-radius: var(--radius);
  padding: clamp(18px, 2.6vw, 28px);
  box-shadow: 0 12px 28px rgba(13,43,69,.10);
  overflow: visible;
  min-height: 180px;
  content-visibility: auto;
  contain-intrinsic-size: 260px;
  isolation: isolate;
  z-index: 0;
}

.item-card::before{
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  box-shadow: inset 0 0 0 4px var(--border-yellow);
  pointer-events: none;
  z-index: 2;
}
.item-card::after{
  content:"";
  position:absolute; inset:12px;
  border-radius: calc(var(--radius) - 12px);
  box-shadow: inset 0 0 0 10px var(--border-yellow-soft);
  pointer-events:none;
  z-index: -1;
}

@media (min-width: 1100px){
  .item-row.right .item-card{ padding-right: clamp(300px, 32vw, 480px); }
  .item-row.left  .item-card{  padding-left:  clamp(300px, 32vw, 480px); }
}

.item-card__title{
  font-weight: 800; font-size: clamp(22px, 2.8vw, 40px);
  line-height: 1.25; letter-spacing: .02em; margin: 6px 0 10px;
}
.item-card__desc{
  margin: 0; font-size: clamp(15px, 2vw, 20px);
  line-height: 1.6; color: #1f3340;
}

.item-mascot{
  position: absolute;
  z-index: 3;
  top: -90px;
  width: clamp(200px, 32vw, 480px);
  height: auto;
  filter: drop-shadow(0 14px 26px rgba(0,0,0,.22));
  pointer-events: none;
  user-select: none;
}
.item-row.right .item-mascot{ right: -80px; left: auto; }
.item-row.left  .item-mascot{  left: -80px;  right: auto;transform: scaleX(-1); }

.wave-mythsfaqs.is-faq .item-mascot{ width: clamp(160px, 24vw, 360px); top: -70px; }
.wave-mythsfaqs.is-faq .item-row{ margin-top: clamp(44px, 4.5vw, 84px); }
.wave-mythsfaqs.is-faq .item-row.right .item-card{ padding-right: clamp(220px, 26vw, 360px); }
.wave-mythsfaqs.is-faq .item-row.left  .item-card{ padding-left:  clamp(220px, 26vw, 360px); }

@media (max-width: 1099px){
  .item-row{ width: 94vw; margin-top: 28px; }
  .item-row.right .item-card,
  .item-row.left  .item-card{ padding-right: 20px; padding-left: 20px; }

  .item-mascot{
    position: relative;
    top: -24px;
    right: auto; left: auto;
    display: block;
    margin: 8px 0 0 auto;
    width: clamp(180px, 50vw, 340px);
    transform: none;
  }
}

@media (hover:hover){
  .item-card{ transition: box-shadow .18s ease, transform .18s ease; }
  .item-card:hover{ transform: translateY(-10px); box-shadow: 0 25px 50px rgba(13,43,69,.12); }
}
@media (prefers-reduced-motion: reduce){ .item-card{ transition: none; } }

:global(html, body){ height: auto !important; min-height: 100% !important; overflow-y: auto !important; }
:global(#app){ height: auto !important; min-height: 100% !important; overflow: visible !important; }
</style>
