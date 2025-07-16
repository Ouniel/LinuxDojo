<template>
  <div class="h-full bg-gray-900 text-white overflow-hidden">
    <!-- find 命令可视化 -->
    <div v-if="props.command && props.command.startsWith('find')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🔍</span>
          <div>
            <h2 class="text-xl font-bold">文件查找器</h2>
            <p class="text-green-100 text-sm">智能文件搜索与定位</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-green-100">找到文件</div>
          <div class="text-2xl font-bold">{{ foundFiles.length }}</div>
        </div>
      </div>

      <!-- 搜索条件展示 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-green-400 text-sm font-semibold">搜索路径</div>
            <div class="text-white font-mono">{{ searchPath }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-blue-400 text-sm font-semibold">文件名模式</div>
            <div class="text-white font-mono">{{ namePattern }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-purple-400 text-sm font-semibold">文件类型</div>
            <div class="text-white">{{ fileTypeFilter }}</div>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="grid grid-cols-2 gap-4 h-full">
          <!-- 树形结构 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">🌳</span>
              目录结构
            </h3>
            <div class="font-mono text-sm">
              <div 
                v-for="(path, index) in directoryTree" 
                :key="index"
                class="py-1 hover:bg-gray-700/50 rounded px-2 transition-colors"
                :class="{ 'text-green-400': path.isMatch }"
              >
                <span class="text-gray-500">{{ path.indent }}</span>
                <span class="mr-2">{{ path.icon }}</span>
                <span>{{ path.name }}</span>
                <span v-if="path.size" class="text-gray-400 ml-2">({{ path.size }})</span>
              </div>
            </div>
          </div>

          <!-- 匹配文件列表 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">📋</span>
              匹配结果
            </h3>
            <div class="space-y-2">
              <div 
                v-for="file in foundFiles" 
                :key="file.path"
                class="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">{{ file.icon }}</span>
                    <div>
                      <div class="font-semibold text-white">{{ file.name }}</div>
                      <div class="text-sm text-gray-400 font-mono">{{ file.path }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-300">{{ file.size }}</div>
                    <div class="text-xs text-gray-500">{{ file.modified }}</div>
                  </div>
                </div>
                <div class="mt-2 flex space-x-2">
                  <span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{{ file.type }}</span>
                  <span class="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{{ file.permissions }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- tree 命令可视化 -->
    <div v-else-if="props.command && props.command.startsWith('tree')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🌳</span>
          <div>
            <h2 class="text-xl font-bold">目录树可视化</h2>
            <p class="text-purple-100 text-sm">层次结构目录展示</p>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-400">{{ treeStats.directories }}</div>
            <div class="text-sm text-gray-400">目录</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-400">{{ treeStats.files }}</div>
            <div class="text-sm text-gray-400">文件</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-400">{{ treeStats.totalSize }}</div>
            <div class="text-sm text-gray-400">总大小</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-400">{{ treeStats.maxDepth }}</div>
            <div class="text-sm text-gray-400">最大深度</div>
          </div>
        </div>
      </div>

      <!-- 目录树展示 -->
      <div class="flex-1 p-4 overflow-y-auto">
        <div class="bg-gray-800 rounded-lg p-4 h-full">
          <div class="font-mono text-sm space-y-1">
            <div 
              v-for="(node, index) in treeNodes" 
              :key="index"
              class="flex items-center hover:bg-gray-700/50 rounded px-2 py-1 transition-colors"
            >
              <span class="text-gray-500 mr-2">{{ node.connector }}</span>
              <span class="mr-2 text-lg">{{ node.icon }}</span>
              <span class="flex-1" :class="node.type === 'directory' ? 'text-cyan-400 font-semibold' : 'text-gray-300'">
                {{ node.name }}
              </span>
              <span v-if="node.size" class="text-gray-500 text-xs ml-2">{{ node.size }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ls 命令增强可视化 -->
    <div v-else-if="props.command && props.command.startsWith('ls')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">📁</span>
          <div>
            <h2 class="text-xl font-bold">目录内容浏览器</h2>
            <p class="text-blue-100 text-sm">增强型文件列表展示</p>
          </div>
        </div>
      </div>

      <!-- 参数效果指示器 -->
      <div v-if="hasParameters" class="p-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-b border-gray-700">
        <div class="flex items-center space-x-4 text-sm">
          <div v-if="props.command && props.command.includes('-l')" class="flex items-center space-x-2 animate-pulse">
            <span class="w-2 h-2 bg-green-400 rounded-full"></span>
            <span class="text-green-400">详细列表模式</span>
          </div>
          <div v-if="props.command && props.command.includes('-a')" class="flex items-center space-x-2 animate-pulse">
            <span class="w-2 h-2 bg-yellow-400 rounded-full"></span>
            <span class="text-yellow-400">显示隐藏文件</span>
          </div>
          <div v-if="props.command && props.command.includes('-h')" class="flex items-center space-x-2 animate-pulse">
            <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span class="text-blue-400">人类可读格式</span>
          </div>
          <div v-if="props.command && props.command.includes('-t')" class="flex items-center space-x-2 animate-pulse">
            <span class="w-2 h-2 bg-purple-400 rounded-full"></span>
            <span class="text-purple-400">按时间排序</span>
          </div>
        </div>
      </div>

      <!-- 视图切换和筛选 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex space-x-2">
            <button 
              v-for="view in viewModes" 
              :key="view.id"
              @click="switchView(view.id)"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform"
              :class="currentView === view.id 
                ? 'bg-blue-500 text-white scale-105 shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-102'"
            >
              {{ view.icon }} {{ view.name }}
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <select 
              v-model="sortBy" 
              @change="onSortChange"
              class="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
            >
              <option value="name">按名称</option>
              <option value="size">按大小</option>
              <option value="type">按类型</option>
              <option value="date">按日期</option>
            </select>
            <button 
              @click="toggleSortOrder" 
              class="bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 text-sm border border-gray-600"
            >
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 动态内容区域 -->
      <div class="flex-1 p-4 overflow-hidden">
        <Transition name="view-change" mode="out-in">
          <!-- 网格视图 -->
          <div v-if="currentView === 'grid'" key="grid" class="grid grid-cols-3 gap-4 h-full overflow-y-auto">
            <TransitionGroup 
              name="file-item" 
              tag="div" 
              class="contents"
              @before-enter="onBeforeEnter"
              @enter="onEnter"
            >
              <div 
                v-for="(file, index) in sortedFiles" 
                :key="file.name"
                :data-index="index"
                class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 transform hover:scale-102"
                :class="getFileAnimationClass(file)"
              >
                <div class="flex items-start space-x-4">
                  <div class="text-4xl transition-transform duration-300 hover:scale-110">{{ file.icon }}</div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-white text-lg">{{ file.name }}</h3>
                    <div class="mt-2 space-y-1 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-400">大小:</span>
                        <span class="text-white">{{ file.size }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">类型:</span>
                        <span :class="getTypeClass(file.type)" class="px-2 py-1 rounded text-xs">{{ file.type }}</span>
                      </div>
                      <div v-if="props.command && props.command.includes('-l')" class="flex justify-between">
                        <span class="text-gray-400">权限:</span>
                        <span class="font-mono text-gray-300">{{ file.permissions }}</span>
                      </div>
                      <div v-if="props.command && props.command.includes('-l')" class="flex justify-between">
                        <span class="text-gray-400">修改:</span>
                        <span class="text-gray-300">{{ file.modified }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <!-- 列表视图 -->
          <div v-else-if="currentView === 'list'" key="list" class="h-full overflow-y-auto">
            <div class="bg-gray-800 rounded-lg">
              <div class="grid grid-cols-4 gap-4 p-3 bg-gray-700/50 border-b border-gray-600 text-sm font-semibold text-gray-300">
                <div>名称</div>
                <div>大小</div>
                <div>类型</div>
                <div>修改时间</div>
              </div>
              <TransitionGroup name="table-row" tag="div">
                <div 
                  v-for="file in sortedFiles" 
                  :key="file.name"
                  class="grid grid-cols-4 gap-4 p-3 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">{{ file.icon }}</span>
                    <span class="text-white">{{ file.name }}</span>
                  </div>
                  <div class="text-gray-300">{{ file.size }}</div>
                  <div>
                    <span :class="getTypeClass(file.type)" class="px-2 py-1 rounded text-xs">{{ file.type }}</span>
                  </div>
                  <div class="text-gray-400 text-sm">{{ file.modified }}</div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- 详细视图 -->
          <div v-else key="detail" class="h-full overflow-y-auto">
            <TransitionGroup 
              name="detail-card" 
              tag="div" 
              class="space-y-4"
            >
              <div 
                v-for="(file, index) in sortedFiles" 
                :key="file.name"
                :data-index="index"
                class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 transform hover:scale-102"
                :class="getFileAnimationClass(file)"
              >
                <div class="flex items-start space-x-4">
                  <div class="text-4xl transition-transform duration-300 hover:scale-110">{{ file.icon }}</div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-white text-lg">{{ file.name }}</h3>
                    <div class="mt-2 space-y-1 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-400">大小:</span>
                        <span class="text-white">{{ file.size }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">类型:</span>
                        <span :class="getTypeClass(file.type)" class="px-2 py-1 rounded text-xs">{{ file.type }}</span>
                      </div>
                      <div v-if="props.command && props.command.includes('-l')" class="flex justify-between">
                        <span class="text-gray-400">权限:</span>
                        <span class="font-mono text-gray-300">{{ file.permissions }}</span>
                      </div>
                      <div v-if="props.command && props.command.includes('-l')" class="flex justify-between">
                        <span class="text-gray-400">修改:</span>
                        <span class="text-gray-300">{{ file.modified }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 默认文件系统可视化 -->
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">📁</div>
        <h2 class="text-2xl font-bold mb-2">文件系统可视化</h2>
        <p class="text-gray-400">支持 find、tree、ls 等文件操作命令</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  command: {
    type: String,
    default: ''
  }
})

// 视图模式
const viewModes = [
  { id: 'grid', name: '网格', icon: '⊞' },
  { id: 'list', name: '列表', icon: '☰' },
  { id: 'detail', name: '详细', icon: '📋' }
]

const currentView = ref('grid')
const sortBy = ref('name')
const sortOrder = ref('asc')

// 搜索条件
const searchPath = ref('/home/user')
const namePattern = ref('*.js')
const fileTypeFilter = ref('文件')

// 模拟数据
const foundFiles = ref([
  { 
    name: 'app.js', 
    path: '/home/user/project/app.js', 
    size: '2.3KB', 
    type: 'JavaScript',
    permissions: 'rw-r--r--',
    modified: '2024-01-10 08:15',
    icon: '📄'
  },
  { 
    name: 'config.js', 
    path: '/home/user/project/config/config.js', 
    size: '1.1KB', 
    type: 'JavaScript',
    permissions: 'rw-r--r--',
    modified: '2024-01-09 14:30',
    icon: '⚙️'
  },
  { 
    name: 'utils.js', 
    path: '/home/user/project/lib/utils.js', 
    size: '3.7KB', 
    type: 'JavaScript',
    permissions: 'rw-r--r--',
    modified: '2024-01-08 16:45',
    icon: '🔧'
  }
])

const directoryTree = ref([
  { name: 'project', indent: '', icon: '📁', isMatch: false },
  { name: 'app.js', indent: '├── ', icon: '📄', size: '2.3KB', isMatch: true },
  { name: 'package.json', indent: '├── ', icon: '📦', size: '876B', isMatch: false },
  { name: 'config', indent: '├── ', icon: '📁', isMatch: false },
  { name: 'config.js', indent: '│   └── ', icon: '⚙️', size: '1.1KB', isMatch: true },
  { name: 'lib', indent: '└── ', icon: '📁', isMatch: false },
  { name: 'utils.js', indent: '    └── ', icon: '🔧', size: '3.7KB', isMatch: true }
])

const treeStats = ref({
  directories: 8,
  files: 24,
  totalSize: '156MB',
  maxDepth: 4
})

const treeNodes = ref([
  { name: 'project', connector: '.', icon: '📁', type: 'directory' },
  { name: 'src', connector: '├── ', icon: '📁', type: 'directory' },
  { name: 'components', connector: '│   ├── ', icon: '📁', type: 'directory' },
  { name: 'Header.vue', connector: '│   │   ├── ', icon: '🎨', type: 'file', size: '2.1KB' },
  { name: 'Footer.vue', connector: '│   │   └── ', icon: '🎨', type: 'file', size: '1.8KB' },
  { name: 'pages', connector: '│   ├── ', icon: '📁', type: 'directory' },
  { name: 'Home.vue', connector: '│   │   ├── ', icon: '🏠', type: 'file', size: '4.2KB' },
  { name: 'About.vue', connector: '│   │   └── ', icon: 'ℹ️', type: 'file', size: '1.5KB' },
  { name: 'main.js', connector: '│   └── ', icon: '📄', type: 'file', size: '890B' },
  { name: 'public', connector: '├── ', icon: '📁', type: 'directory' },
  { name: 'index.html', connector: '│   └── ', icon: '🌐', type: 'file', size: '512B' },
  { name: 'package.json', connector: '└── ', icon: '📦', type: 'file', size: '1.2KB' }
])

const files = ref([
  { name: 'src', icon: '📁', size: '-', type: '目录', permissions: 'drwxr-xr-x', modified: '2024-01-10 08:15' },
  { name: 'public', icon: '📁', size: '-', type: '目录', permissions: 'drwxr-xr-x', modified: '2024-01-09 14:30' },
  { name: 'package.json', icon: '📦', size: '1.2KB', type: 'JSON', permissions: '-rw-r--r--', modified: '2024-01-08 16:45' },
  { name: 'README.md', icon: '📝', size: '2.8KB', type: 'Markdown', permissions: '-rw-r--r--', modified: '2024-01-07 10:20' },
  { name: 'vite.config.js', icon: '⚙️', size: '456B', type: 'JavaScript', permissions: '-rw-r--r--', modified: '2024-01-06 15:30' },
  { name: '.gitignore', icon: '🙈', size: '234B', type: '隐藏文件', permissions: '-rw-r--r--', modified: '2024-01-05 09:15' }
])

const sortedFiles = computed(() => {
  const sorted = [...files.value].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size':
        const sizeA = a.size === '-' ? 0 : parseFloat(a.size)
        const sizeB = b.size === '-' ? 0 : parseFloat(b.size)
        comparison = sizeA - sizeB
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'date':
        comparison = new Date(a.modified) - new Date(b.modified)
        break
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  
  return sorted
})

const getTypeClass = (type) => {
  const typeClasses = {
    '目录': 'bg-blue-500/20 text-blue-400',
    'JavaScript': 'bg-yellow-500/20 text-yellow-400',
    'JSON': 'bg-green-500/20 text-green-400',
    'Markdown': 'bg-purple-500/20 text-purple-400',
    '隐藏文件': 'bg-gray-500/20 text-gray-400'
  }
  return typeClasses[type] || 'bg-gray-500/20 text-gray-400'
}

const hasParameters = computed(() => {
  return props.command && (props.command.includes('-l') || props.command.includes('-a') || props.command.includes('-h') || props.command.includes('-t'))
})

const onBeforeEnter = (el) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

const onEnter = (el, done) => {
  el.style.opacity = 1
  el.style.transform = 'translateY(0)'
  done()
}

const getFileAnimationClass = (file) => {
  const typeClasses = {
    '目录': 'bg-blue-500/20 text-blue-400',
    'JavaScript': 'bg-yellow-500/20 text-yellow-400',
    'JSON': 'bg-green-500/20 text-green-400',
    'Markdown': 'bg-purple-500/20 text-purple-400',
    '隐藏文件': 'bg-gray-500/20 text-gray-400'
  }
  return typeClasses[file.type] || 'bg-gray-500/20 text-gray-400'
}

const switchView = (viewId) => {
  currentView.value = viewId
}

const onSortChange = () => {
  // 实现排序逻辑
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}
</script>

<style scoped>
/* 视图切换动画 */
.view-change-enter-active,
.view-change-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-change-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}

.view-change-leave-to {
  opacity: 0;
  transform: translateX(-50px) scale(0.95);
}

/* 文件项动画 */
.file-item-move,
.file-item-enter-active,
.file-item-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-item-enter-from,
.file-item-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.file-item-leave-active {
  position: absolute;
}

/* 表格行动画 */
.table-row-move,
.table-row-enter-active,
.table-row-leave-active {
  transition: all 0.4s ease;
}

.table-row-enter-from,
.table-row-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 详细卡片动画 */
.detail-card-move,
.detail-card-enter-active,
.detail-card-leave-active {
  transition: all 0.5s ease;
}

.detail-card-enter-from,
.detail-card-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* 参数指示器动画 */
@keyframes parameterGlow {
  0%, 100% {
    box-shadow: 0 0 5px currentColor;
  }
  50% {
    box-shadow: 0 0 15px currentColor;
  }
}

.animate-pulse {
  animation: parameterGlow 2s infinite;
}

/* 悬停效果增强 */
.hover\:scale-102:hover {
  transform: scale(1.02);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:scale-110:hover {
  transform: scale(1.1);
}

/* 响应式网格调整 */
@media (max-width: 1200px) {
  .grid-cols-6 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .grid-cols-6 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>