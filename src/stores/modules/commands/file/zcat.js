import { formatHelp } from '../utils/helpFormatter.js'

export const zcat = {
  name: 'zcat',
  description: 'Display contents of compressed files|显示压缩文件内容',
  
  options: [
    // 行为选项组
    {
      flag: '-f',
      longFlag: '--force',
      description: '强制读取文件（即使不是压缩格式）',
      type: 'boolean',
      group: '行为选项'
    },
    
    // 输入参数
    {
      flag: '-x',
      inputKey: 'compressed_files',
      description: '要显示的压缩文件',
      type: 'input',
      placeholder: '压缩文件路径（支持 .gz, .Z, .bz2, .xz 格式，多个文件用空格分隔）',
      required: true
    }
  ],
  
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
    if (args.length === 0) {
      return formatHelp({
        name: 'zcat',
        description: 'Display contents of compressed files|显示压缩文件内容',
        usage: 'zcat [OPTIONS] [FILE...]|zcat [选项] [文件...]',
        options: [
          '-f, --force          Force reading of compressed files|强制读取压缩文件'
        ],
        examples: [
          'zcat file.gz|显示压缩文件内容',
          'zcat file1.gz file2.gz|显示多个压缩文件内容',
          'zcat -f archive.Z|强制显示压缩文件内容',
          'zcat data.bz2|显示bzip2压缩文件内容',
          'zcat log.xz|显示xz压缩文件内容'
        ],
        notes: [
          'Equivalent to gunzip -c|等同于gunzip -c',
          'Output is sent to stdout|输出发送到标准输出',
          'Original files are not modified|原文件不会被修改',
          'Supports .gz, .Z, .bz2, .xz formats|支持 .gz, .Z, .bz2, .xz 格式',
          'File decompression is simulated in this environment|在此环境中文件解压是模拟的'
        ]
      })
    }
    
    const options = {
      force: false
    }
    
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-f' || arg === '--force') {
        options.force = true
      } else if (arg.startsWith('-')) {
        return `zcat: invalid option: ${arg}`
      } else {
        files.push(arg)
      }
    }
    
    if (files.length === 0) {
      return 'zcat: no files specified\nUsage: zcat [OPTIONS] [FILE...]'
    }
    
    const results = []
    
    for (const filename of files) {
      const resolvedPath = resolvePath(filename, currentPath)
      
      if (!resolvedPath.item) {
        results.push(`zcat: ${filename}: No such file or directory`)
        continue
      }
      
      if (resolvedPath.item.type === 'directory') {
        results.push(`zcat: ${filename}: Is a directory`)
        continue
      }
      
      // 检查文件扩展名
      const isCompressed = filename.endsWith('.gz') || 
                          filename.endsWith('.Z') || 
                          filename.endsWith('.bz2') || 
                          filename.endsWith('.xz') ||
                          filename.endsWith('.lz') ||
                          filename.endsWith('.lzma')
      
      if (!isCompressed && !options.force) {
        results.push(`zcat: ${filename}: not in compressed format`)
        continue
      }
      
      // 模拟解压并显示内容
      const content = resolvedPath.item.content || ''
      
      if (isCompressed) {
        // 模拟解压过程 - 在实际实现中这里会进行真正的解压
        let decompressedContent = content
        
        // 根据不同的压缩格式模拟不同的解压结果
        if (filename.endsWith('.gz')) {
          decompressedContent = `# Content from gzip file: ${filename}\n${content}`
        } else if (filename.endsWith('.Z')) {
          decompressedContent = `# Content from compress file: ${filename}\n${content}`
        } else if (filename.endsWith('.bz2')) {
          decompressedContent = `# Content from bzip2 file: ${filename}\n${content}`
        } else if (filename.endsWith('.xz')) {
          decompressedContent = `# Content from xz file: ${filename}\n${content}`
        }
        
        results.push(decompressedContent)
      } else {
        // 如果使用了force选项，直接显示文件内容
        if (options.force) {
          results.push(content)
        }
      }
    }
    
    return results.join('\n')
  }
}