/**
 * compress 命令实现
 * 压缩文件
 */

export const compress = {
  name: 'compress',
  description: 'Compress files using Lempel-Ziv coding|使用Lempel-Ziv编码压缩文件',
  category: 'file',
  options: [
    // 基本操作
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Verbose mode, print compression statistics|详细模式，打印压缩统计信息',
      group: 'output'
    },
    {
      name: '-f',
      flag: '-f',
      type: 'boolean',
      description: 'Force compression even if file doesn\'t shrink|强制压缩，即使文件没有缩小',
      group: 'behavior'
    },
    {
      name: '-c',
      flag: '-c',
      type: 'boolean',
      description: 'Write output to stdout instead of replacing files|将输出写入标准输出而不是替换文件',
      group: 'output'
    },
    // 压缩设置
    {
      name: '-b',
      flag: '-b',
      type: 'input',
      inputKey: 'bits',
      description: 'Specify maximum bits/code (9-16, default 16)|指定最大位数/代码（9-16，默认16）',
      placeholder: '16',
      group: 'compression'
    },
    // 帮助
    {
      name: '--help',
      flag: '--help',
      type: 'boolean',
      description: 'Show help information|显示帮助信息',
      group: 'help'
    }
  ],
  
  async handler(args, context, fs) {
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
    try {
      if (args.length === 0) {
        return {
          output: 'compress: missing file operand|compress: 缺少文件操作数',
          exitCode: 1
        }
      }
      
      // 解析选项
      let verbose = false
      let force = false
      let bits = 16
      let files = []
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-v') {
          verbose = true
        } else if (arg === '-f') {
          force = true
        } else if (arg === '-c') {
          // 写入标准输出
          verbose = true
        } else if (arg.startsWith('-b')) {
          const bitsStr = arg.substring(2) || args[++i]
          bits = parseInt(bitsStr)
          if (isNaN(bits) || bits < 9 || bits > 16) {
            return {
              output: 'compress: invalid bits value (must be 9-16)|compress: 无效的位数值（必须是9-16）',
              exitCode: 1
            }
          }
        } else if (arg === '--help') {
          return {
            output: this.help.zh,
            exitCode: 0
          }
        } else if (arg.startsWith('-')) {
          return {
            output: `compress: invalid option: ${arg}|compress: 无效选项: ${arg}`,
            exitCode: 1
          }
        } else {
          files.push(arg)
        }
      }
      
      if (files.length === 0) {
        return {
          output: 'compress: no files specified|compress: 未指定文件',
          exitCode: 1
        }
      }
      
      const results = []
      
      for (const file of files) {
        const result = this.compressFile(file, { verbose, force, bits })
        results.push(result)
      }
      
      return {
        output: results.join('\n'),
        exitCode: 0
      }
      
    } catch (error) {
      return {
        output: `compress: ${error.message}`,
        exitCode: 1
      }
    }
  },
  
  compressFile(filename, options) {
    const { verbose, force, bits } = options
    const results = []
    
    // 模拟文件大小
    const originalSize = Math.floor(Math.random() * 10000) + 1000
    const compressionRatio = 0.3 + Math.random() * 0.4 // 30-70% compression
    const compressedSize = Math.floor(originalSize * compressionRatio)
    const savings = originalSize - compressedSize
    const percentage = ((savings / originalSize) * 100).toFixed(1)
    
    // 检查文件是否已经是压缩格式
    if (filename.endsWith('.Z')) {
      if (!force) {
        results.push(`compress: ${filename} already has .Z suffix -- no change|compress: ${filename} 已有.Z后缀 -- 无变化`)
        return results.join('\n')
      }
    }
    
    const outputFile = filename.endsWith('.Z') ? filename : `${filename}.Z`
    
    if (verbose) {
      results.push(`Compressing ${filename}...|正在压缩 ${filename}...`)
      results.push(`Using ${bits}-bit compression|使用${bits}位压缩`)
    }
    
    // 模拟压缩过程
    results.push(`${filename}: Compression: ${percentage}% -- replaced with ${outputFile}`)
    results.push(`${filename}: 压缩率: ${percentage}% -- 替换为 ${outputFile}`)
    
    if (verbose) {
      results.push(`Original size: ${originalSize} bytes|原始大小: ${originalSize} 字节`)
      results.push(`Compressed size: ${compressedSize} bytes|压缩后大小: ${compressedSize} 字节`)
      results.push(`Space saved: ${savings} bytes (${percentage}%)|节省空间: ${savings} 字节 (${percentage}%)`)
      results.push('')
    }
    
    return results.join('\n')
  },
  
  help: {
    'en': `compress - Compress files using Lempel-Ziv coding

SYNOPSIS
    compress [options] [file...]

DESCRIPTION
    compress reduces the size of the named files using Lempel-Ziv coding.
    Whenever possible, each file is replaced by one with the extension .Z,
    while keeping the same ownership modes, access and modification times.

OPTIONS
    -v              Verbose mode, print compression statistics
    -f              Force compression even if file doesn't shrink
    -c              Write output to stdout instead of replacing files
    -b bits         Specify maximum bits/code (9-16, default 16)

EXAMPLES
    compress file.txt           # Compress file.txt to file.txt.Z
    compress -v *.txt           # Compress all .txt files with statistics
    compress -b 12 large.dat    # Use 12-bit compression
    compress -c file.txt > file.Z  # Compress to stdout

NOTES
    - Files with .Z extension are skipped unless -f is used
    - Original files are removed after successful compression
    - Use uncompress to decompress .Z files
    - Compression ratio depends on file content and redundancy
    - Binary files may not compress well

EXIT STATUS
    0    Success
    1    Error occurred
    2    Warning (file already compressed, etc.)`,

    'zh': `compress - 使用Lempel-Ziv编码压缩文件

语法
    compress [选项] [文件...]

描述
    compress 使用Lempel-Ziv编码减少指定文件的大小。
    尽可能将每个文件替换为带有.Z扩展名的文件，
    同时保持相同的所有权模式、访问和修改时间。

选项
    -v              详细模式，打印压缩统计信息
    -f              强制压缩，即使文件没有缩小
    -c              将输出写入标准输出而不是替换文件
    -b 位数         指定最大位数/代码（9-16，默认16）

示例
    compress file.txt           # 将file.txt压缩为file.txt.Z
    compress -v *.txt           # 压缩所有.txt文件并显示统计
    compress -b 12 large.dat    # 使用12位压缩
    compress -c file.txt > file.Z  # 压缩到标准输出

注意
    - 除非使用-f，否则跳过带.Z扩展名的文件
    - 成功压缩后删除原始文件
    - 使用uncompress解压缩.Z文件
    - 压缩率取决于文件内容和冗余度
    - 二进制文件可能压缩效果不佳

退出状态
    0    成功
    1    发生错误
    2    警告（文件已压缩等）`
  },
  
  examples: [
    {
      command: 'compress file.txt',
      description: 'Compress file.txt to file.txt.Z|将file.txt压缩为file.txt.Z'
    },
    {
      command: 'compress -v *.log',
      description: 'Compress all log files with verbose output|压缩所有日志文件并显示详细信息'
    },
    {
      command: 'compress -b 14 data.bin',
      description: 'Compress using 14-bit encoding|使用14位编码压缩'
    },
    {
      command: 'compress -c file.txt > backup.Z',
      description: 'Compress to stdout and redirect|压缩到标准输出并重定向'
    }
  ]
}

export default compress