<template>
  <div class="mac-terminal">
    <!-- Mac风格标题栏 -->
    <div class="terminal-header">
      <div class="traffic-lights">
        <div class="light red" @click="$emit('close')"></div>
        <div class="light yellow" @click="$emit('minimize')"></div>
        <div class="light green" @click="$emit('maximize')"></div>
      </div>
      <div class="terminal-title">{{ title }}</div>
      <div class="terminal-controls">
        <button @click="clearTerminal" class="control-btn" title="清空终端">
          <span>🗑️</span>
        </button>
        <button @click="toggleTheme" class="control-btn" title="切换主题">
          <span>🎨</span>
        </button>
      </div>
    </div>

    <!-- 终端内容区 -->
    <div class="terminal-content" ref="terminalContent" @click="focusInput">
      <!-- 历史命令和输出 -->
      <div v-for="(entry, index) in terminalHistory" :key="index" class="terminal-entry">
        <!-- 命令行 -->
        <div class="command-line">
          <span class="prompt">{{ prompt }}</span>
          <span class="command-text">{{ entry.command }}</span>
        </div>
        <!-- 输出 -->
        <div v-if="entry.output" class="command-output">
          <pre v-html="formatOutput(entry.output)"></pre>
        </div>
      </div>

      <!-- 当前命令行 -->
      <div class="current-command-line">
        <span class="prompt">{{ prompt }}</span>
        <input 
          ref="terminalInput"
          v-model="currentInput"
          @keydown="handleKeydown"
          @input="handleInput"
          class="terminal-input"
          spellcheck="false"
          autocomplete="off"
          :placeholder="inputPlaceholder"
        />
        <span class="cursor" :class="{ 'blink': !isTyping }">▊</span>
      </div>

      <!-- 自动补全提示 -->
      <div v-if="suggestions.length > 0" class="suggestions">
        <div 
          v-for="(suggestion, index) in suggestions" 
          :key="index"
          class="suggestion-item"
          :class="{ 'active': index === selectedSuggestion }"
          @click="applySuggestion(suggestion)"
        >
          <span class="suggestion-command">{{ suggestion.command }}</span>
          <span class="suggestion-desc">{{ suggestion.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useFilesystemStore } from '@/stores/filesystem'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'favork@linux:~'
  },
  initialPath: {
    type: String,
    default: '~'
  },
  theme: {
    type: String,
    default: 'dark'
  }
})

// Emits
const emit = defineEmits(['close', 'minimize', 'maximize', 'command-executed'])

// 响应式数据
const currentInput = ref('')
const terminalHistory = ref([])
const commandHistory = ref([])
const historyIndex = ref(-1)
const currentPath = ref(props.initialPath)
const terminalInput = ref(null)
const terminalContent = ref(null)
const isTyping = ref(false)
const suggestions = ref([])
const selectedSuggestion = ref(-1)
const currentTheme = ref(props.theme)

// 获取filesystem store
const filesystemStore = useFilesystemStore()

// 计算属性
const prompt = computed(() => `favork@linux:${currentPath.value}$ `)
const inputPlaceholder = computed(() => '输入命令... (Tab键自动补全)')

// 支持的命令及其描述
const commandDatabase = {
  // 文件操作
  'ls': { description: '列出目录内容', category: 'file' },
  'cat': { description: '显示文件内容', category: 'file' },
  'pwd': { description: '显示当前目录', category: 'file' },
  'cd': { description: '切换目录', category: 'file' },
  'mkdir': { description: '创建目录', category: 'file' },
  'rmdir': { description: '删除空目录', category: 'file' },
  'rm': { description: '删除文件或目录', category: 'file' },
  'cp': { description: '复制文件或目录', category: 'file' },
  'mv': { description: '移动/重命名文件', category: 'file' },
  'find': { description: '查找文件和目录', category: 'file' },
  'locate': { description: '快速定位文件', category: 'file' },
  'which': { description: '查找命令位置', category: 'file' },
  'tree': { description: '显示目录树结构', category: 'file' },
  
  // 文本处理
  'grep': { description: '搜索文本模式', category: 'text' },
  'sed': { description: '流编辑器', category: 'text' },
  'awk': { description: '文本处理工具', category: 'text' },
  'head': { description: '显示文件开头', category: 'text' },
  'tail': { description: '显示文件结尾', category: 'text' },
  'less': { description: '分页查看文件', category: 'text' },
  'more': { description: '分页显示文件', category: 'text' },
  'sort': { description: '排序文本行', category: 'text' },
  'uniq': { description: '去除重复行', category: 'text' },
  'wc': { description: '统计字符/行数', category: 'text' },
  'cut': { description: '提取文本列', category: 'text' },
  'tr': { description: '字符转换', category: 'text' },
  
  // 系统信息
  'ps': { description: '显示进程信息', category: 'system' },
  'top': { description: '实时进程监控', category: 'system' },
  'htop': { description: '交互式进程查看器', category: 'system' },
  'df': { description: '显示磁盘使用情况', category: 'system' },
  'du': { description: '显示目录大小', category: 'system' },
  'free': { description: '显示内存使用情况', category: 'system' },
  'uname': { description: '显示系统信息', category: 'system' },
  'whoami': { description: '显示当前用户', category: 'system' },
  'id': { description: '显示用户和组ID', category: 'system' },
  'date': { description: '显示或设置日期', category: 'system' },
  'uptime': { description: '显示系统运行时间', category: 'system' },
  
  // 网络工具
  'ping': { description: '测试网络连通性', category: 'network' },
  'curl': { description: 'URL数据传输工具', category: 'network' },
  'wget': { description: '下载文件', category: 'network' },
  'ssh': { description: '安全远程登录', category: 'network' },
  'scp': { description: '安全文件传输', category: 'network' },
  'netstat': { description: '显示网络连接', category: 'network' },
  'ss': { description: '显示套接字统计', category: 'network' },
  
  // 权限管理
  'chmod': { description: '修改文件权限', category: 'permission' },
  'chown': { description: '修改文件所有者', category: 'permission' },
  'chgrp': { description: '修改文件组', category: 'permission' },
  'umask': { description: '设置默认权限', category: 'permission' },
  
  // 压缩归档
  'tar': { description: '归档文件', category: 'archive' },
  'zip': { description: '创建ZIP压缩包', category: 'archive' },
  'unzip': { description: '解压ZIP文件', category: 'archive' },
  'gzip': { description: 'GZIP压缩', category: 'archive' },
  'gunzip': { description: 'GZIP解压', category: 'archive' },
  
  // 终端控制
  'clear': { description: '清空终端屏幕', category: 'terminal' },
  'history': { description: '显示命令历史', category: 'terminal' },
  'exit': { description: '退出终端', category: 'terminal' },
  'help': { description: '显示帮助信息', category: 'terminal' }
}

// 方法
const handleKeydown = (e) => {
  console.log('Key pressed:', e.key) // 调试日志
  
  switch (e.key) {
    case 'Enter':
      e.preventDefault()
      executeCommand()
      break
    case 'ArrowUp':
      e.preventDefault()
      navigateHistory(-1)
      break
    case 'ArrowDown':
      e.preventDefault()
      navigateHistory(1)
      break
    case 'Tab':
      e.preventDefault()
      handleTabCompletion()
      break
    case 'ArrowLeft':
    case 'ArrowRight':
      // 允许左右箭头移动光标
      break
    case 'Escape':
      e.preventDefault()
      clearSuggestions()
      break
    default:
      // 其他按键继续正常处理
      break
  }
}

const handleInput = () => {
  updateSuggestions()
}

const executeCommand = () => {
  console.log('executeCommand called') // 调试日志
  const command = currentInput.value.trim()
  console.log('Command to execute:', command) // 调试日志
  
  if (!command) {
    console.log('Empty command, returning') // 调试日志
    return
  }

  // 添加到历史记录
  if (command !== 'clear') {
    commandHistory.value.push(command)
    historyIndex.value = -1
  }

  // 解析命令
  const parts = command.split(' ')
  const cmd = parts[0]
  const args = parts.slice(1)

  console.log('Parsed command:', cmd, 'args:', args) // 调试日志

  // 创建历史条目
  const entry = {
    command: command,
    output: '',
    timestamp: new Date().toLocaleTimeString()
  }

  // 特殊命令处理
  if (cmd === 'clear') {
    terminalHistory.value = []
    currentInput.value = ''
    return
  } else if (cmd === 'cd') {
    const cdResult = handleCdCommand(args)
    if (cdResult) {
      entry.output = cdResult // cd命令出错时显示错误信息
      terminalHistory.value.push(entry)
      currentInput.value = ''
      emit('command-executed', { command, output: entry.output })
      nextTick(() => scrollToBottom())
      return
    } else {
      // cd成功时不添加到历史记录，直接返回
      currentInput.value = ''
      emit('command-executed', { command, output: '' })
      return
    }
  }

  // 执行命令逻辑
  console.log('Executing command logic for:', cmd) // 调试日志
  entry.output = executeCommandLogic(cmd, args)
  console.log('Command output:', entry.output) // 调试日志

  terminalHistory.value.push(entry)
  currentInput.value = ''
  clearSuggestions()

  // 发送命令执行事件
  emit('command-executed', { command, output: entry.output })

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

const executeCommandLogic = (cmd, args) => {
  // 内置命令处理
  switch (cmd) {
    case 'help':
      return generateHelpOutput()
    case 'pwd':
      return currentPath.value === '~' ? '/home/favork' : `/home/favork${currentPath.value.slice(1)}`
    case 'whoami':
      return 'favork'
    case 'date':
      return new Date().toString()
    case 'uname':
      return generateUnameOutput(args)
    case 'id':
      return 'uid=1000(favork) gid=1000(favork) groups=1000(favork),4(adm),24(cdrom),27(sudo),1001(docker)'
    case 'history':
      return commandHistory.value.map((cmd, index) => `${String(index + 1).padStart(5)} ${cmd}`).join('\n')
    case 'ls':
      return generateLsOutput(args)
    case 'cat':
      return generateCatOutput(args[0])
    case 'echo':
      return args.join(' ')
    case 'ps':
      return generatePsOutput(args)
    case 'df':
      return generateDfOutput(args)
    case 'du':
      return generateDuOutput(args)
    case 'free':
      return generateFreeOutput(args)
    case 'top':
      return generateTopOutput()
    case 'htop':
      return 'htop: command requires interactive terminal\nUse \'ps aux\' for process information'
    case 'uptime':
      return generateUptimeOutput()
    case 'ping':
      return generatePingOutput(args[0] || 'google.com')
    case 'curl':
      return generateCurlOutput(args)
    case 'wget':
      return generateWgetOutput(args)
    case 'ssh':
      return generateSshOutput(args)
    case 'netstat':
      return generateNetstatOutput(args)
    case 'ss':
      return generateSsOutput(args)
    case 'grep':
      return generateGrepOutput(args)
    case 'find':
      return generateFindOutput(args)
    case 'which':
      return generateWhichOutput(args)
    case 'head':
      return generateHeadOutput(args)
    case 'tail':
      return generateTailOutput(args)
    case 'wc':
      return generateWcOutput(args)
    case 'sort':
      return generateSortOutput(args)
    case 'chmod':
      return generateChmodOutput(args)
    case 'chown':
      return generateChownOutput(args)
    case 'tar':
      return generateTarOutput(args)
    case 'zip':
      return generateZipOutput(args)
    case 'unzip':
      return generateUnzipOutput(args)
    case 'tree':
      return generateTreeOutput(args)
    case 'locate':
      return generateLocateOutput(args)
    case 'man':
      return generateManOutput(args)
    default:
      if (commandDatabase[cmd]) {
        return `bash: ${cmd}: command not found`
      }
      return `bash: ${cmd}: command not found`
  }
}

const generateHelpOutput = () => {
  const categories = {
    file: '📁 文件操作',
    text: '📝 文本处理', 
    system: '⚙️ 系统信息',
    network: '🌐 网络工具',
    permission: '🔐 权限管理',
    archive: '📦 压缩归档',
    terminal: '💻 终端控制'
  }

  let output = '🚀 Linux Dojo 终端帮助\n\n'
  
  for (const [category, title] of Object.entries(categories)) {
    output += `${title}:\n`
    const commands = Object.entries(commandDatabase)
      .filter(([_, info]) => info.category === category)
      .map(([cmd, info]) => `  ${cmd.padEnd(12)} - ${info.description}`)
      .join('\n')
    output += commands + '\n\n'
  }
  
  output += '💡 提示:\n'
  output += '  - 使用 Tab 键自动补全命令\n'
  output += '  - 使用 ↑↓ 箭头键浏览历史命令\n'
  output += '  - 输入命令名称会显示相关建议\n'
  
  return output
}

const generateLsOutput = (args) => {
  console.log('generateLsOutput called with args:', args) // 调试日志
  
  // 从filesystem store获取当前目录的文件
  const files = filesystemStore.getCurrentDirectoryContents
  console.log('Files from store:', files) // 调试日志

  const formatSize = (size) => {
    if (size < 1024) return size.toString()
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}K`
    return `${(size / (1024 * 1024)).toFixed(1)}M`
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 180) {
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }

  if (args.includes('-l') || args.includes('-la') || args.includes('-al')) {
    let output = `total ${Math.ceil(files.reduce((sum, f) => sum + f.size, 0) / 1024)}\n`
    files.forEach(file => {
      const links = file.type === 'directory' ? '2' : '1'
      const size = formatSize(file.size)
      const date = formatDate(file.modified)
      output += `${file.permissions} ${links} favork favork ${size.padStart(8)} ${date} ${file.name}\n`
    })
    return output.trim()
  }
  
  return files.map(f => f.name).join('  ')
}

const generateCatOutput = (filename) => {
  console.log('generateCatOutput called with filename:', filename) // 调试日志
  
  if (!filename) {
    return 'cat: missing file operand\nTry \'cat --help\' for more information.'
  }

  // 从filesystem store获取文件内容
  const fileContent = filesystemStore.getFileContent(filename)
  console.log('File content from store:', fileContent) // 调试日志
  
  if (fileContent !== null) {
    return fileContent
  }
  
  return `cat: ${filename}: No such file or directory`
}

const generatePsOutput = (args) => {
  return `  PID TTY          TIME CMD
 1234 pts/0    00:00:01 bash
 5678 pts/0    00:00:00 node
 9012 pts/0    00:00:00 ps`
}

const generateDfOutput = () => {
  return `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       20971520 13421772   6291456  69% /
tmpfs            2048000   123456   1924544   6% /tmp
/dev/sda2       10485760  3145728   6291456  34% /home`
}

const generateFreeOutput = () => {
  return `              total        used        free      shared  buff/cache   available
Mem:        8192000     3276800     2048000      163840     2867200     4505600
Swap:       2097152      524288     1572864`
}

const generateUnameOutput = (args) => {
  if (args.includes('-a') || args.includes('--all')) {
    return 'Linux linux 5.15.0-56-generic #62-Ubuntu SMP Tue Nov 22 19:54:14 UTC 2022 x86_64 x86_64 x86_64 GNU/Linux'
  }
  if (args.includes('-s') || args.includes('--kernel-name')) return 'Linux'
  if (args.includes('-n') || args.includes('--nodename')) return 'linux'
  if (args.includes('-r') || args.includes('--kernel-release')) return '5.15.0-56-generic'
  if (args.includes('-v') || args.includes('--kernel-version')) return '#62-Ubuntu SMP Tue Nov 22 19:54:14 UTC 2022'
  if (args.includes('-m') || args.includes('--machine')) return 'x86_64'
  if (args.includes('-p') || args.includes('--processor')) return 'x86_64'
  if (args.includes('-i') || args.includes('--hardware-platform')) return 'x86_64'
  if (args.includes('-o') || args.includes('--operating-system')) return 'GNU/Linux'
  return 'Linux'
}

const generateDuOutput = (args) => {
  if (args.includes('-h') || args.includes('--human-readable')) {
    return `4.0K	./Documents
8.0K	./Pictures
12K	./Downloads
2.0K	./scripts
26K	.`
  }
  return `4	./Documents
8	./Pictures
12	./Downloads
2	./scripts
26	.`
}

const generateTopOutput = () => {
  return `top - ${new Date().toLocaleTimeString()} up 2 days, 14:32,  1 user,  load average: 0.15, 0.25, 0.18
Tasks: 245 total,   1 running, 244 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.2 id,  0.3 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   7936.2 total,   2847.3 free,   2156.4 used,   2932.5 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5456.2 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 favork    20   0 1234567  123456  12345 S   2.3   1.5   0:12.34 node
 5678 favork    20   0  987654   98765   9876 S   1.2   1.2   0:05.67 chrome
 9012 root      20   0  456789   45678   4567 S   0.7   0.6   0:02.34 systemd
 3456 favork    20   0  234567   23456   2345 S   0.3   0.3   0:01.23 bash`
}

const generateUptimeOutput = () => {
  const uptime = Math.floor(Math.random() * 86400 * 7) // 随机7天内的秒数
  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  
  return ` ${new Date().toLocaleTimeString()} up ${days} days, ${hours}:${minutes.toString().padStart(2, '0')},  1 user,  load average: 0.15, 0.25, 0.18`
}

const generatePingOutput = (target) => {
  if (!target) {
    return 'ping: usage error: Destination address required'
  }
  return `PING ${target} (8.8.8.8) 56(84) bytes of data.
64 bytes from ${target} (8.8.8.8): icmp_seq=1 ttl=64 time=12.3 ms
64 bytes from ${target} (8.8.8.8): icmp_seq=2 ttl=64 time=11.8 ms
64 bytes from ${target} (8.8.8.8): icmp_seq=3 ttl=64 time=13.1 ms
^C
--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 11.8/12.4/13.1/0.5 ms`
}

const generateCurlOutput = (args) => {
  if (args.length === 0) {
    return 'curl: try \'curl --help\' or \'curl --manual\' for more information'
  }
  const url = args[args.length - 1]
  return `<!DOCTYPE html>
<html>
<head>
    <title>Example Domain</title>
</head>
<body>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents.</p>
</body>
</html>`
}

const generateWgetOutput = (args) => {
  if (args.length === 0) {
    return 'wget: missing URL\nUsage: wget [OPTION]... [URL]...'
  }
  const url = args[args.length - 1]
  const filename = url.split('/').pop() || 'index.html'
  return `--${new Date().toISOString().slice(0, 19)}--  ${url}
Resolving ${url.replace(/^https?:\/\//, '').split('/')[0]}... 93.184.216.34
Connecting to ${url.replace(/^https?:\/\//, '').split('/')[0]}|93.184.216.34|:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1256 (1.2K) [text/html]
Saving to: '${filename}'

${filename}          100%[===================>]   1.23K  --.-KB/s    in 0s      

${new Date().toISOString().slice(0, 19)} (7.89 MB/s) - '${filename}' saved [1256/1256]`
}

const generateSshOutput = (args) => {
  if (args.length === 0) {
    return 'usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]\n           [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]\n           [-E log_file] [-e escape_char] [-F configfile] [-I pkcs11]\n           [-i identity_file] [-J [user@]host[:port]] [-L address]\n           [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port]\n           [-Q query_option] [-R address] [-S ctl_path] [-W host:port]\n           [-w local_tun[:remote_tun]] destination [command]'
  }
  const target = args[0]
  return `ssh: connect to host ${target} port 22: Connection refused`
}

const generateNetstatOutput = (args) => {
  if (args.includes('-l') || args.includes('--listening')) {
    return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN     
tcp6       0      0 :::80                   :::*                    LISTEN     
tcp6       0      0 :::22                   :::*                    LISTEN`
  }
  return `Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 192.168.1.100:45678     93.184.216.34:80        ESTABLISHED
tcp        0      0 192.168.1.100:56789     8.8.8.8:53              TIME_WAIT`
}

const generateSsOutput = (args) => {
  if (args.includes('-l') || args.includes('--listening')) {
    return `State      Recv-Q Send-Q Local Address:Port          Peer Address:Port
LISTEN     0      128          0.0.0.0:22                     *:*    
LISTEN     0      80     127.0.0.1:3306                   *:*    
LISTEN     0      128             [::]:80                    [::]:*    
LISTEN     0      128             [::]:22                    [::]:*`
  }
  return `State      Recv-Q Send-Q Local Address:Port          Peer Address:Port
ESTAB      0      0      192.168.1.100:45678         93.184.216.34:80   
TIME-WAIT  0      0      192.168.1.100:56789              8.8.8.8:53`
}

const generateGrepOutput = (args) => {
  if (args.length < 2) {
    return 'grep: missing operand\nTry \'grep --help\' for more information.'
  }
  const pattern = args[0]
  const filename = args[1]
  
  // 模拟grep搜索结果
  const mockMatches = [
    `${filename}:1:This line contains ${pattern}`,
    `${filename}:5:Another line with ${pattern} here`,
    `${filename}:12:Final match for ${pattern}`
  ]
  return mockMatches.join('\n')
}

const generateFindOutput = (args) => {
  const path = args[0] || '.'
  return `${path}/Documents
${path}/Documents/report.txt
${path}/Documents/notes.md
${path}/Pictures
${path}/Pictures/photo1.jpg
${path}/Pictures/photo2.png
${path}/Downloads
${path}/Downloads/file.zip
${path}/scripts
${path}/scripts/backup.sh`
}

const generateWhichOutput = (args) => {
  if (args.length === 0) {
    return 'which: missing operand'
  }
  const command = args[0]
  const commonPaths = {
    'ls': '/usr/bin/ls',
    'cat': '/usr/bin/cat',
    'grep': '/usr/bin/grep',
    'find': '/usr/bin/find',
    'bash': '/usr/bin/bash',
    'python': '/usr/bin/python3',
    'node': '/usr/bin/node',
    'npm': '/usr/bin/npm',
    'git': '/usr/bin/git',
    'vim': '/usr/bin/vim',
    'nano': '/usr/bin/nano'
  }
  return commonPaths[command] || `which: no ${command} in (/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin)`
}

const generateHeadOutput = (args) => {
  if (args.length === 0) {
    return 'head: missing operand\nTry \'head --help\' for more information.'
  }
  const filename = args[args.length - 1]
  const lines = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10
  
  const mockContent = `Line 1 of ${filename}
Line 2 of ${filename}
Line 3 of ${filename}
Line 4 of ${filename}
Line 5 of ${filename}
Line 6 of ${filename}
Line 7 of ${filename}
Line 8 of ${filename}
Line 9 of ${filename}
Line 10 of ${filename}`.split('\n').slice(0, lines).join('\n')
  
  return mockContent
}

const generateTailOutput = (args) => {
  if (args.length === 0) {
    return 'tail: missing operand\nTry \'tail --help\' for more information.'
  }
  const filename = args[args.length - 1]
  const lines = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10
  
  const mockContent = `Line 91 of ${filename}
Line 92 of ${filename}
Line 93 of ${filename}
Line 94 of ${filename}
Line 95 of ${filename}
Line 96 of ${filename}
Line 97 of ${filename}
Line 98 of ${filename}
Line 99 of ${filename}
Line 100 of ${filename}`.split('\n').slice(-lines).join('\n')
  
  return mockContent
}

const generateWcOutput = (args) => {
  if (args.length === 0) {
    return 'wc: missing operand\nTry \'wc --help\' for more information.'
  }
  const filename = args[args.length - 1]
  const lines = Math.floor(Math.random() * 100) + 50
  const words = Math.floor(Math.random() * 500) + 200
  const chars = Math.floor(Math.random() * 2000) + 1000
  
  if (args.includes('-l')) return `${lines} ${filename}`
  if (args.includes('-w')) return `${words} ${filename}`
  if (args.includes('-c')) return `${chars} ${filename}`
  
  return `${lines} ${words} ${chars} ${filename}`
}

const generateSortOutput = (args) => {
  if (args.length === 0) {
    return `apple
banana
cherry
date
elderberry`
  }
  const filename = args[args.length - 1]
  return `Line A from ${filename}
Line B from ${filename}
Line C from ${filename}
Line D from ${filename}`
}

const generateChmodOutput = (args) => {
  if (args.length < 2) {
    return 'chmod: missing operand\nTry \'chmod --help\' for more information.'
  }
  return '' // chmod通常没有输出，除非出错
}

const generateChownOutput = (args) => {
  if (args.length < 2) {
    return 'chown: missing operand\nTry \'chown --help\' for more information.'
  }
  return '' // chown通常没有输出，除非出错
}

const generateTarOutput = (args) => {
  if (args.length === 0) {
    return 'tar: You must specify one of the \'-Acdtrux\', \'--delete\' or \'--test-label\' options\nTry \'tar --help\' or \'tar --usage\' for more information.'
  }
  
  if (args.includes('-tf') || args.includes('-tvf')) {
    const archive = args[args.length - 1]
    return `drwxr-xr-x favork/favork     0 2024-01-15 10:30 folder/
-rw-r--r-- favork/favork  1234 2024-01-15 10:30 folder/file1.txt
-rw-r--r-- favork/favork  5678 2024-01-15 10:30 folder/file2.txt`
  }
  
  if (args.includes('-cf')) {
    return '' // 创建归档通常没有输出
  }
  
  if (args.includes('-xf')) {
    return '' // 解压通常没有输出
  }
  
  return 'tar: operation completed'
}

const generateZipOutput = (args) => {
  if (args.length < 2) {
    return 'zip error: Nothing to do! (try: zip -r archive.zip directory)'
  }
  const archive = args[0]
  const files = args.slice(1)
  return `  adding: ${files.join('\n  adding: ')}
zip completed successfully`
}

const generateUnzipOutput = (args) => {
  if (args.length === 0) {
    return 'UnZip 6.00 of 20 April 2009, by Debian. Original by Info-ZIP.\n\nUsage: unzip [-Z] [-opts[modifiers]] file[.zip] [list] [-x xlist] [-d exdir]'
  }
  const archive = args[0]
  return `Archive:  ${archive}
  inflating: file1.txt               
  inflating: file2.txt               
  inflating: folder/file3.txt`
}

const generateTreeOutput = (args) => {
  const path = args[0] || '.'
  return `${path}
├── Documents
│   ├── report.txt
│   └── notes.md
├── Pictures
│   ├── photo1.jpg
│   └── photo2.png
├── Downloads
│   └── file.zip
└── scripts
    └── backup.sh

4 directories, 6 files`
}

const generateLocateOutput = (args) => {
  if (args.length === 0) {
    return 'locate: missing operand\nTry \'locate --help\' for more information.'
  }
  const pattern = args[0]
  return `/home/favork/Documents/${pattern}.txt
/usr/share/doc/${pattern}
/var/log/${pattern}.log`
}

const generateManOutput = (args) => {
  if (args.length === 0) {
    return 'What manual page do you want?\nFor example, try \'man man\'.'
  }
  const command = args[0]
  return `${command.toUpperCase()}(1)                    User Commands                    ${command.toUpperCase()}(1)

NAME
       ${command} - ${commandDatabase[command]?.description || 'command description'}

SYNOPSIS
       ${command} [OPTION]... [FILE]...

DESCRIPTION
       This is a simulated manual page for the ${command} command.
       In a real Linux system, this would contain detailed documentation.

OPTIONS
       -h, --help
              display this help and exit

       -v, --version
              output version information and exit

EXAMPLES
       ${command} file.txt
              Basic usage example

SEE ALSO
       Related commands and documentation

Linux Dojo Manual                January 2024                    ${command.toUpperCase()}(1)`
}

const handleCdCommand = (args) => {
  if (args.length === 0 || args[0] === '~') {
    currentPath.value = '~'
    if (filesystemStore.changeDirectory) {
      filesystemStore.changeDirectory('/home/favork')
    }
  } else if (args[0] === '..') {
    const parts = currentPath.value.split('/')
    if (parts.length > 1) {
      parts.pop()
      currentPath.value = parts.join('/') || '~'
      const newPath = currentPath.value === '~' ? '/home/favork' : `/home/favork${currentPath.value.slice(1)}`
      if (filesystemStore.changeDirectory) {
        filesystemStore.changeDirectory(newPath)
      }
    }
  } else {
    // 检查目录是否存在
    const targetDir = args[0]
    const currentFiles = filesystemStore.getCurrentDirectoryContents() || []
    const dirExists = currentFiles.some(file => file.name === targetDir && file.type === 'directory')
    
    if (dirExists || ['Documents', 'Pictures', 'Downloads'].includes(targetDir)) {
      const newPath = args[0].startsWith('/') ? args[0] : `${currentPath.value}/${args[0]}`
      currentPath.value = newPath
      
      const fullPath = newPath.startsWith('/') ? newPath : `/home/favork${newPath.slice(1)}`
      if (filesystemStore.changeDirectory) {
        filesystemStore.changeDirectory(fullPath)
      }
    } else {
      // 返回错误信息，这将在executeCommand中处理
      return `cd: ${targetDir}: No such file or directory`
    }
  }
  return null
}

const navigateHistory = (direction) => {
  if (commandHistory.value.length === 0) return

  if (direction === -1) { // 上箭头
    if (historyIndex.value === -1) {
      historyIndex.value = commandHistory.value.length - 1
    } else if (historyIndex.value > 0) {
      historyIndex.value--
    }
  } else if (direction === 1) { // 下箭头
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++
    } else {
      historyIndex.value = -1
      currentInput.value = ''
      return
    }
  }

  if (historyIndex.value >= 0) {
    currentInput.value = commandHistory.value[historyIndex.value]
  }
}

const handleTabCompletion = () => {
  const input = currentInput.value.trim()
  if (!input) {
    showAllCommands()
    return
  }

  const matches = Object.keys(commandDatabase).filter(cmd => cmd.startsWith(input))
  
  if (matches.length === 1) {
    currentInput.value = matches[0] + ' '
    clearSuggestions()
  } else if (matches.length > 1) {
    suggestions.value = matches.map(cmd => ({
      command: cmd,
      description: commandDatabase[cmd].description
    }))
    selectedSuggestion.value = 0
  }
}

const updateSuggestions = () => {
  const input = currentInput.value.trim()
  if (!input) {
    clearSuggestions()
    return
  }

  const matches = Object.keys(commandDatabase)
    .filter(cmd => cmd.includes(input.toLowerCase()))
    .slice(0, 5)
    .map(cmd => ({
      command: cmd,
      description: commandDatabase[cmd].description
    }))

  suggestions.value = matches
  selectedSuggestion.value = matches.length > 0 ? 0 : -1
}

const showAllCommands = () => {
  suggestions.value = Object.entries(commandDatabase)
    .slice(0, 10)
    .map(([cmd, info]) => ({
      command: cmd,
      description: info.description
    }))
  selectedSuggestion.value = 0
}

const applySuggestion = (suggestion) => {
  currentInput.value = suggestion.command + ' '
  clearSuggestions()
  focusInput()
}

const clearSuggestions = () => {
  suggestions.value = []
  selectedSuggestion.value = -1
}

const clearTerminal = () => {
  terminalHistory.value = []
}

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
}

const focusInput = () => {
  if (terminalInput.value) {
    terminalInput.value.focus()
  }
}

const scrollToBottom = () => {
  if (terminalContent.value) {
    terminalContent.value.scrollTop = terminalContent.value.scrollHeight
  }
}

const formatOutput = (output) => {
  // 简单的输出格式化，添加颜色和样式
  return output
    .replace(/^(.*):$/gm, '<span class="output-header">$1:</span>')
    .replace(/\b(error|Error|ERROR)\b/g, '<span class="output-error">$1</span>')
    .replace(/\b(success|Success|SUCCESS|OK)\b/g, '<span class="output-success">$1</span>')
    .replace(/\b(warning|Warning|WARNING)\b/g, '<span class="output-warning">$1</span>')
    .replace(/\b(\d+\.\d+\.\d+\.\d+)\b/g, '<span class="output-ip">$1</span>')
    .replace(/\b(https?:\/\/[^\s]+)\b/g, '<span class="output-url">$1</span>')
}

// 生命周期
onMounted(() => {
  focusInput()
  
  // 添加欢迎信息
  terminalHistory.value.push({
    command: '',
    output: `🎉 欢迎使用 Linux Dojo 终端模拟器！

这是一个功能完整的Linux终端模拟器，支持常用的Linux命令。
输入 'help' 查看所有可用命令，或者直接开始输入命令。

特性：
✨ 支持命令自动补全 (Tab键)
📚 命令历史记录 (↑↓箭头键)
🎨 语法高亮输出
🔍 智能命令建议

开始你的Linux学习之旅吧！`,
    timestamp: new Date().toLocaleTimeString()
  })
  
  scrollToBottom()
})

// 监听外部命令
watch(() => props.title, (newTitle) => {
  if (newTitle && newTitle !== props.title) {
    // 可以在这里处理外部命令
  }
})
</script>

<style scoped>
.mac-terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}

/* Mac风格标题栏 */
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: linear-gradient(180deg, #3c3c3c 0%, #2d2d2d 100%);
  border-bottom: 1px solid #1a1a1a;
  user-select: none;
}

.traffic-lights {
  display: flex;
  gap: 8px;
}

.light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.light:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.light.red {
  background: radial-gradient(circle, #ff6b6b, #ff5f57);
}

.light.yellow {
  background: radial-gradient(circle, #ffd93d, #ffbd2e);
}

.light.green {
  background: radial-gradient(circle, #6bcf7f, #28ca42);
}

.terminal-title {
  color: #00ff88;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.terminal-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #888;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #e0e0e0;
  transform: translateY(-1px);
}

/* 终端内容 */
.terminal-content {
  flex: 1;
  padding: 16px;
  background: #000;
  color: #e0e0e0;
  font-size: 13px;
  line-height: 1.5;
  overflow-y: auto;
  position: relative;
}

.terminal-entry {
  margin-bottom: 12px;
}

.command-line {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.prompt {
  color: #00ff88;
  margin-right: 4px;
  user-select: none;
  font-weight: 600;
}

.command-text {
  color: #e0e0e0;
  font-weight: 500;
}

.command-output {
  margin-left: 0;
  margin-bottom: 8px;
  padding-left: 4px;
  border-left: 2px solid rgba(0, 255, 136, 0.2);
}

.command-output pre {
  color: #b0b0b0;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  line-height: 1.4;
}

.current-command-line {
  display: flex;
  align-items: center;
  position: sticky;
  bottom: 0;
  background: #000;
  padding: 4px 0;
}

.terminal-input {
  background: transparent;
  border: none;
  outline: none;
  color: #e0e0e0;
  font-family: inherit;
  font-size: inherit;
  flex: 1;
  margin-right: 4px;
  font-weight: 500;
}

.terminal-input::placeholder {
  color: #555;
  font-style: italic;
}

.cursor {
  color: #00ff88;
  font-weight: bold;
}

.cursor.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 自动补全建议 */
.suggestions {
  position: absolute;
  bottom: 60px;
  left: 16px;
  right: 16px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: rgba(0, 255, 136, 0.1);
  border-left: 3px solid #00ff88;
}

.suggestion-command {
  color: #00ff88;
  font-weight: 600;
}

.suggestion-desc {
  color: #888;
  font-size: 11px;
  font-style: italic;
}

/* 输出样式增强 */
:deep(.output-header) {
  color: #00d4ff;
  font-weight: 600;
}

:deep(.output-error) {
  color: #ff6b6b;
  font-weight: 600;
}

:deep(.output-success) {
  color: #00ff88;
  font-weight: 600;
}

:deep(.output-warning) {
  color: #ffd93d;
  font-weight: 600;
}

:deep(.output-ip) {
  color: #00d4ff;
  font-weight: 500;
}

:deep(.output-url) {
  color: #ff9500;
  text-decoration: underline;
}

/* 滚动条样式 */
.terminal-content::-webkit-scrollbar {
  width: 8px;
}

.terminal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.terminal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.terminal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 136, 0.5);
}

.suggestions::-webkit-scrollbar {
  width: 6px;
}

.suggestions::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.suggestions::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.3);
  border-radius: 3px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .terminal-header {
    padding: 6px 12px;
  }
  
  .terminal-title {
    font-size: 12px;
  }
  
  .terminal-content {
    padding: 12px;
    font-size: 12px;
  }
  
  .suggestions {
    bottom: 50px;
    left: 12px;
    right: 12px;
  }
  
  .suggestion-item {
    padding: 6px 10px;
  }
  
  .suggestion-desc {
    display: none;
  }
}

/* 动画效果 */
.terminal-entry {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions {
  animation: fadeInUp 0.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 主题切换 */
.mac-terminal.light {
  background: #f5f5f5;
}

.mac-terminal.light .terminal-content {
  background: #ffffff;
  color: #333;
}

.mac-terminal.light .prompt {
  color: #007acc;
}

.mac-terminal.light .terminal-input {
  color: #333;
}

.mac-terminal.light .cursor {
  color: #007acc;
}
</style>
