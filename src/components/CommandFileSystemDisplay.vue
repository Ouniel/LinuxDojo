<template>
  <div class="command-filesystem-display">
    <!-- 头部信息栏 -->
    <div class="header-info">
      <div class="current-path">
        <span class="path-icon">📁</span>
        <span class="path-text">{{ currentPath }}</span>
      </div>
      <div class="command-info" v-if="currentCommand">
        <span class="command-icon">⚡</span>
        <span class="command-text">{{ currentCommand }}</span>
      </div>
    </div>

    <!-- 文件系统内容区 -->
    <div class="filesystem-content">
      <!-- 相关文件列表 -->
      <div class="relevant-files" v-if="relevantFiles.length > 0">
        <div class="section-title">
          <span class="title-icon">🎯</span>
          <span>命令相关文件</span>
          <span class="file-count">({{ relevantFiles.length }})</span>
        </div>
        
        <div class="file-grid">
          <div 
            v-for="file in relevantFiles" 
            :key="file.name"
            class="file-item"
            :class="{ 'file-directory': file.type === 'directory' }"
            @click="handleFileClick(file)"
          >
            <div class="file-icon">
              {{ getFileIcon(file) }}
            </div>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-details">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-permissions">{{ file.permissions }}</span>
              </div>
            </div>
            <div class="file-actions" v-if="getFileActions(file).length > 0">
              <button 
                v-for="action in getFileActions(file)"
                :key="action.name"
                class="action-btn"
                :title="action.title"
                @click.stop="handleFileAction(action.name, file)"
              >
                {{ action.icon }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 当前目录内容 -->
      <div class="current-directory" v-if="currentDirectoryFiles.length > 0">
        <div class="section-title">
          <span class="title-icon">📂</span>
          <span>当前目录</span>
          <span class="file-count">({{ currentDirectoryFiles.length }})</span>
        </div>
        
        <div class="directory-list">
          <div 
            v-for="file in currentDirectoryFiles.slice(0, showAllFiles ? currentDirectoryFiles.length : 6)" 
            :key="file.name"
            class="directory-item"
            :class="{ 'item-directory': file.type === 'directory' }"
            @click="handleFileClick(file)"
          >
            <span class="item-icon">{{ getFileIcon(file) }}</span>
            <span class="item-name">{{ file.name }}</span>
            <span class="item-size">{{ formatFileSize(file.size) }}</span>
          </div>
          
          <button 
            v-if="currentDirectoryFiles.length > 6"
            class="show-more-btn"
            @click="showAllFiles = !showAllFiles"
          >
            {{ showAllFiles ? '收起' : `显示更多 (${currentDirectoryFiles.length - 6})` }}
          </button>
        </div>
      </div>

      <!-- 系统信息面板 -->
      <div class="system-info" v-if="showSystemInfo">
        <div class="section-title">
          <span class="title-icon">💻</span>
          <span>系统信息</span>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">主机名</span>
            <span class="info-value">{{ systemInfo.hostname }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">内核</span>
            <span class="info-value">{{ systemInfo.kernel }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">运行时间</span>
            <span class="info-value">{{ systemInfo.uptime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">内存使用</span>
            <span class="info-value">{{ systemInfo.memoryUsed }} / {{ systemInfo.memoryTotal }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span class="status-item">
          <span class="status-icon">💾</span>
          <span>磁盘: {{ systemInfo.diskUsage['/'].usage }}</span>
        </span>
        <span class="status-item">
          <span class="status-icon">⚡</span>
          <span>负载: {{ systemInfo.loadAverage[0] }}</span>
        </span>
      </div>
      <div class="status-right">
        <button 
          class="status-toggle"
          @click="showSystemInfo = !showSystemInfo"
          :class="{ active: showSystemInfo }"
        >
          {{ showSystemInfo ? '隐藏系统信息' : '显示系统信息' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFilesystemStore } from '@/stores/filesystem'

// Props
const props = defineProps({
  command: {
    type: String,
    default: ''
  },
  parameters: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['file-selected', 'file-action'])

// Store
const filesystemStore = useFilesystemStore()

// 响应式数据
const showAllFiles = ref(false)
const showSystemInfo = ref(false)

// 计算属性
const currentPath = computed(() => filesystemStore.currentPath)
const currentCommand = computed(() => props.command)
const systemInfo = computed(() => filesystemStore.systemInfo)

// 获取命令相关的文件
const relevantFiles = computed(() => {
  if (!props.command) return []
  return filesystemStore.getCommandRelevantFiles(props.command, props.parameters)
})

// 获取当前目录文件
const currentDirectoryFiles = computed(() => {
  return filesystemStore.getCurrentDirectoryContents
})

// 方法
const getFileIcon = (file) => {
  if (file.type === 'directory') {
    return '📁'
  }
  
  const ext = file.name.split('.').pop()?.toLowerCase()
  const iconMap = {
    'txt': '📄',
    'md': '📝',
    'json': '📋',
    'js': '📜',
    'html': '🌐',
    'css': '🎨',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'pdf': '📕',
    'zip': '📦',
    'tar': '📦',
    'gz': '📦',
    'sh': '⚙️',
    'py': '🐍',
    'log': '📊'
  }
  
  return iconMap[ext] || '📄'
}

const formatFileSize = (size) => {
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)}GB`
}

const getFileActions = (file) => {
  const actions = []
  
  if (file.type === 'file') {
    actions.push(
      { name: 'view', icon: '👁️', title: '查看文件' },
      { name: 'edit', icon: '✏️', title: '编辑文件' }
    )
  }
  
  if (file.type === 'directory') {
    actions.push(
      { name: 'enter', icon: '📂', title: '进入目录' }
    )
  }
  
  actions.push(
    { name: 'info', icon: 'ℹ️', title: '文件信息' }
  )
  
  return actions
}

const handleFileClick = (file) => {
  emit('file-selected', file)
  
  if (file.type === 'directory') {
    filesystemStore.changeDirectory(`${currentPath.value}/${file.name}`)
  }
}

const handleFileAction = (action, file) => {
  emit('file-action', { action, file })
  
  switch (action) {
    case 'view':
      // 触发文件查看
      break
    case 'edit':
      // 触发文件编辑
      break
    case 'enter':
      filesystemStore.changeDirectory(`${currentPath.value}/${file.name}`)
      break
    case 'info':
      // 显示文件详细信息
      break
  }
}

// 监听命令变化
watch([() => props.command, () => props.parameters], () => {
  showAllFiles.value = false
})
</script>

<style scoped>
.command-filesystem-display {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  overflow: hidden;
}

/* 头部信息栏 */
.header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.current-path {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.path-icon {
  font-size: 14px;
}

.path-text {
  background: rgba(0, 212, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.command-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(0, 255, 136, 0.9);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.command-icon {
  font-size: 14px;
}

.command-text {
  background: rgba(0, 255, 136, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

/* 文件系统内容区 */
.filesystem-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 区域标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.title-icon {
  font-size: 16px;
}

.file-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: normal;
}

/* 相关文件网格 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateY(-1px);
}

.file-item.file-directory {
  border-color: rgba(255, 193, 7, 0.3);
}

.file-item.file-directory:hover {
  border-color: rgba(255, 193, 7, 0.5);
}

.file-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-details {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.file-size {
  font-family: 'JetBrains Mono', monospace;
}

.file-permissions {
  font-family: 'JetBrains Mono', monospace;
}

.file-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  padding: 4px 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  transform: scale(1.1);
}

/* 当前目录列表 */
.directory-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.directory-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.directory-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 212, 255, 0.2);
}

.directory-item.item-directory {
  border-color: rgba(255, 193, 7, 0.2);
}

.item-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.item-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-size {
  color: rgba(255, 255, 255, 0.6);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  flex-shrink: 0;
}

.show-more-btn {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 6px;
  padding: 8px 16px;
  color: rgba(0, 212, 255, 0.9);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.show-more-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.4);
}

/* 系统信息面板 */
.system-info {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  font-size: 12px;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.info-value {
  color: rgba(255, 255, 255, 0.9);
  font-family: 'JetBrains Mono', monospace;
}

/* 底部状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11px;
}

.status-left {
  display: flex;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
}

.status-icon {
  font-size: 12px;
}

.status-right {
  display: flex;
  gap: 8px;
}

.status-toggle {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 4px 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s ease;
}

.status-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.status-toggle.active {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  color: rgba(0, 212, 255, 0.9);
}

/* 滚动条样式 */
.filesystem-content::-webkit-scrollbar {
  width: 6px;
}

.filesystem-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.filesystem-content::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.filesystem-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .header-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .status-bar {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-item,
.directory-item,
.info-item {
  animation: fadeIn 0.3s ease;
}

/* 性能优化 */
.file-item,
.directory-item,
.action-btn,
.status-toggle {
  will-change: transform, background, border-color;
}
</style>
