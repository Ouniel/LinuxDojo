import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFilesystemStore = defineStore('filesystem', () => {
    const currentScenario = ref('web_project')
    const currentPath = ref('/home/user/projects/webapp') // 使用web_project场景的默认路径

    // ⚠️ 重要声明：以下所有文件系统数据都是模拟数据，用于教学目的
    // 不会进行任何真实的文件系统操作
    const scenarios = ref({
        web_project: {
            name: 'Web项目目录',
            description: '典型的Web开发项目目录结构',
            currentPath: '/home/user/projects/webapp',
            filesystem: {
                '/': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4096',
                    modified: '2024-01-10 08:00'
                },
                '/home': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4096',
                    modified: '2024-01-10 07:30'
                },
                '/home/user': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    size: '4096',
                    modified: '2024-01-10 08:30'
                },
                '/home/user/projects': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    size: '4096',
                    modified: '2024-01-10 08:15'
                },
                '/home/user/projects/webapp': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    size: '4096',
                    modified: '2024-01-10 09:20'
                },
                '/home/user/projects/webapp/index.html': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: '2.3K',
                    modified: '2024-01-10 09:15',
                    content: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <title>我的Web应用</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1>欢迎使用我的Web应用</h1>\n    <p>这是一个示例页面</p>\n    <script src="script.js"></script>\n</body>\n</html>'
                },
                '/home/user/projects/webapp/style.css': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: '1.8K',
                    modified: '2024-01-10 09:10',
                    content: 'body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f5f5f5;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}\n\np {\n    color: #666;\n    line-height: 1.6;\n}'
                },
                '/home/user/projects/webapp/script.js': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: '856B',
                    modified: '2024-01-10 09:05',
                    content: 'document.addEventListener("DOMContentLoaded", function() {\n    console.log("页面加载完成");\n    \n    const h1 = document.querySelector("h1");\n    h1.addEventListener("click", function() {\n        alert("欢迎学习Linux命令！");\n    });\n});'
                },
                '/home/user/projects/webapp/package.json': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: '643B',
                    modified: '2024-01-09 15:30',
                    content: '{\n  "name": "my-webapp",\n  "version": "1.0.0",\n  "description": "示例Web应用",\n  "main": "index.html",\n  "scripts": {\n    "start": "live-server",\n    "build": "webpack --mode=production"\n  },\n  "author": "user",\n  "license": "MIT"\n}'
                },
                '/home/user/projects/webapp/.env': {
                    type: 'file',
                    permissions: '-rw-------',
                    owner: 'user',
                    group: 'user',
                    size: '128B',
                    modified: '2024-01-08 14:20',
                    content: 'DATABASE_URL=postgresql://localhost:5432/myapp\nAPI_KEY=sk-1234567890abcdef\nDEBUG=true\nPORT=3000'
                },
                '/home/user/documents': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    size: '4096',
                    modified: '2024-01-10 07:45'
                },
                '/home/user/documents/report.txt': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: '1.2K',
                    modified: '2024-01-10 08:00',
                    content: 'Linux学习报告\n===============\n\n1. 基础命令掌握情况\n- ls: 已掌握基本用法\n- cd: 熟练使用\n- pwd: 理解工作目录概念\n\n2. 文件操作\n- cp, mv: 基本操作无问题\n- rm: 需要注意安全使用\n\n3. 下一步学习计划\n- 掌握文本处理命令\n- 学习管道和重定向\n- 练习权限管理'
                },
                '/home/user/documents/data.csv': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: '45K',
                    modified: '2024-01-09 14:20',
                    content: 'ID,姓名,年龄,城市,职业\n1,张三,25,北京,程序员\n2,李四,30,上海,设计师\n3,王五,28,广州,产品经理\n4,赵六,32,深圳,测试工程师\n5,陈七,27,杭州,运维工程师'
                },
                '/home/user/logs': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    size: '4096',
                    modified: '2024-01-10 09:00'
                },
                '/home/user/logs/access.log': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: '890K',
                    modified: '2024-01-10 09:30',
                    content: '192.168.1.100 - - [10/Jan/2024:08:15:32 +0000] "GET /index.html HTTP/1.1" 200 1234\n192.168.1.101 - - [10/Jan/2024:08:16:45 +0000] "POST /api/login HTTP/1.1" 403 567\n10.0.0.50 - - [10/Jan/2024:08:17:12 +0000] "GET /images/logo.png HTTP/1.1" 404 234\n192.168.1.102 - - [10/Jan/2024:08:18:33 +0000] "GET /api/users HTTP/1.1" 200 2048\n192.168.1.103 - - [10/Jan/2024:08:19:44 +0000] "PUT /api/users/123 HTTP/1.1" 500 128'
                },
                '/home/user/logs/error.log': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: '23K',
                    modified: '2024-01-10 09:25',
                    content: '[ERROR] 2024-01-10 08:15:00: Database connection failed - Connection timeout\n[WARN] 2024-01-10 08:16:30: High memory usage detected: 85%\n[ERROR] 2024-01-10 08:17:45: File not found: /var/www/missing.php\n[INFO] 2024-01-10 08:18:12: User login successful: user123\n[ERROR] 2024-01-10 08:19:33: API rate limit exceeded for IP: 192.168.1.105'
                }
            }
        },
        system_admin: {
            name: '系统管理场景',
            description: '系统管理员日常工作环境',
            currentPath: '/var/log',
            filesystem: {
                '/': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4096',
                    modified: '2024-01-10 06:00'
                },
                '/var': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4096',
                    modified: '2024-01-10 06:30'
                },
                '/var/log': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4096',
                    modified: '2024-01-10 09:45'
                },
                '/var/log/syslog': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'syslog',
                    group: 'adm',
                    size: '2.3M',
                    modified: '2024-01-10 09:45',
                    content: 'Jan 10 08:00:01 server01 systemd[1]: Started Daily apt download activities.\nJan 10 08:15:22 server01 sshd[1234]: Accepted publickey for admin from 192.168.1.10\nJan 10 08:30:45 server01 kernel: [12345.678901] CPU0: Core temperature above threshold\nJan 10 08:45:12 server01 nginx[5678]: 192.168.1.100 "GET /api/status HTTP/1.1" 200\nJan 10 09:00:33 server01 cron[9012]: (CRON) INFO (pidfile fd = 3)'
                },
                '/var/log/auth.log': {
                    type: 'file',
                    permissions: '-rw-r-----',
                    owner: 'syslog',
                    group: 'adm',
                    size: '156K',
                    modified: '2024-01-10 09:40',
                    content: 'Jan 10 08:15:22 server01 sshd[1234]: Accepted publickey for admin from 192.168.1.10 port 52341 ssh2: RSA SHA256:abc123\nJan 10 08:16:01 server01 sudo: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/systemctl status nginx\nJan 10 08:20:15 server01 sshd[1235]: Connection closed by 192.168.1.10 port 52341\nJan 10 08:25:33 server01 su[1236]: Successful su for root by admin\nJan 10 08:30:44 server01 sshd[1237]: Failed password for user from 10.0.0.100 port 45123'
                },
                '/var/log/nginx': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'www-data',
                    group: 'adm',
                    size: '4096',
                    modified: '2024-01-10 09:30'
                },
                '/var/log/nginx/access.log': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'www-data',
                    group: 'adm',
                    size: '1.8M',
                    modified: '2024-01-10 09:45',
                    content: '192.168.1.100 - - [10/Jan/2024:08:00:12 +0000] "GET / HTTP/1.1" 200 1024 "-" "Mozilla/5.0"\n192.168.1.101 - - [10/Jan/2024:08:01:33 +0000] "POST /api/login HTTP/1.1" 200 256 "https://example.com/login" "curl/7.68.0"\n10.0.0.50 - - [10/Jan/2024:08:02:44 +0000] "GET /static/css/main.css HTTP/1.1" 200 4096 "https://example.com/" "Mozilla/5.0"'
                },
                '/etc': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4096',
                    modified: '2024-01-09 10:00'
                },
                '/etc/hosts': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: '220B',
                    modified: '2024-01-08 15:30',
                    content: '127.0.0.1\tlocalhost\n127.0.1.1\tserver01\n\n# 内网服务器\n192.168.1.10\twebserver.local\n192.168.1.20\tdatabase.local\n192.168.1.30\tcache.local\n\n::1\tip6-localhost ip6-loopback'
                },
                '/etc/nginx': {
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: '4096',
                    modified: '2024-01-09 12:00'
                },
                '/etc/nginx/nginx.conf': {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: '2.1K',
                    modified: '2024-01-09 12:00',
                    content: 'user www-data;\nworker_processes auto;\npid /run/nginx.pid;\n\nevents {\n    worker_connections 768;\n}\n\nhttp {\n    sendfile on;\n    tcp_nopush on;\n    types_hash_max_size 2048;\n    \n    include /etc/nginx/mime.types;\n    default_type application/octet-stream;\n    \n    access_log /var/log/nginx/access.log;\n    error_log /var/log/nginx/error.log;\n    \n    gzip on;\n    \n    include /etc/nginx/conf.d/*.conf;\n    include /etc/nginx/sites-enabled/*;\n}'
                }
            }
        }
    })

    // 获取当前场景的文件系统
    const currentFilesystem = computed(() => {
        return scenarios.value[currentScenario.value]
    })

    // 切换场景
    const setScenario = (scenarioId) => {
        if (scenarios.value[scenarioId]) {
            currentScenario.value = scenarioId
            currentPath.value = scenarios.value[scenarioId].currentPath
        }
    }

    // 设置当前路径
    const setCurrentPath = (path) => {
        currentPath.value = path
    }

    // 生成ls命令输出
    const generateLsOutput = (path, params = []) => {
        const fs = currentFilesystem.value.filesystem
        const targetPath = path || currentPath.value

        // 检查路径是否存在
        if (!fs[targetPath]) {
            return `ls: 无法访问 '${targetPath}': 没有那个文件或目录`
        }

        // 如果是文件，直接显示文件名
        if (fs[targetPath].type === 'file') {
            if (params.includes('-l')) {
                const file = fs[targetPath]
                return `${file.permissions} 1 ${file.owner} ${file.group} ${file.size} ${file.modified} ${path.split('/').pop()}`
            }
            return path.split('/').pop()
        }

        // 如果是目录，列出内容
        const files = []
        const showHidden = params.includes('-a') || params.includes('-A')
        const showLong = params.includes('-l')
        const humanReadable = params.includes('-h')
        const showInode = params.includes('-i')
        const classify = params.includes('-F')

        // 添加 . 和 .. (如果使用 -a 参数)
        if (params.includes('-a')) {
            files.push('.', '..')
        }

        // 查找子目录和文件
        for (const [filePath, fileInfo] of Object.entries(fs)) {
            if (filePath.startsWith(targetPath + '/') &&
                filePath !== targetPath &&
                !filePath.substring(targetPath.length + 1).includes('/')) {

                const fileName = filePath.split('/').pop()

                // 处理隐藏文件
                if (fileName.startsWith('.') && !showHidden) {
                    continue
                }

                files.push(fileName)
            }
        }

        if (files.length === 0) {
            return '' // 空目录
        }

        // 排序
        if (params.includes('-t')) {
            // 按时间排序 (这里简化处理)
            files.sort()
        } else if (params.includes('-S')) {
            // 按大小排序 (这里简化处理)
            files.sort()
        } else {
            files.sort()
        }

        if (params.includes('-r')) {
            files.reverse()
        }

        // 格式化输出
        if (showLong) {
            const output = []
            if (files.length > 2 || !files.includes('.')) {
                output.push(`总计 ${Math.floor(files.length * 4)}`)
            }

            for (const fileName of files) {
                if (fileName === '.' || fileName === '..') {
                    continue
                }

                const fullPath = `${targetPath}/${fileName}`
                const fileInfo = fs[fullPath] || {
                    type: 'file',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: '1024',
                    modified: '2024-01-10 08:00'
                }

                let size = fileInfo.size
                if (humanReadable && size.match(/^\d+$/)) {
                    const bytes = parseInt(size)
                    if (bytes > 1024 * 1024) {
                        size = `${(bytes / (1024 * 1024)).toFixed(1)}M`
                    } else if (bytes > 1024) {
                        size = `${(bytes / 1024).toFixed(1)}K`
                    }
                }

                let line = `${fileInfo.permissions} 1 ${fileInfo.owner} ${fileInfo.group} ${size.padStart(8)} ${fileInfo.modified} ${fileName}`

                if (showInode) {
                    line = `${Math.floor(Math.random() * 100000).toString().padStart(8)} ${line}`
                }

                if (classify) {
                    if (fileInfo.type === 'directory') {
                        line += '/'
                    } else if (fileInfo.permissions.includes('x')) {
                        line += '*'
                    }
                }

                output.push(line)
            }
            return output.join('\n')
        } else {
            // 简单格式
            let result = files.filter(f => f !== '.' && f !== '..').join('  ')

            if (classify) {
                result = result.split('  ').map(fileName => {
                    const fullPath = `${targetPath}/${fileName}`
                    const fileInfo = fs[fullPath]
                    if (fileInfo && fileInfo.type === 'directory') {
                        return fileName + '/'
                    }
                    return fileName
                }).join('  ')
            }

            return result
        }
    }

    // 生成cat命令输出
    const generateCatOutput = (filePath) => {
        const fs = currentFilesystem.value.filesystem

        // 处理相对路径和绝对路径
        let fullPath
        if (filePath.startsWith('/')) {
            // 绝对路径
            fullPath = filePath
        } else {
            // 相对路径，需要结合当前路径
            fullPath = currentPath.value === '/' ? `/${filePath}` : `${currentPath.value}/${filePath}`
        }

        console.log('Cat查找文件:', {
            inputPath: filePath,
            currentPath: currentPath.value,
            fullPath: fullPath,
            fileExists: !!fs[fullPath]
        })

        if (!fs[fullPath]) {
            return `cat: ${filePath}: 没有那个文件或目录`
        }

        if (fs[fullPath].type === 'directory') {
            return `cat: ${filePath}: 是一个目录`
        }

        return fs[fullPath].content || `cat: ${filePath}: 文件内容为空`
    }

    // 生成find命令输出
    const generateFindOutput = (searchPath, params = []) => {
        const fs = currentFilesystem.value.filesystem

        // 确保搜索路径是绝对路径
        let fullSearchPath
        if (searchPath && searchPath.startsWith('/')) {
            fullSearchPath = searchPath
        } else if (searchPath && searchPath !== '.') {
            fullSearchPath = currentPath.value === '/' ? `/${searchPath}` : `${currentPath.value}/${searchPath}`
        } else {
            fullSearchPath = currentPath.value
        }

        console.log('Find搜索:', {
            inputPath: searchPath,
            currentPath: currentPath.value,
            fullSearchPath: fullSearchPath,
            params: params
        })

        // 解析参数
        const criteria = {}
        params.forEach(param => {
            const parts = param.split(' ')
            const flag = parts[0]
            const value = parts.slice(1).join(' ')

            switch (flag) {
                case '-name':
                case '-iname':
                    criteria.namePattern = value
                    criteria.caseSensitive = flag === '-name'
                    break
                case '-type':
                    criteria.fileType = value
                    break
                case '-size':
                    criteria.size = value
                    break
                case '-mtime':
                    criteria.mtime = parseInt(value)
                    break
                case '-atime':
                    criteria.atime = parseInt(value)
                    break
                case '-user':
                    criteria.owner = value
                    break
                case '-perm':
                    criteria.permissions = value
                    break
                case '-empty':
                    criteria.empty = true
                    break
                case '-maxdepth':
                    criteria.maxDepth = parseInt(value)
                    break
                case '-mindepth':
                    criteria.minDepth = parseInt(value)
                    break
            }
        })

        // ⚠️ 模拟数据说明：以下所有搜索结果都是预设的模拟数据
        const results = []

        // 遍历文件系统查找匹配项
        for (const [path, info] of Object.entries(fs)) {
            // 检查路径是否在搜索范围内
            if (!path.startsWith(fullSearchPath)) continue

            // 计算相对深度
            const relativePath = path.substring(fullSearchPath.length)
            const depth = relativePath.split('/').filter(p => p).length

            // 检查深度限制
            if (criteria.maxDepth && depth > criteria.maxDepth) continue
            if (criteria.minDepth && depth < criteria.minDepth) continue

            // 检查文件名模式
            if (criteria.namePattern) {
                const fileName = path.split('/').pop()
                const pattern = criteria.namePattern.replace(/\*/g, '.*').replace(/\?/g, '.')
                const regex = new RegExp(pattern, criteria.caseSensitive ? '' : 'i')
                if (!regex.test(fileName)) continue
            }

            // 检查文件类型
            if (criteria.fileType) {
                if (criteria.fileType === 'f' && info.type !== 'file') continue
                if (criteria.fileType === 'd' && info.type !== 'directory') continue
                if (criteria.fileType === 'l' && info.type !== 'symlink') continue
            }

            // 检查空文件/目录
            if (criteria.empty) {
                if (info.type === 'file' && info.size !== '0') continue
                if (info.type === 'directory' && info.size !== '0') continue
            }

            // 检查大小条件
            if (criteria.size) {
                const sizeMatch = criteria.size.match(/^([+-]?)(\d+)([ckMG]?)$/)
                if (sizeMatch) {
                    const operator = sizeMatch[1] || '='
                    const value = parseInt(sizeMatch[2])
                    const unit = sizeMatch[3] || 'c'

                    // 转换文件大小为字节
                    let fileSize = parseInt(info.size) || 0
                    let targetSize = value

                    if (unit === 'k') targetSize *= 1024
                    else if (unit === 'M') targetSize *= 1024 * 1024
                    else if (unit === 'G') targetSize *= 1024 * 1024 * 1024

                    if (operator === '+' && fileSize <= targetSize) continue
                    if (operator === '-' && fileSize >= targetSize) continue
                    if (operator === '=' && fileSize !== targetSize) continue
                }
            }

            // 检查所有者
            if (criteria.owner && info.owner !== criteria.owner) continue

            // 如果所有条件都满足，添加到结果中
            results.push(path)
        }

        // 如果没有找到结果
        if (results.length === 0) {
            return `find: '${searchPath || '.'}': 没有找到匹配的文件`
        }

        // 返回搜索结果
        return results.join('\n')
    }

    // 初始化函数，确保路径与场景同步
    const initializeStore = () => {
        if (scenarios.value[currentScenario.value]) {
            currentPath.value = scenarios.value[currentScenario.value].currentPath
        }
    }

    // 立即初始化
    initializeStore()

    return {
        currentPath,
        currentScenario,
        scenarios,
        currentFilesystem,
        setScenario,
        setCurrentPath,
        generateLsOutput,
        generateCatOutput,
        generateFindOutput,
        initializeStore
    }
}) 