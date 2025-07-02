<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
    <!-- 粒子背景 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 opacity-30">
        <!-- 简化的CSS动画粒子 -->
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
      </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="relative z-10">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
// 这里可以添加全局逻辑
</script>

<style scoped>
/* 简化的粒子动画 */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(45deg, #00d4ff, #00ff88);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.particle-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.particle-2 {
  top: 20%;
  right: 20%;
  animation-delay: 1s;
}

.particle-3 {
  bottom: 30%;
  left: 30%;
  animation-delay: 2s;
}

.particle-4 {
  bottom: 20%;
  right: 10%;
  animation-delay: 3s;
}

.particle-5 {
  top: 50%;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(90deg);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-40px) translateX(-10px) rotate(180deg);
    opacity: 1;
  }
  75% {
    transform: translateY(-20px) translateX(15px) rotate(270deg);
    opacity: 0.8;
  }
}
</style>
