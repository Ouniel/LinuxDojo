import { defineStore } from 'pinia'

export const useFilesystemStore = defineStore('filesystem', {
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
                        content: 'Linux学习笔记\n=============\n\n1. 基本命令\n   - ls: 列出文件\n   - cd: 切换目录\n   - pwd: 显示当前路径\n\n2. 文件操作\n   - cat: 查看文件内容\n   - cp: 复制文件\n   - mv: 移动文件\n   - rm: 删除文件',
                        size: 234,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-15 10:30'
                      },
                      'project.md': {
                        type: 'file',
                        content: '# 项目文档\n\n这是一个Linux学习项目的文档。\n\n## 功能特性\n- 交互式终端\n- 命令自动补全\n- 文件系统模拟',
                        size: 156,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-14 15:20'
                      }
                    },
                    size: 4096,
                    permissions: 'drwxr-xr-x',
                    modified: '2024-01-15 10:30'
                  },
                  'Pictures': {
                    type: 'directory',
                    children: {
                      'screenshot.png': {
                        type: 'file',
                        content: '[Binary PNG file]',
                        size: 2048576,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-13 14:25'
                      }
                    },
                    size: 4096,
                    permissions: 'drwxr-xr-x',
                    modified: '2024-01-14 15:20'
                  },
                  'Downloads': {
                    type: 'directory',
                    children: {
                      'linux-guide.pdf': {
                        type: 'file',
                        content: '[Binary PDF file]',
                        size: 1048576,
                        permissions: '-rw-r--r--',
                        modified: '2024-01-12 09:15'
                      }
                    },
                    size: 4096,
                    permissions: 'drwxr-xr-x',
                    modified: '2024-01-13 09:45'
                  },
                  'config.json': {
                    type: 'file',
                    content: '{\n  "server": {\n    "port": 8080,\n    "host": "localhost",\n    "environment": "development"\n  },\n  "database": {\n    "type": "mysql",\n    "host": "db.linux.local",\n    "port": 3306\n  },\n  "logging": {\n    "level": "info",\n    "file": "/var/log/app.log"\n  }\n}',
                    size: 892,
                    permissions: '-rw-r--r--',
                    modified: '2024-01-12 14:15'
                  },
                  'script.sh': {
                    type: 'file',
                    content: '#!/bin/bash\n\n# Linux系统信息脚本\necho "=== 系统信息 ==="\necho "主机名: $(hostname)"\necho "用户: $(whoami)"\necho "当前目录: $(pwd)"\necho "系统时间: $(date)"\n\necho "\\n=== 磁盘使用情况 ==="\ndf -h\n\necho "\\n=== 内存使用情况 ==="\nfree -h',
                    size: 567,
                    permissions: '-rwxr-xr-x',
                    modified: '2024-01-10 11:20'
                  },
                  'README.md': {
                    type: 'file',
                    content: '# Linux Dojo 学习环境\n\n欢迎来到Linux学习环境！这里提供了一个完整的Linux命令行体验。\n\n## 可用命令\n\n### 文件操作\n- `ls` - 列出目录内容\n- `cat` - 显示文件内容\n- `pwd` - 显示当前目录\n- `cd` - 切换目录\n\n### 系统信息\n- `whoami` - 显示当前用户\n- `uname` - 显示系统信息\n- `date` - 显示日期时间\n- `ps` - 显示进程信息\n\n### 帮助\n- `help` - 显示所有可用命令\n\n开始你的Linux学习之旅吧！',
                    size: 445,
                    permissions: '-rw-r--r--',
                    modified: '2024-01-11 16:30'
                  }
                },
                size: 4096,
                permissions: 'drwxr-xr-x',
                modified: '2024-01-15 12:00'
              }
            },
            size: 4096,
            permissions: 'drwxr-xr-x',
            modified: '2024-01-15 12:00'
          },
          'etc': {
            type: 'directory',
            children: {
              'passwd': {
                type: 'file',
                content: 'root:x:0:0:root:/root:/bin/bash\nfavork:x:1000:1000:favork:/home/favork:/bin/bash',
                size: 89,
                permissions: '-rw-r--r--',
                modified: '2024-01-01 00:00'
              }
            },
            size: 4096,
            permissions: 'drwxr-xr-x',
            modified: '2024-01-01 00:00'
          }
        },
        size: 4096,
        permissions: 'drwxr-xr-x',
        modified: '2024-01-01 00:00'
      }
    },
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
      return Object.entries(current.children).map(([name, item]) => ({
        name,
        type: item.type,
        size: item.size,
        permissions: item.permissions,
        modified: item.modified
      }))
    }
  },

  actions: {
    changeDirectory(newPath) {
      console.log('filesystem changeDirectory called with:', newPath)
      console.log('Current filesystem path:', this.currentPath)
      
      // 处理特殊路径
      if (newPath === '~' || newPath === '/home/favork' || newPath === '') {
        this.currentPath = '/home/favork'
        console.log('Changed to home directory')
        return true
      }
      
      // 处理相对路径
      let targetPath = newPath
      if (!newPath.startsWith('/')) {
        // 相对路径，基于当前路径构建
        if (newPath === '..') {
          // 返回上级目录
          const currentParts = this.currentPath.split('/').filter(part => part !== '')
          if (currentParts.length <= 2) {
            // 已经在 /home/favork，不能再往上（模拟权限限制）
            console.log('Already at home directory, cannot go up')
            return false
          }
          currentParts.pop()
          targetPath = '/' + currentParts.join('/')
        } else {
          // 普通相对路径 - 支持大小写不敏感匹配
          const basePath = this.currentPath === '/home/favork' ? '/home/favork' : this.currentPath
          
          // 获取当前目录的子目录，进行大小写不敏感匹配
          const currentFiles = this.getCurrentDirectoryContents
          const matchingDir = currentFiles.find(file => 
            file.type === 'directory' && file.name.toLowerCase() === newPath.toLowerCase()
          )
          
          if (matchingDir) {
            targetPath = `${basePath}/${matchingDir.name}` // 使用实际的目录名
          } else {
            targetPath = `${basePath}/${newPath}`
          }
        }
      }
      
      console.log('Target path resolved to:', targetPath)
      
      // 验证路径是否存在
      const pathParts = targetPath.split('/').filter(part => part !== '')
      console.log('Path parts to validate:', pathParts)
      
      let current = this.fileSystem['/']
      console.log('Starting from root:', Object.keys(current.children || {}))
      
      for (const part of pathParts) {
        console.log('Checking part:', part)
        console.log('Available children:', Object.keys(current.children || {}))
        
        if (current.children && current.children[part] && current.children[part].type === 'directory') {
          current = current.children[part]
          console.log('Successfully navigated to:', part)
        } else {
          console.log('Failed to find directory:', part)
          return false // 路径不存在
        }
      }
      
      this.currentPath = targetPath
      console.log('Successfully changed directory to:', targetPath)
      return true
    },
    // 获取相对路径显示（用于终端提示符）
    getDisplayPath() {
      if (this.currentPath === '/home/favork') {
        return '~'
      }
      return this.currentPath.replace('/home/favork', '~')
    },

    getFileContent(filename) {
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
        return current.children[filename].content
      }
      
      return null
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
          return currentFiles.filter(file => file.type === 'file')
        case 'cd':
          return currentFiles.filter(file => file.type === 'directory')
        case 'grep':
          return currentFiles.filter(file => file.type === 'file' && 
            (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')))
        case 'find':
          return currentFiles
        default:
          return currentFiles.slice(0, 5) // 默认显示前5个文件
      }
    }
  }
})