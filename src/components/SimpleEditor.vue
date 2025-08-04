<template>
  <div class="simple-editor" :class="{ 'editor-active': isActive }">
    <!-- 编辑器标题栏 -->
    <div class="editor-header">
      <div class="editor-title">
        <span class="editor-icon">📝</span>
        <span>{{ filename || 'Untitled' }}</span>
        <span v-if="isModified" class="modified-indicator">●</span>
      </div>
      <div class="editor-controls">
        <button @click="saveFile" class="editor-btn" :disabled="!isModified" title="保存 (Ctrl+S)">
          💾
        </button>
        <button @click="closeEditor" class="editor-btn" title="关闭">
          ✕
        </button>
      </div>
    </div>

    <!-- 编辑器内容区 -->
    <div class="editor-content">
      <div class="editor-line-numbers" v-if="showLineNumbers">
        <div 
          v-for="n in lineCount" 
          :key="n" 
          class="line-number"
          :class="{ 'active': n === currentLine }"
        >
          {{ n }}
        </div>
      </div>
      
      <textarea
        ref="editorTextarea"
        v-model="content"
        @input="handleInput"
        @keydown="handleKeydown"
        @scroll="handleScroll"
        @click="updateCursorPosition"
        @keyup="updateCursorPosition"
        class="editor-textarea"
        :placeholder="placeholder"
        spellcheck="false"
      ></textarea>
    </div>

    <!-- 状态栏 -->
    <div class="editor-status-bar">
      <div class="status-left">
        <span class="status-item">行 {{ currentLine }}</span>
        <span class="status-item">列 {{ currentColumn }}</span>
        <span class="status-item">{{ content.length }} 字符</span>
      </div>
      <div class="status-right">
        <span class="status-item">{{ encoding }}</span>
        <span class="status-item">{{ fileType }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  filename: {
    type: String,
    default: ''
  },
  initialContent: {
    type: String,
    default: ''
  },
  showLineNumbers: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: '开始编辑...'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'close', 'content-changed'])

// 响应式数据
const content = ref(props.initialContent)
const originalContent = ref(props.initialContent)
const editorTextarea = ref(null)
const isActive = ref(false)
const currentLine = ref(1)
const currentColumn = ref(1)

// 计算属性
const isModified = computed(() => content.value !== originalContent.value)

const lineCount = computed(() => {
  return content.value.split('\n').length
})

const encoding = computed(() => 'UTF-8')

const fileType = computed(() => {
  if (!props.filename) return 'Plain Text'
  const ext = props.filename.split('.').pop()?.toLowerCase()
  const types = {
    'txt': 'Text',
    'md': 'Markdown',
    'js': 'JavaScript',
    'json': 'JSON',
    'sh': 'Shell Script',
    'py': 'Python',
    'html': 'HTML',
    'css': 'CSS',
    'vue': 'Vue'
  }
  return types[ext] || 'Plain Text'
})

// 方法
const handleInput = (e) => {
  updateCursorPosition()
  emit('content-changed', content.value)
}

const handleKeydown = (e) => {
  // 处理快捷键
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 's':
        e.preventDefault()
        saveFile()
        break
      case 'z':
        if (e.shiftKey) {
          // Ctrl+Shift+Z - 重做
          e.preventDefault()
          // TODO: 实现重做功能
        } else {
          // Ctrl+Z - 撤销
          e.preventDefault()
          // TODO: 实现撤销功能
        }
        break
      case 'a':
        // Ctrl+A - 全选
        break
      case 'f':
        e.preventDefault()
        // TODO: 实现查找功能
        break
    }
  }

  // Tab键处理
  if (e.key === 'Tab') {
    e.preventDefault()
    insertTab()
  }

  // 自动缩进
  if (e.key === 'Enter') {
    setTimeout(() => {
      autoIndent()
    }, 0)
  }
}

const handleScroll = (e) => {
  // 同步行号滚动
  const lineNumbers = document.querySelector('.editor-line-numbers')
  if (lineNumbers) {
    lineNumbers.scrollTop = e.target.scrollTop
  }
}

const updateCursorPosition = () => {
  if (!editorTextarea.value) return

  const textarea = editorTextarea.value
  const cursorPos = textarea.selectionStart
  const textBeforeCursor = content.value.substring(0, cursorPos)
  const lines = textBeforeCursor.split('\n')
  
  currentLine.value = lines.length
  currentColumn.value = lines[lines.length - 1].length + 1
}

const insertTab = () => {
  if (!editorTextarea.value) return

  const textarea = editorTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const spaces = '  ' // 2个空格代替Tab

  content.value = content.value.substring(0, start) + spaces + content.value.substring(end)
  
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + spaces.length
    textarea.focus()
  })
}

const autoIndent = () => {
  if (!editorTextarea.value) return

  const textarea = editorTextarea.value
  const cursorPos = textarea.selectionStart
  const lines = content.value.substring(0, cursorPos).split('\n')
  const currentLineText = lines[lines.length - 2] || ''
  
  // 获取前一行的缩进
  const indent = currentLineText.match(/^\s*/)[0]
  
  // 如果前一行以 { 或 : 结尾，增加缩进
  let newIndent = indent
  if (currentLineText.trim().endsWith('{') || currentLineText.trim().endsWith(':')) {
    newIndent += '  '
  }

  if (newIndent) {
    const beforeCursor = content.value.substring(0, cursorPos)
    const afterCursor = content.value.substring(cursorPos)
    content.value = beforeCursor + newIndent + afterCursor
    
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPos + newIndent.length
      textarea.focus()
    })
  }
}

const saveFile = () => {
  if (!isModified.value) return

  originalContent.value = content.value
  emit('save', {
    filename: props.filename,
    content: content.value
  })
}

const closeEditor = () => {
  if (isModified.value) {
    const confirmed = confirm('文件已修改，确定要关闭吗？未保存的更改将丢失。')
    if (!confirmed) return
  }
  
  emit('close')
}

const focus = () => {
  if (editorTextarea.value) {
    editorTextarea.value.focus()
    isActive.value = true
  }
}

const blur = () => {
  isActive.value = false
}

const insertText = (text) => {
  if (!editorTextarea.value) return

  const textarea = editorTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  content.value = content.value.substring(0, start) + text + content.value.substring(end)
  
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + text.length
    textarea.focus()
  })
}

const selectAll = () => {
  if (editorTextarea.value) {
    editorTextarea.value.select()
  }
}

// 生命周期
onMounted(() => {
  if (editorTextarea.value) {
    editorTextarea.value.addEventListener('focus', focus)
    editorTextarea.value.addEventListener('blur', blur)
  }
  
  // 初始化光标位置
  updateCursorPosition()
})

onUnmounted(() => {
  if (editorTextarea.value) {
    editorTextarea.value.removeEventListener('focus', focus)
    editorTextarea.value.removeEventListener('blur', blur)
  }
})

// 监听内容变化
watch(() => props.initialContent, (newContent) => {
  content.value = newContent
  originalContent.value = newContent
})

// 暴露方法
defineExpose({
  focus,
  blur,
  insertText,
  selectAll,
  saveFile,
  closeEditor
})
</script>

<style scoped>
.simple-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  border: 1px solid #333;
  transition: border-color 0.3s ease;
}

.simple-editor.editor-active {
  border-color: #00ff88;
}

/* 编辑器标题栏 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #333;
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e0e0e0;
  font-size: 13px;
  font-weight: 500;
}

.editor-icon {
  font-size: 14px;
}

.modified-indicator {
  color: #ffd93d;
  font-size: 16px;
  line-height: 1;
}

.editor-controls {
  display: flex;
  gap: 4px;
}

.editor-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #888;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.editor-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: #e0e0e0;
}

.editor-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 编辑器内容区 */
.editor-content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.editor-line-numbers {
  width: 50px;
  background: #252526;
  border-right: 1px solid #333;
  padding: 8px 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #858585;
  text-align: right;
  user-select: none;
  overflow: hidden;
}

.line-number {
  height: 18px;
  padding-right: 8px;
}

.line-number.active {
  color: #e0e0e0;
  font-weight: 600;
}

.editor-textarea {
  flex: 1;
  background: #1e1e1e;
  border: none;
  outline: none;
  color: #e0e0e0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  padding: 8px 12px;
  resize: none;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;
}

.editor-textarea::placeholder {
  color: #666;
  font-style: italic;
}

/* 状态栏 */
.editor-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: #007acc;
  color: white;
  font-size: 11px;
}

.status-left,
.status-right {
  display: flex;
  gap: 12px;
}

.status-item {
  padding: 2px 0;
}

/* 滚动条样式 */
.editor-textarea::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.editor-textarea::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.editor-textarea::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.editor-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.editor-line-numbers::-webkit-scrollbar {
  width: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-header {
    padding: 6px 8px;
  }
  
  .editor-title {
    font-size: 12px;
  }
  
  .editor-textarea {
    font-size: 12px;
    padding: 6px 8px;
  }
  
  .editor-line-numbers {
    width: 40px;
    font-size: 11px;
  }
  
  .status-left,
  .status-right {
    gap: 8px;
  }
}
</style>