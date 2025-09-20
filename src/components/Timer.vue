<script setup>
import { ref, watch, defineExpose } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAlarmClock } from '@fortawesome/free-solid-svg-icons'
import TimerMMSS from '@/components/TimerMMSS.vue'

const props = defineProps({
  running: { type: Boolean, default: false }, // 外部控制开始/暂停
  startFrom: { type: Number, default: 0 },    // 外部设定起始秒
  autoResetOnStop: { type: Boolean, default: false }, // 停止时自动归零
})

const timerRef = ref(null)


// 命令式：对外暴露 start / pause / reset 供父组件通过 ref 调用
const start = () => timerRef.value?.start()
const pause = () => timerRef.value?.pause()
const reset = (to = props.startFrom) => timerRef.value?.reset(to)
defineExpose({ start, pause, reset })
</script>



<template>
  <div class="icon-wrapper">
    <div class="circle">
      <div class="rectangle">
        <!-- Timer 不自动开始，由 running 控制 -->
        <TimerMMSS ref="timerRef" :autoStart="false" :startFrom="startFrom" />
      </div>
    </div>
    <FontAwesomeIcon :icon="faAlarmClock" class="alarm-icon" />
  </div>
</template>

<style scoped>
.icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

/* 图标铺满容器 */
.alarm-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  color: #1b324c;
}

/* 圆形相对容器百分比，中心定位 */
.circle {
  position: absolute;
  top: 56%;
  left: 50%;
  width: 66%;
  aspect-ratio: 1 / 1;
  background-color: #ffffff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  position: relative; /* 让内部 absolute 基于它定位 */
}

/* 长方形“显示屏” */
.rectangle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 85%;
  height: 40%;
  background-color: #ffffff;
  border-radius: 6px;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #1b324c;
  letter-spacing: 0.5px;
  font-size: 24px;  /* 这里调大小 */
  font-family: sans-serif, Arial, Helvetica;
}

</style>