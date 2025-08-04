import { defineStore } from 'pinia'
import { performanceManager } from '@/core/PerformanceManager'

export const useEnhancedFilesystemStore = defineStore('enhancedFilesystem', {
  state: () => ({
    currentPath: '/home/favork',
    fileSystem: {
      '/': {
        type: 'directory',
        children: {
          'home': {
            type: 'directory',
            children: {
              'favork': {
                type: 'directory',
                children: {
                  'Documents': {
                    type: 'directory',
                    children: {
                      'notes.txt': {
                        type: 'file',
                        content: 'Linux学习笔记\n=============\n\n1. 基本命令\n   - ls: 列出文件\n   - cd: 切换目录\n   - pwd: 显示当前路径\n\n2. 文件操作\n   - cat: 查看文件内容\n   - cp: 复制文件\n   - mv: 移动文件\n   - rm: 删除文件\n\n3. 管道和重定向\n   - |: 管道操作\n   - >: 输出重定向\n   - >>: 追加重定向\n   - <: 输入重定向',
                        size: 334,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-15 10:30',
                        owner: 'favork',
                        group: 'favork'
                      },
                      'project.md': {
                        type: 'file',
                        content: '# 项目文档\n\n这是一个Linux学习项目的文档。\n\n## 功能特性\n- 交互式终端\n- 命令自动补全\n- 文件系统模拟\n- 管道和重定向支持\n- 性能优化\n\n## 新增功能\n- 统一命令处理架构\n- 缓存机制\n- 内存管理\n- 错误处理系统',
                        size: 256,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-14 15:20',
                        owner: 'favork',
                        group: 'favork'
                      },
                      'commands.log': {
                        type: 'file',
                        content: '',
                        size: 0,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-15 12:00',
                        owner: 'favork',
                        group: 'favork'
                      }
                    },
                    size: 4096,
                    permissions: 'drwxr-xr-x',
                    modified: '2024-01-15 10:30',
                    owner: 'favork',
                    group: 'favork'
                  },
                  'Pictures': {
                    type: 'directory',
                    children: {
                      'screenshot.png': {
                        type: 'file',
                        content: '[Binary PNG file]',
                        size: 2048576,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-13 14:25',
                        owner: 'favork',
                        group: 'favork'
                      },
                      'wallpaper.jpg': {
                        type: 'file',
                        content: '[Binary JPEG file]',
                        size: 1536000,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-12 09:30',
                        owner: 'favork',
                        group: 'favork'
                      }
                    },
                    size: 4096,
                    permissions: 'drwxr-xr-x',
                    modified: '2024-01-14 15:20',
                    owner: 'favork',
                    group: 'favork'
                  },
                  'Downloads': {
                    type: 'directory',
                    children: {
                      'linux-guide.pdf': {
                        type: 'file',
                        content: '[Binary PDF file]',
                        size: 1048576,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-12 09:15',
                        owner: 'favork',
                        group: 'favork'
                      },
                      'sample.txt': {
                        type: 'file',
                        content: 'This is a sample text file.\nIt contains multiple lines.\nUseful for testing grep and other text processing commands.\n\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10',
                        size: 156,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-11 14:20',
                        owner: 'favork',
                        group: 'favork'
                      }
                    },
                    size: 4096,
                    permissions: 'drwxr-xr-x',
                    modified: '2024-01-13 09:45',
                    owner: 'favork',
                    group: 'favork'
                  },
                  'scripts': {
                    type: 'directory',
                    children: {
                      'backup.sh': {
                        type: 'file',
                        content: '#!/bin/bash\n\n# 备份脚本\necho "开始备份..."\ncp -r ~/Documents ~/backup/\necho "备份完成！"',
                        size: 89,
                        permissions: '-rwxr-xr-x',
                        modified: '2024-01-10 16:45',
                        owner: 'favork',
                        group: 'favork'
                      },
                      'system_info.sh': {
                        type: 'file',
                        content: '#!/bin/bash\n\n# 系统信息脚本\necho "=== 系统信息 ==="\necho "主机名: $(hostname)"\necho "用户: $(whoami)"\necho "当前目录: $(pwd)"\necho "系统时间: $(date)"\n\necho "\\n=== 磁盘使用情况 ==="\ndf -h\n\necho "\\n=== 内存使用情况 ==="\nfree -h',
                        size: 267,
                        permissions: '-rwxr-xr-x',
                        modified: '2024-01-10 11:20',
                        owner: 'favork',
                        group: 'favork'
                      }
                    },
                    size: 4096,
                    permissions: 'drwxr-xr-x',
                    modified: '2024-01-10 16:45',
                    owner: 'favork',
                    group: 'favork'
                  },
                  'config.json': {
                    type: 'file',
                    content: '{\n  "server": {\n    "port": 8080,\n    "host": "localhost",\n    "environment": "development"\n  },\n  "database": {\n    "type": "mysql",\n    "host": "db.linux.local",\n    "port": 3306\n  },\n  "logging": {\n    "level": "info",\n    "file": "/var/log/app.log"\n  },\n  "features": {\n    "pipeSupport": true,\n    "redirectSupport": true,\n    "caching": true\n  }\n}',
                    size: 392,
                    permissions: '-rw-r--r--',
                    modified: '2024-01-12 14:15',
                    owner: 'favork',
                    group: 'favork'
                  },
                  'README.md': {
                    type: 'file',
                    content: '# Linux Dojo 学习环境\n\n欢迎来到Linux学习环境！这里提供了一个完整的Linux命令行体验。\n\n## 新增功能\n\n### 管道支持\n- `ls | grep txt` - 列出包含txt的文件\n- `cat file.txt | wc -l` - 统计文件行数\n- `ps aux | grep node` - 查找node进程\n\n### 重定向支持\n- `echo "hello" > file.txt` - 写入文件\n- `echo "world" >> file.txt` - 追加到文件\n- `cat < file.txt` - 从文件读取\n\n### 性能优化\n- 命令缓存机制\n- 内存管理\n- 输出缓冲区\n\n## 可用命令\n\n### 文件操作\n- `ls` - 列出目录内容\n- `cat` - 显示文件内容\n- `pwd` - 显示当前目录\n- `cd` - 切换目录\n\n### 文本处理\n- `grep` - 搜索文本\n- `sort` - 排序文本\n- `wc` - 统计字符数\n\n### 系统信息\n- `whoami` - 显示当前用户\n- `ps` - 显示进程信息\n- `ping` - 测试网络连通性\n\n开始你的Linux学习之旅吧！',
                    size: 845,
                    permissions: '-rw-r--r--',
                    modified: '2024-01-15 16:30',
                    owner: 'favork',
                    group: 'favork'
                  }
                },
                size: 4096,
                permissions: 'drwxr-xr-x',
                modified: '2024-01-15 12:00',
                owner: 'favork',
                group: 'favork'
              }
            },
            size: 4096,
            permissions: 'drwxr-xr-x',
            modified: '2024-01-15 12:00',
            owner: 'root',
            group: 'root'
          },
          'etc': {
            type: 'directory',
            children: {
              'passwd': {
                type: 'file',
                content: 'root:x:0:0:root:/root:/bin/bash\nfavork:x:1000:1000:favork:/home/favork:/bin/bash',
                size: 89,
                permissions: '-rw-r--r--',
                modified: '2024-01-01 00:00',
                owner: 'root',
                group: 'root'
              },
              'hosts': {
                type: 'file',
                content: '127.0.0.1\tlocalhost\n127.0.1.1\tlinux\n\n# The following lines are desirable for IPv6 capable hosts\n::1     ip6-localhost ip6-loopback\nfe00::0 ip6-localnet\nff00::0 ip6-mcastprefix\nff02::1 ip6-allnodes\nff02::2 ip6-allrouters',
                size: 221,
                permissions: '-rw-r--r--',
                modified: '2024-01-01 00:00',
                owner: 'root',
                group: 'root'
              }
            },
            size: 4096,
            permissions: 'drwxr-xr-x',
            modified: '2024-01-01 00:00',
            owner: 'root',
            group: 'root'
          },
          'tmp': {
            type: 'directory',
            children: {},
            size: 4096,
            permissions: 'drwxrwxrwt',
            modified: '2024-01-15 12:00',
            owner: 'root',
            group: 'root'
          }
        },
        size: 4096,
        permissions: 'drwxr-xr-x',
        modified: '2024-01-01 00:00',
        owner: 'root',
        group: 'root'
      }
    },
    // 缓存系统
    pathCache: new Map(),
    contentCache: new Map(),
    // 系统信息
    systemInfo: {
      hostname: 'linux',
      kernel: 'Linux 5.15.0-56-generic',
      uptime: '2 days, 14:32',
      memoryUsed: '3.2GB',
      memoryTotal: '8.0GB',
      diskUsage: {
        '/': { usage: '68%', used: '13GB', total: '20GB' }
      },
      loadAverage: [0.85, 0.92, 1.15]
    }
  }),

  getters: {
    getCurrentDirectoryContents() {
      // 检查缓存
      const cacheKey = `dir:${this.currentPath}`
      const cached = performanceManager.getCache(cacheKey)
      if (cached) {
        return cached
      }

      const pathParts = this.currentPath.split('/').filter(part => part !== '')
      let current = this.fileSystem['/']
      
      // 导航到当前路径
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return []
        }
      }
      
      if (!current.children) return []
      
      // 返回当前目录的内容
      const result = Object.entries(current.children).map(([name, item]) => ({
        name,
        type: item.type,
        size: item.size,
        permissions: item.permissions,
        modified: item.modified,
        owner: item.owner,
        group: item.group
      }))

      // 缓存结果
      performanceManager.setCache(cacheKey, result, 30000) // 30秒缓存
      return result
    },

    getFileSystemStats() {
      let totalFiles = 0
      let totalDirs = 0
      let totalSize = 0

      const traverse = (node) => {
        if (node.type === 'file') {
          totalFiles++
          totalSize += node.size
        } else if (node.type === 'directory') {
          totalDirs++
          if (node.children) {
            Object.values(node.children).forEach(traverse)
          }
        }
      }

      traverse(this.fileSystem['/'])

      return {
        totalFiles,
        totalDirs,
        totalSize,
        formattedSize: this.formatSize(totalSize)
      }
    }
  },

  actions: {
    changeDirectory(newPath) {
      // 规范化路径
      if (newPath === '~' || newPath === '/home/favork') {
        this.currentPath = '/home/favork'
        return true
      }
      
      // 处理相对路径
      if (!newPath.startsWith('/')) {
        const currentParts = this.currentPath.split('/').filter(part => part !== '')
        const newParts = newPath.split('/').filter(part => part !== '')
        
        for (const part of newParts) {
          if (part === '..') {
            if (currentParts.length > 0) {
              currentParts.pop()
            }
          } else if (part !== '.') {
            currentParts.push(part)
          }
        }
        
        newPath = '/' + currentParts.join('/')
      }
      
      // 检查路径是否存在
      const pathParts = newPath.split('/').filter(part => part !== '')
      let current = this.fileSystem['/']
      
      for (const part of pathParts) {
        if (current.children && current.children[part] && current.children[part].type === 'directory') {
          current = current.children[part]
        } else {
          return false // 路径不存在
        }
      }
      
      this.currentPath = newPath
      return true
    },

    getFileContent(filename) {
      // 检查缓存
      const cacheKey = `file:${this.currentPath}/${filename}`
      const cached = performanceManager.getCache(cacheKey)
      if (cached) {
        return cached
      }

      const pathParts = this.currentPath.split('/').filter(part => part !== '')
      let current = this.fileSystem['/']
      
      // 导航到当前路径
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return null
        }
      }
      
      // 查找文件
      if (current.children && current.children[filename] && current.children[filename].type === 'file') {
        const content = current.children[filename].content
        // 缓存文件内容
        performanceManager.setCache(cacheKey, content, 60000) // 1分钟缓存
        return content
      }
      
      return null
    },

    writeFile(filename, content, mode = 'write') {
      const pathParts = this.currentPath.split('/').filter(part => part !== '')
      let current = this.fileSystem['/']
      
      // 导航到当前路径
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          throw new Error(`Directory not found: ${part}`)
        }
      }
      
      if (!current.children) {
        throw new Error('Cannot write to file in non-directory')
      }

      const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
      
      if (mode === 'append' && current.children[filename]) {
        // 追加模式
        current.children[filename].content += content
        current.children[filename].size = current.children[filename].content.length
        current.children[filename].modified = now
      } else {
        // 写入模式（覆盖或创建新文件）
        current.children[filename] = {
          type: 'file',
          content: content,
          size: content.length,
          permissions: '-rw-r--r--',
          modified: now,
          owner: 'favork',
          group: 'favork'
        }
      }

      // 清除相关缓存
      const cacheKey = `file:${this.currentPath}/${filename}`
      performanceManager.cache.delete(cacheKey)
      performanceManager.cache.delete(`dir:${this.currentPath}`)
      
      return true
    },

    appendFile(filename, content) {
      return this.writeFile(filename, content, 'append')
    },

    deleteFile(filename) {
      const pathParts = this.currentPath.split('/').filter(part => part !== '')
      let current = this.fileSystem['/']
      
      // 导航到当前路径
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return false
        }
      }
      
      if (current.children && current.children[filename]) {
        delete current.children[filename]
        
        // 清除相关缓存
        const cacheKey = `file:${this.currentPath}/${filename}`
        performanceManager.cache.delete(cacheKey)
        performanceManager.cache.delete(`dir:${this.currentPath}`)
        
        return true
      }
      
      return false
    },

    createDirectory(dirname) {
      const pathParts = this.currentPath.split('/').filter(part => part !== '')
      let current = this.fileSystem['/']
      
      // 导航到当前路径
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return false
        }
      }
      
      if (!current.children) {
        return false
      }

      if (current.children[dirname]) {
        return false // 已存在
      }

      const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
      current.children[dirname] = {
        type: 'directory',
        children: {},
        size: 4096,
        permissions: 'drwxr-xr-x',
        modified: now,
        owner: 'favork',
        group: 'favork'
      }

      // 清除目录缓存
      performanceManager.cache.delete(`dir:${this.currentPath}`)
      
      return true
    },

    getCommandRelevantFiles(command, parameters = []) {
      const currentFiles = this.getCurrentDirectoryContents
      
      // 根据命令类型返回相关文件
      switch (command) {
        case 'ls':
          return currentFiles
        case 'cat':
        case 'less':
        case 'more':
          if (parameters.length > 0) {
            return currentFiles.filter(file => 
              file.type === 'file' && file.name === parameters[0]
            )
          }
          return currentFiles.filter(file => file.type === 'file')
        case 'cd':
          return currentFiles.filter(file => file.type === 'directory')
        case 'grep':
          return currentFiles.filter(file => file.type === 'file' && 
            (file.name.endsWith('.txt') || file.name.endsWith('.md') || 
             file.name.endsWith('.json') || file.name.endsWith('.sh')))
        case 'find':
          return currentFiles
        case 'chmod':
        case 'chown':
          return currentFiles
        case 'rm':
          if (parameters.length > 0) {
            return currentFiles.filter(file => file.name === parameters[0])
          }
          return currentFiles
        default:
          return currentFiles.slice(0, 5) // 默认显示前5个文件
      }
    },

    // 工具方法
    formatSize(size) {
      if (size < 1024) return `${size}B`
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}K`
      if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}M`
      return `${(size / (1024 * 1024 * 1024)).toFixed(1)}G`
    },

    // 生成ls命令输出
    generateLsOutput(targetPath, flags = []) {
      // 确定目标路径
      let pathToList = targetPath || this.currentPath
      
      // 处理相对路径
      if (targetPath && !targetPath.startsWith('/')) {
        if (targetPath === '~') {
          pathToList = '/home/favork'
        } else {
          const currentParts = this.currentPath.split('/').filter(part => part !== '')
          const targetParts = targetPath.split('/').filter(part => part !== '')
          
          for (const part of targetParts) {
            if (part === '..') {
              if (currentParts.length > 0) {
                currentParts.pop()
              }
            } else if (part !== '.') {
              currentParts.push(part)
            }
          }
          
          pathToList = '/' + currentParts.join('/')
        }
      }

      // 获取目录内容
      const pathParts = pathToList.split('/').filter(part => part !== '')
      let current = this.fileSystem['/']
      
      // 导航到目标路径
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return `ls: cannot access '${targetPath || pathToList}': No such file or directory`
        }
      }
      
      if (!current.children) {
        return `ls: cannot access '${targetPath || pathToList}': Not a directory`
      }

      // 获取文件列表
      let fileList = Object.entries(current.children).map(([name, item]) => ({
        name,
        type: item.type,
        size: item.size || 0,
        permissions: item.permissions || (item.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--'),
        modified: item.modified || new Date().toISOString().slice(0, 16).replace('T', ' '),
        owner: item.owner || 'favork',
        group: item.group || 'favork'
      }))

      // 处理标志参数
      const showAll = flags.some(flag => flag === '-a' || flag === '-la' || flag === '-al')
      const showAlmostAll = flags.some(flag => flag === '-A')
      const longFormat = flags.some(flag => flag === '-l' || flag === '-la' || flag === '-al')
      const sortByTime = flags.some(flag => flag === '-t')
      const sortBySize = flags.some(flag => flag === '-S')
      const reverseSort = flags.some(flag => flag === '-r')
      const humanReadable = flags.some(flag => flag === '-h')
      const oneColumn = flags.some(flag => flag === '-1')

      // 添加 . 和 .. 目录（如果使用 -a）
      if (showAll) {
        fileList.unshift(
          { name: '..', type: 'directory', permissions: 'drwxr-xr-x', size: 4096, modified: new Date().toISOString().slice(0, 16).replace('T', ' '), owner: 'favork', group: 'favork' },
          { name: '.', type: 'directory', permissions: 'drwxr-xr-x', size: 4096, modified: new Date().toISOString().slice(0, 16).replace('T', ' '), owner: 'favork', group: 'favork' }
        )
      } else if (showAlmostAll) {
        // -A 显示隐藏文件但不显示 . 和 ..
        // 这里可以添加隐藏文件的逻辑，目前文件系统中没有隐藏文件
      } else {
        // 默认不显示隐藏文件（以.开头的文件）
        fileList = fileList.filter(f => !f.name.startsWith('.'))
      }

      // 排序
      if (sortByTime) {
        fileList.sort((a, b) => new Date(b.modified) - new Date(a.modified))
      } else if (sortBySize) {
        fileList.sort((a, b) => b.size - a.size)
      } else {
        fileList.sort((a, b) => a.name.localeCompare(b.name))
      }

      if (reverseSort) {
        fileList.reverse()
      }

      // 格式化输出
      if (longFormat) {
        const totalBlocks = Math.ceil(fileList.reduce((sum, f) => sum + f.size, 0) / 1024)
        let output = `total ${totalBlocks}\n`
        
        fileList.forEach(file => {
          const permissions = file.permissions
          const links = file.type === 'directory' ? '2' : '1'
          const size = humanReadable ? this.formatSize(file.size) : file.size.toString()
          const date = this.formatDate(file.modified)
          
          output += `${permissions} ${links.padStart(2)} ${file.owner} ${file.group} ${size.padStart(8)} ${date} ${file.name}\n`
        })
        return output.trim()
      }

      // 简单格式
      const names = fileList.map(f => f.name)
      if (names.length === 0) return ''

      if (oneColumn) {
        return names.join('\n')
      }

      // 计算列宽
      const terminalWidth = 80
      const maxNameLength = Math.max(...names.map(n => n.length))
      const columnWidth = maxNameLength + 2
      const columnsPerRow = Math.floor(terminalWidth / columnWidth) || 1

      const rows = []
      for (let i = 0; i < names.length; i += columnsPerRow) {
        const row = names.slice(i, i + columnsPerRow)
        rows.push(row.map(name => name.padEnd(columnWidth)).join('').trim())
      }

      return rows.join('\n')
    },

    // 生成cat命令输出
    generateCatOutput(filename) {
      const content = this.getFileContent(filename)
      if (content === null) {
        return `cat: ${filename}: No such file or directory`
      }
      return content
    },

    // 格式化日期
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 180) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }).replace(',', '')
      }
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      }).replace(',', '')
    },

    // 清除所有缓存
    clearCache() {
      this.pathCache.clear()
      this.contentCache.clear()
      performanceManager.cache.clear()
    }
  }
})