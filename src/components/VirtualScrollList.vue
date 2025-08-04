<template>
  <div class="virtual-scroll-container" ref="container" @scroll="handleScroll">
    <div class="virtual-scroll-spacer" :style="{ height: totalHeight + 'px' }">
      <div 
        class="virtual-scroll-content" 
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="item in visibleItems"
          :key="item.index"
          class="virtual-scroll-item"
          :style="{ height: getItemHeight(item) + 'px' }"
        >
          <slot :item="item.data" :index="item.index"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemHeight: {
    type: [Number, Function],
    default: 50
  },
  buffer: {
    type: Number,
    default: 5
  },
  containerHeight: {
    type: Number,
    default: 400
  }
})

const container = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(props.containerHeight)
const itemHeights = ref(new Map())

// 计算总高度
const totalHeight = computed(() => {
  let height = 0
  for (let i = 0; i < props.items.length; i++) {
    height += getItemHeight({ index: i, data: props.items[i] })
  }
  return height
})

// 计算可见区域的起始和结束索引
const visibleRange = computed(() => {
  if (!props.items.length) return { start: 0, end: 0 }

  let start = 0
  let end = props.items.length - 1
  let accumulatedHeight = 0

  // 找到起始索引
  for (let i = 0; i < props.items.length; i++) {
    const itemHeight = getItemHeight({ index: i, data: props.items[i] })
    if (accumulatedHeight + itemHeight > scrollTop.value) {
      start = Math.max(0, i - props.buffer)
      break
    }
    accumulatedHeight += itemHeight
  }

  // 找到结束索引
  accumulatedHeight = 0
  for (let i = 0; i < props.items.length; i++) {
    const itemHeight = getItemHeight({ index: i, data: props.items[i] })
    accumulatedHeight += itemHeight
    if (accumulatedHeight > scrollTop.value + containerHeight.value) {
      end = Math.min(props.items.length - 1, i + props.buffer)
      break
    }
  }

  return { start, end }
})

// 计算偏移量
const offsetY = computed(() => {
  let offset = 0
  for (let i = 0; i < visibleRange.value.start; i++) {
    offset += getItemHeight({ index: i, data: props.items[i] })
  }
  return offset
})

// 可见项目
const visibleItems = computed(() => {
  const items = []
  for (let i = visibleRange.value.start; i <= visibleRange.value.end; i++) {
    if (i < props.items.length) {
      items.push({
        index: i,
        data: props.items[i]
      })
    }
  }
  return items
})

// 获取项目高度
const getItemHeight = (item) => {
  if (typeof props.itemHeight === 'function') {
    const cachedHeight = itemHeights.value.get(item.index)
    if (cachedHeight !== undefined) {
      return cachedHeight
    }
    const height = props.itemHeight(item.data)
    itemHeights.value.set(item.index, height)
    return height
  }
  return props.itemHeight
}

// 处理滚动
const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}

// 更新容器高度
const updateContainerHeight = () => {
  if (container.value) {
    containerHeight.value = container.value.clientHeight
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (container.value) {
    container.value.scrollTop = container.value.scrollHeight
  }
}

// 滚动到指定项目
const scrollToItem = (index) => {
  if (index < 0 || index >= props.items.length) return

  let offset = 0
  for (let i = 0; i < index; i++) {
    offset += getItemHeight({ index: i, data: props.items[i] })
  }

  if (container.value) {
    container.value.scrollTop = offset
  }
}

// 清除缓存
const clearCache = () => {
  itemHeights.value.clear()
}

// 监听窗口大小变化
let resizeObserver = null

onMounted(() => {
  updateContainerHeight()
  
  // 使用 ResizeObserver 监听容器大小变化
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      updateContainerHeight()
    })
    resizeObserver.observe(container.value)
  } else {
    // 降级方案
    window.addEventListener('resize', updateContainerHeight)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  } else {
    window.removeEventListener('resize', updateContainerHeight)
  }
})

// 监听items变化，清除缓存
watch(() => props.items.length, () => {
  clearCache()
  nextTick(() => {
    updateContainerHeight()
  })
})

// 暴露方法
defineExpose({
  scrollToBottom,
  scrollToItem,
  clearCache
})
</script>

<style scoped>
.virtual-scroll-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.virtual-scroll-spacer {
  position: relative;
  width: 100%;
}

.virtual-scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-scroll-item {
  width: 100%;
}

/* 滚动条样式 */
.virtual-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 136, 0.5);
}
</style>