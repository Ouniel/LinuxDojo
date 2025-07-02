<template>
  <div class="animated-background">
    <!-- 主背景 -->
    <div class="bg-gradient"></div>
    
    <!-- 粒子容器 -->
    <div class="particles-container" ref="particlesContainer">
      <div 
        v-for="i in particleCount" 
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>
    
    <!-- 网格线 -->
    <div class="grid-lines">
      <div class="grid-horizontal"></div>
      <div class="grid-vertical"></div>
    </div>
    
    <!-- 光晕效果 -->
    <div class="glow-effects">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="glow glow-3"></div>
    </div>
    
    <!-- 代码雨效果 -->
    <div class="code-rain" ref="codeRain">
      <div 
        v-for="i in codeDropCount" 
        :key="i"
        class="code-drop"
        :style="getCodeDropStyle(i)"
      >
        {{ getRandomCodeChar() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const particlesContainer = ref(null)
const codeRain = ref(null)
const particleCount = 50
const codeDropCount = 30

// 粒子样式生成
const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 1
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 20
  
  return {
    '--size': `${size}px`,
    '--duration': `${duration}s`,
    '--delay': `${delay}s`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${delay}s`
  }
}

// 代码雨样式生成
const getCodeDropStyle = (index) => {
  const duration = Math.random() * 3 + 2
  const delay = Math.random() * 5
  
  return {
    '--duration': `${duration}s`,
    '--delay': `${delay}s`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${delay}s`
  }
}

// 随机代码字符
const codeChars = ['0', '1', '$', '#', '@', '*', '+', '-', '=', '/', '\\', '|', '<', '>', '{', '}', '[', ']']
const getRandomCodeChar = () => {
  return codeChars[Math.floor(Math.random() * codeChars.length)]
}

let animationFrame = null

onMounted(() => {
  // 启动动画循环
  const animate = () => {
    // 这里可以添加更复杂的动画逻辑
    animationFrame = requestAnimationFrame(animate)
  }
  animate()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}

/* 渐变背景 */
.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #0a0a23 0%,
    #1a1a2e 25%,
    #16213e 50%,
    #1a1a2e 75%,
    #0a0a23 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 粒子容器 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: rgba(0, 212, 255, 0.6);
  border-radius: 50%;
  animation: particleFloat var(--duration) ease-in-out infinite;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
    opacity: 0.8;
  }
  50% {
    transform: translateY(0px) rotate(180deg);
    opacity: 0.6;
  }
  75% {
    transform: translateY(20px) rotate(270deg);
    opacity: 0.4;
  }
}

/* 网格线 */
.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
  pointer-events: none;
}

.grid-horizontal {
  width: 100%;
  height: 100%;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 50px,
    rgba(0, 212, 255, 0.3) 50px,
    rgba(0, 212, 255, 0.3) 51px
  );
}

.grid-vertical {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 50px,
    rgba(0, 212, 255, 0.3) 50px,
    rgba(0, 212, 255, 0.3) 51px
  );
}

/* 光晕效果 */
.glow-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: glowPulse 4s ease-in-out infinite;
}

.glow-1 {
  width: 200px;
  height: 200px;
  background: rgba(0, 212, 255, 0.3);
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.glow-2 {
  width: 150px;
  height: 150px;
  background: rgba(0, 255, 136, 0.2);
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.glow-3 {
  width: 100px;
  height: 100px;
  background: rgba(255, 107, 53, 0.2);
  bottom: 30%;
  left: 60%;
  animation-delay: 1s;
}

@keyframes glowPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
}

/* 代码雨效果 */
.code-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 14px;
  color: rgba(0, 255, 136, 0.6);
}

.code-drop {
  position: absolute;
  animation: codeFall var(--duration) linear infinite;
  opacity: 0;
}

@keyframes codeFall {
  0% {
    top: -20px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100vh;
    opacity: 0;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .particles-container {
    display: none; /* 移动端关闭粒子效果以提高性能 */
  }
  
  .code-rain {
    display: none; /* 移动端关闭代码雨效果 */
  }
}
</style> 