<template>
  <div class="file-info-display">
    <!-- 文件信息头部 -->
    <div class="file-info-header">
      <div class="header-left">
        <h3 class="section-title">
          <span class="icon">📁</span>
          文件信息
        </h3>
      </div>
      <div class="header-right">
        <button @click="refreshInfo" class="refresh-btn" title="刷新信息">
          <span class="icon">🔄</span>
        </button>
        <button @click="toggleView" class="view-toggle-btn" :title="viewMode === 'list' ? '切换到卡片视图' : '切换到列表视图'">
          <span class="icon">{{ viewMode === 'list' ? '⊞' : '☰' }}</span>
        </button>
      </div>
    </div>

    <!-- 文件信息内容 -->
    <div class="file-info-content" :class="{ 'card-view': viewMode === 'card' }">
      <div v-if="!fileInfo || fileInfo.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <p class="empty-text">暂无文件信息</p>
        <p class="empty-hint">执行文件相关命令后将显示详细信息</p>
      </div>

      <div v-else class="file-list">
        <div 
          v-for="(file, index) in displayedFiles" 
          :key="index"
          class="file-item"
          :class="{ 'selected': selectedFile === index }"
          @click="selectFile(index)"
        >
          <!-- 列表视图 -->
          <template v-if="viewMode === 'list'">
            <div class="file-icon">
              {{ getFileIcon(file.type, file.name) }}
            </div>
            <div class="file-details">
              <div class="file-name" :title="file.name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-date">{{ formatDate(file.modified) }}</span>
                <span class="file-permissions" v-if="file.permissions">{{ file.permissions }}</span>
              </div>
            </div>
            <div class="file-actions">
              <button @click.stop="viewFile(file)" class="action-btn" title="查看">👁️</button>
              <button @click.stop="editFile(file)" class="action-btn" title="编辑">✏️</button>
              <button @click.stop="downloadFile(file)" class="action-btn" title="下载">⬇️</button>
            </div>
          </template>

          <!-- 卡片视图 -->
          <template v-else>
            <div class="file-card">
              <div class="card-header">
                <div class="file-icon large">{{ getFileIcon(file.type, file.name) }}</div>
                <div class="file-actions">
                  <button @click.stop="viewFile(file)" class="action-btn small" title="查看">👁️</button>
                  <button @click.stop="editFile(file)" class="action-btn small" title="编辑">✏️</button>
                </div>
              </div>
              <div class="card-body">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  <div class="meta-item">
                    <span class="meta-label">大小:</span>
                    <span class="meta-value">{{ formatFileSize(file.size) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">修改:</span>
                    <span class="meta-value">{{ formatDate(file.modified) }}</span>
                  </div>
                  <div class="meta-item" v-if="file.permissions">
                    <span class="meta-label">权限:</span>
                    <span class="meta-value">{{ file.permissions }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 分页控制 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ‹ 上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          下一页 ›
        </button>
      </div>
    </div>

    <!-- 文件详情面板 -->
    <div v-if="selectedFileDetails" class="file-details-panel">
      <div class="details-header">
        <h4>{{ selectedFileDetails.name }}</h4>
        <button @click="closeDetails" class="close-btn">✕</button>
      </div>
      <div class="details-content">
        <div class="detail-item">
          <span class="detail-label">类型:</span>
          <span class="detail-value">{{ selectedFileDetails.type }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">大小:</span>
          <span class="detail-value">{{ formatFileSize(selectedFileDetails.size) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间:</span>
          <span class="detail-value">{{ formatDate(selectedFileDetails.created) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">修改时间:</span>
          <span class="detail-value">{{ formatDate(selectedFileDetails.modified) }}</span>
        </div>
        <div class="detail-item" v-if="selectedFileDetails.permissions">
          <span class="detail-label">权限:</span>
          <span class="detail-value">{{ selectedFileDetails.permissions }}</span>
        </div>
        <div class="detail-item" v-if="selectedFileDetails.owner">
          <span class="detail-label">所有者:</span>
          <span class="detail-value">{{ selectedFileDetails.owner }}</span>
        </div>
        <div class="detail-item" v-if="selectedFileDetails.group">
          <span class="detail-label">用户组:</span>
          <span class="detail-value">{{ selectedFileDetails.group }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  commandOutput: {
    type: String,
    default: ''
  },
  lastCommand: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['file-selected', 'file-action'])

// 响应式数据
const fileInfo = ref([])
const selectedFile = ref(-1)
const selectedFileDetails = ref(null)
const viewMode = ref('list') // 'list' 或 'card'
const currentPage = ref(1)
const itemsPerPage = ref(10)
const isLoading = ref(false)

// 计算属性
const displayedFiles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return fileInfo.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(fileInfo.value.length / itemsPerPage.value)
})

// 方法
const parseCommandOutput = (output, command) => {
  if (!output || !command) return []

  const cmd = command.split(' ')[0]
  
  switch (cmd) {
    case 'ls':
      return parseLsOutput(output, command)
    case 'find':
      return parseFindOutput(output)
    case 'stat':
      return parseStatOutput(output)
    case 'file':
      return parseFileOutput(output)
    default:
      return []
  }
}

const parseLsOutput = (output, command) => {
  const lines = output.split('\n').filter(line => line.trim())
  const isLongFormat = command.includes('-l')
  const files = []

  if (isLongFormat) {
    // 解析 ls -l 格式
    lines.forEach(line => {
      if (line.startsWith('total')) return
      
      const parts = line.split(/\s+/)
      if (parts.length >= 9) {
        const permissions = parts[0]
        const size = parts[4]
        const month = parts[5]
        const day = parts[6]
        const time = parts[7]
        const name = parts.slice(8).join(' ')
        
        files.push({
          name,
          type: permissions.startsWith('d') ? 'directory' : 'file',
          size: parseInt(size) || 0,
          permissions,
          modified: `${month} ${day} ${time}`,
          created: `${month} ${day} ${time}`,
          owner: parts[2],
          group: parts[3]
        })
      }
    })
  } else {
    // 解析简单 ls 格式
    const items = output.split(/\s+/).filter(item => item.trim())
    items.forEach(item => {
      files.push({
        name: item,
        type: item.includes('.') ? 'file' : 'directory',
        size: Math.floor(Math.random() * 10000), // 模拟大小
        modified: new Date().toISOString(),
        created: new Date().toISOString()
      })
    })
  }

  return files
}

const parseFindOutput = (output) => {
  const lines = output.split('\n').filter(line => line.trim())
  return lines.map(path => {
    const name = path.split('/').pop()
    return {
      name,
      path,
      type: name.includes('.') ? 'file' : 'directory',
      size: Math.floor(Math.random() * 10000),
      modified: new Date().toISOString(),
      created: new Date().toISOString()
    }
  })
}

const parseStatOutput = (output) => {
  // 解析 stat 命令输出
  const lines = output.split('\n')
  const fileData = {}
  
  lines.forEach(line => {
    if (line.includes('File:')) {
      fileData.name = line.split('File:')[1].trim().replace(/['"]/g, '')
    } else if (line.includes('Size:')) {
      const sizeMatch = line.match(/Size:\s*(\d+)/)
      fileData.size = sizeMatch ? parseInt(sizeMatch[1]) : 0
    } else if (line.includes('Access:') && line.includes('(')) {
      fileData.permissions = line.match(/\(([^)]+)\)/)?.[1]
    }
  })
  
  return fileData.name ? [fileData] : []
}

const parseFileOutput = (output) => {
  const lines = output.split('\n').filter(line => line.trim())
  return lines.map(line => {
    const parts = line.split(':')
    const name = parts[0].trim()
    const type = parts[1]?.trim() || 'unknown'
    
    return {
      name,
      type: type.toLowerCase().includes('directory') ? 'directory' : 'file',
      fileType: type,
      size: Math.floor(Math.random() * 10000),
      modified: new Date().toISOString(),
      created: new Date().toISOString()
    }
  })
}

const getFileIcon = (type, name) => {
  if (type === 'directory') return '📁'
  
  const ext = name.split('.').pop()?.toLowerCase()
  const iconMap = {
    'txt': '📄',
    'md': '📝',
    'js': '📜',
    'json': '📋',
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
    'exe': '⚙️',
    'sh': '⚡',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚡',
    'c': '⚡'
  }
  
  return iconMap[ext] || '📄'
}

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const selectFile = (index) => {
  selectedFile.value = index
  const file = displayedFiles.value[index]
  selectedFileDetails.value = file
  emit('file-selected', file)
}

const closeDetails = () => {
  selectedFileDetails.value = null
  selectedFile.value = -1
}

const viewFile = (file) => {
  emit('file-action', { action: 'view', file })
}

const editFile = (file) => {
  emit('file-action', { action: 'edit', file })
}

const downloadFile = (file) => {
  emit('file-action', { action: 'download', file })
}

const refreshInfo = () => {
  isLoading.value = true
  // 模拟刷新延迟
  setTimeout(() => {
    if (props.commandOutput && props.lastCommand) {
      fileInfo.value = parseCommandOutput(props.commandOutput, props.lastCommand)
    }
    isLoading.value = false
  }, 500)
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'list' ? 'card' : 'list'
  // 调整每页显示数量
  itemsPerPage.value = viewMode.value === 'card' ? 6 : 10
  currentPage.value = 1
}

// 监听器
watch([() => props.commandOutput, () => props.lastCommand], ([newOutput, newCommand]) => {
  if (newOutput && newCommand) {
    fileInfo.value = parseCommandOutput(newOutput, newCommand)
    currentPage.value = 1
    selectedFile.value = -1
    selectedFileDetails.value = null
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  // 初始化一些示例数据
  if (!props.commandOutput) {
    fileInfo.value = [
      {
        name: 'email.txt',
        type: 'file',
        size: 2356,
        permissions: '-rw-r--r--',
        modified: '2024-01-10 08:15:00',
        created: '2024-01-09 14:30:00',
        owner: 'contact',
        group: 'contact'
      },
      {
        name: 'flag.txt',
        type: 'file',
        size: 156,
        permissions: '-rw-r--r--',
        modified: '2024-01-09 14:30:00',
        created: '2024-01-09 14:30:00',
        owner: 'contact',
        group: 'contact'
      },
      {
        name: 'Documents',
        type: 'directory',
        size: 4096,
        permissions: 'drwxr-xr-x',
        modified: '2024-01-07 12:00:00',
        created: '2024-01-07 12:00:00',
        owner: 'contact',
        group: 'contact'
      }
    ]
  }
})
</script>

<style scoped>
.file-info-display {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

/* 头部样式 */
.file-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
}

.header-left .section-title {
  margin: 0;
  color: #00ff88;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.refresh-btn,
.view-toggle-btn {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.refresh-btn:hover,
.view-toggle-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-1px);
}

/* 内容区域 */
.file-info-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.file-info-content.card-view {
  padding: 12px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 8px;
  color: #888;
}

.empty-hint {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

/* 文件列表 */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-list.card-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

/* 列表视图文件项 */
.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: rgba(0, 255, 136, 0.05);
  border-color: rgba(0, 255, 136, 0.2);
  transform: translateY(-1px);
}

.file-item.selected {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.4);
}

.file-icon {
  font-size: 20px;
  margin-right: 12px;
  min-width: 24px;
  text-align: center;
}

.file-icon.large {
  font-size: 32px;
  margin-right: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  color: #e0e0e0;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #888;
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
  color: #ccc;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.action-btn.small {
  padding: 2px 4px;
  font-size: 10px;
}

/* 卡片视图 */
.file-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
}

.file-card:hover {
  background: rgba(0, 255, 136, 0.05);
  border-color: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-body .file-name {
  font-size: 14px;
  margin-bottom: 8px;
}

.card-body .file-meta {
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-label {
  color: #888;
  font-size: 10px;
}

.meta-value {
  color: #ccc;
  font-size: 10px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.page-btn {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.2);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #888;
  font-size: 12px;
}

/* 详情面板 */
.file-details-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: rgba(20, 20, 20, 0.95);
  border-left: 1px solid rgba(0, 255, 136, 0.3);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.details-header h4 {
  margin: 0;
  color: #00ff88;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.close-btn:hover {
  color: #ff6b6b;
}

.details-content {
  padding: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-label {
  color: #888;
  font-size: 12px;
}

.detail-value {
  color: #e0e0e0;
  font-size: 12px;
  text-align: right;
}

/* 滚动条 */
.file-info-content::-webkit-scrollbar {
  width: 6px;
}

.file-info-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.file-info-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.3);
  border-radius: 3px;
}

/* 响应式 */
@media (max-width: 768px) {
  .file-info-header {
    padding: 8px 12px;
  }
  
  .file-info-content {
    padding: 12px;
  }
  
  .file-list.card-view {
    grid-template-columns: 1fr;
  }
  
  .file-details-panel {
    width: 100%;
  }
}
</style>