import { formatHelp } from '../utils/helpFormatter.js'

export const stat = {
  options: [
    {
      flag: '-c',
      longFlag: '--format',
      description: 'Use specified format|使用指定格式',
      type: 'string',
      placeholder: 'FORMAT'
    },
    {
      flag: '-t',
      longFlag: '--terse',
      description: 'Print information in terse form|以简洁形式打印信息',
      type: 'boolean'
    },
    {
      flag: '-L',
      longFlag: '--dereference',
      description: 'Follow links|跟随链接',
      type: 'boolean'
    }
  ],
  name: 'stat',
  description: 'Display file or file system status|显示文件或文件系统状态',
  category: 'basic',
  requiresArgs: true,
  examples: [
    'stat file.txt',
    'stat -t file.txt',
    'stat -c "%n %s" file.txt',
    'stat -L symlink'
  ],
  help: `Usage: stat [OPTION]... FILE...|用法: stat [选项]... 文件...
Display file or file system status.|显示文件或文件系统状态。

  -c, --format=FORMAT   use the specified FORMAT instead of the default|使用指定格式而不是默认格式
  -t, --terse           print the information in terse form|以简洁形式打印信息
  -L, --dereference     follow links|跟随链接
      --help            display this help and exit|显示此帮助信息并退出

Format sequences:|格式序列：
  %n   file name|文件名
  %s   total size, in bytes|总大小（字节）
  %f   raw mode in hex|原始模式（十六进制）
  %F   file type|文件类型
  %a   access rights in octal|访问权限（八进制）
  %A   access rights in human readable form|人类可读的访问权限
  %u   user ID of owner|所有者用户ID
  %g   group ID of owner|所有者组ID

Examples|示例:
  stat file.txt         Show file status|显示文件状态
  stat -t file.txt      Terse format|简洁格式
  stat -c "%n %s" file.txt  Custom format|自定义格式`,
  
  handler(args, context, fs) {
    const { currentPath } = context
    const fileSystem = fs.fileSystem || fs
    
    // 简化的路径解析函数
    const resolvePath = (filename, basePath) => {
      const pathParts = basePath.split('/').filter(part => part !== '')
      let current = fileSystem['/']
      
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return { item: null }
        }
      }
      
      if (current.children && current.children[filename]) {
        return { item: current.children[filename] }
      }
      
      return { item: null }
    }
    const options = {
      format: null,
      terse: false,
      dereference: true
    }
    
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-c' || arg === '--format') {
        options.format = args[++i]
      } else if (arg === '-t' || arg === '--terse') {
        options.terse = true
      } else if (arg === '-L' || arg === '--dereference') {
        options.dereference = true
      } else if (arg === '--help') {
        return formatHelp({
          name: 'stat',
          description: 'Display file or file system status|显示文件或文件系统状态',
          usage: 'stat [OPTIONS] FILE...|stat [选项] 文件...',
          options: [
            '-c, --format=FORMAT  Use specified format|使用指定格式',
            '-t, --terse          Print information in terse form|以简洁形式打印信息',
            '-L, --dereference    Follow links|跟随链接',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'stat file.txt|显示文件状态',
            'stat -t file.txt|简洁格式显示',
            'stat -c "%n %s" file.txt|自定义格式显示'
          ],
          notes: [
            'Format sequences:|格式序列：',
            '%n - file name|文件名',
            '%s - total size, in bytes|总大小（字节）',
            '%f - raw mode in hex|原始模式（十六进制）',
            '%F - file type|文件类型',
            '%a - access rights in octal|访问权限（八进制）',
            '%A - access rights in human readable form|人类可读的访问权限',
            '%u - user ID of owner|所有者用户ID',
            '%g - group ID of owner|所有者组ID'
          ]
        })
      } else if (!arg.startsWith('-')) {
        files.push(arg)
      }
    }
    
    if (files.length === 0) {
      return 'stat: missing file operand\nUsage: stat [OPTIONS] FILE...'
    }
    
    const results = []
    
    for (const filename of files) {
      const resolvedPath = resolvePath(filename, currentPath)
      const item = resolvedPath.item
      
      if (!item) {
        results.push(`stat: cannot stat '${filename}': No such file or directory`)
        continue
      }
      
      // 获取文件信息
      const now = new Date()
      const fileInfo = {
        name: filename,
        size: item.content ? item.content.length : (item.type === 'directory' ? 4096 : 0),
        type: item.type === 'directory' ? 'directory' : 'regular file',
        mode: item.permissions || 'rw-r--r--',
        uid: item.owner || 1000,
        gid: item.group || 1000,
        atime: item.atime || now,
        mtime: item.mtime || now,
        ctime: item.ctime || now
      }
      
      if (options.format) {
        // 自定义格式输出
        let output = options.format
        output = output.replace(/%n/g, fileInfo.name)
        output = output.replace(/%s/g, fileInfo.size.toString())
        output = output.replace(/%F/g, fileInfo.type)
        output = output.replace(/%f/g, '0x' + parseInt('644', 8).toString(16))
        output = output.replace(/%a/g, '644')
        output = output.replace(/%A/g, fileInfo.mode)
        output = output.replace(/%u/g, fileInfo.uid.toString())
        output = output.replace(/%g/g, fileInfo.gid.toString())
        results.push(output)
      } else if (options.terse) {
        // 简洁格式输出
        results.push(`${fileInfo.name} ${fileInfo.size} 0 644 ${fileInfo.uid} ${fileInfo.gid} 0 0 0 0 ${Math.floor(fileInfo.mtime.getTime() / 1000)} ${Math.floor(fileInfo.atime.getTime() / 1000)} ${Math.floor(fileInfo.ctime.getTime() / 1000)} 0 4096`)
      } else {
        // 标准格式输出
        const output = [
          `  File: ${fileInfo.name}`,
          `  Size: ${fileInfo.size}\t\tBlocks: ${Math.ceil(fileInfo.size / 512)}\t\tIO Block: 4096   ${fileInfo.type}`,
          `Device: 801h/2049d\tInode: 123456\t\tLinks: 1`,
          `Access: (0644/${fileInfo.mode})\t\tUid: (${fileInfo.uid}/user)\t\tGid: (${fileInfo.gid}/group)`,
          `Access: ${fileInfo.atime.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' +0000')}`,
          `Modify: ${fileInfo.mtime.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' +0000')}`,
          `Change: ${fileInfo.ctime.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' +0000')}`,
          ` Birth: -`
        ].join('\n')
        results.push(output)
      }
    }
    
    return results.join('\n')
  }
}