<template>
  <div ref="backgroundContainer" class="fixed inset-0 z-0 pointer-events-none"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const backgroundContainer = ref(null)
let scene, camera, renderer, particles

onMounted(() => {
  initThreeJS()
  animate()
})

onUnmounted(() => {
  if (renderer) {
    renderer.dispose()
  }
})

const initThreeJS = () => {
  // 创建场景
  scene = new THREE.Scene()
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 5

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 0) // 透明背景
  
  backgroundContainer.value.appendChild(renderer.domElement)

  // 创建粒子系统
  createParticles()

  // 监听窗口大小变化
  window.addEventListener('resize', onWindowResize)
}

const createParticles = () => {
  const particleCount = 200
  const geometry = new THREE.BufferGeometry()
  
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    
    // 位置
    positions[i3] = (Math.random() - 0.5) * 20
    positions[i3 + 1] = (Math.random() - 0.5) * 20
    positions[i3 + 2] = (Math.random() - 0.5) * 20
    
    // 速度
    velocities[i3] = (Math.random() - 0.5) * 0.02
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
    
    // 颜色 (青色到绿色渐变)
    const hue = Math.random() * 0.3 + 0.5 // 0.5-0.8 对应青色到绿色
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  // 创建着色器材质
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pointSize: { value: 2.0 }
    },
    vertexShader: `
      uniform float time;
      uniform float pointSize;
      attribute vec3 velocity;
      varying vec3 vColor;
      
      void main() {
        vColor = color;
        
        vec3 pos = position;
        pos += velocity * time;
        
        // 边界检测和循环
        if (pos.x > 10.0) pos.x = -10.0;
        if (pos.x < -10.0) pos.x = 10.0;
        if (pos.y > 10.0) pos.y = -10.0;
        if (pos.y < -10.0) pos.y = 10.0;
        if (pos.z > 10.0) pos.z = -10.0;
        if (pos.z < -10.0) pos.z = 10.0;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = pointSize * (300.0 / -mvPosition.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        float distance = length(gl_PointCoord - vec2(0.5));
        if (distance > 0.5) discard;
        
        float alpha = 1.0 - distance * 2.0;
        gl_FragColor = vec4(vColor, alpha * 0.8);
      }
    `,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending
  })
  
  particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

const animate = () => {
  requestAnimationFrame(animate)
  
  if (particles && particles.material.uniforms) {
    particles.material.uniforms.time.value += 0.016 // 60fps
  }
  
  // 轻微旋转整个粒子系统
  if (particles) {
    particles.rotation.y += 0.001
    particles.rotation.x += 0.0005
  }
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

const onWindowResize = () => {
  if (!camera || !renderer) return
  
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
</script>

<style scoped>
/* 确保背景层在最底部 */
div {
  z-index: -1;
}
</style> 