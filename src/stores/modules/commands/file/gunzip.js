import { formatHelp } from '../utils/helpFormatter.js'

export const gunzip = {
  name: 'gunzip',
  description: 'Decompress gzip files|解压gzip文件',
  
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
      force: false,
      keep: false,
      list: false,
      quiet: false,
      recursive: false,
      test: false,
      verbose: false
    }
    
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-f' || arg === '--force') {
        options.force = true
      } else if (arg === '-k' || arg === '--keep') {
        options.keep = true
      } else if (arg === '-l' || arg === '--list') {
        options.list = true
      } else if (arg === '-q' || arg === '--quiet') {
        options.quiet = true
      } else if (arg === '-r' || arg === '--recursive') {
        options.recursive = true
      } else if (arg === '-t' || arg === '--test') {
        options.test = true
      } else if (arg === '-v' || arg === '--verbose') {
        options.verbose = true
      } else if (arg === '--help') {
        return formatHelp({
          name: 'gunzip',
          description: 'Decompress gzip files|解压gzip文件',
          usage: 'gunzip [OPTIONS] [FILE...]|gunzip [选项] [文件...]',
          options: [
            '-f, --force          Force overwrite of output files|强制覆盖输出文件',
            '-k, --keep           Keep input files|保留输入文件',
            '-l, --list           List compressed file contents|列出压缩文件内容',
            '-q, --quiet          Suppress all warnings|抑制所有警告',
            '-r, --recursive      Operate recursively on directories|递归操作目录',
            '-t, --test           Test compressed file integrity|测试压缩文件完整性',
            '-v, --verbose        Verbose mode|详细模式',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'gunzip file.gz|解压文件',
            'gunzip -k archive.gz|解压并保留原文件',
            'gunzip -l file.gz|列出压缩文件信息'
          ],
          notes: [
            'Files are decompressed in place by default|默认就地解压文件',
            'Original .gz files are removed unless -k is used|除非使用-k，否则删除原始.gz文件'
          ]
        })
      } else if (!arg.startsWith('-')) {
        files.push(arg)
      }
    }
    
    if (files.length === 0) {
      return 'gunzip: no files specified\nUsage: gunzip [OPTIONS] [FILE...]'
    }
    
    const results = []
    
    for (const filename of files) {
      const resolvedPath = resolvePath(filename, currentPath)
      
      if (!resolvedPath.item) {
        if (!options.quiet) {
          results.push(`gunzip: ${filename}: No such file or directory`)
        }
        continue
      }
      
      if (resolvedPath.item.type === 'directory') {
        if (options.recursive) {
          if (!options.quiet) {
            results.push(`gunzip: ${filename}: is a directory -- ignored`)
          }
        } else {
          if (!options.quiet) {
            results.push(`gunzip: ${filename}: is a directory`)
          }
        }
        continue
      }
      
      // 检查文件扩展名
      if (!filename.endsWith('.gz')) {
        if (!options.quiet) {
          results.push(`gunzip: ${filename}: unknown suffix -- ignored`)
        }
        continue
      }
      
      if (options.list) {
        // 列出压缩文件信息
        const content = resolvedPath.item.content || ''
        const compressedSize = content.length
        const uncompressedSize = Math.floor(compressedSize * 2.5) // 模拟解压后大小
        const ratio = Math.floor((1 - compressedSize / uncompressedSize) * 100)
        const date = resolvedPath.item.mtime || new Date()
        
        if (results.length === 0) {
          results.push('         compressed        uncompressed  ratio uncompressed_name')
        }
        
        results.push(`${compressedSize.toString().padStart(19)} ${uncompressedSize.toString().padStart(19)} ${ratio.toString().padStart(5)}% ${filename.replace('.gz', '')}`)
        continue
      }
      
      if (options.test) {
        // 测试文件完整性
        if (options.verbose) {
          results.push(`${filename}:\tOK`)
        }
        continue
      }
      
      // 执行解压操作
      const outputName = filename.replace('.gz', '')
      const outputPath = resolvePath(outputName, currentPath)
      
      // 检查输出文件是否已存在
      if (outputPath.item && !options.force) {
        if (!options.quiet) {
          results.push(`gunzip: ${outputName}: already exists; not overwritten`)
        }
        continue
      }
      
      // 模拟解压过程
      const decompressedContent = `# Decompressed content from ${filename}\n${resolvedPath.item.content || ''}`
      
      // 创建解压后的文件
      const parentPath = resolvedPath.path.slice(0, -1)
      let parent = fileSystem
      for (const segment of parentPath) {
        parent = parent[segment].children
      }
      
      parent[outputName.split('/').pop()] = {
        type: 'file',
        content: decompressedContent,
        permissions: 'rw-r--r--',
        owner: resolvedPath.item.owner || 'user',
        group: resolvedPath.item.group || 'users',
        size: decompressedContent.length,
        mtime: new Date(),
        atime: new Date(),
        ctime: new Date()
      }
      
      if (options.verbose) {
        results.push(`${filename}:\t${Math.floor(resolvedPath.item.content.length * 0.4 * 100)}% -- replaced with ${outputName}`)
      }
      
      // 删除原文件（除非使用-k选项）
      if (!options.keep) {
        delete parent[filename.split('/').pop()]
      }
    }
    
    return results.join('\n')
  }
}