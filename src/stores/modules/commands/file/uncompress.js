/**
 * uncompress 命令实现
 * 解压缩文件
 */

export const uncompress = {
  name: 'uncompress',
  description: 'Uncompress files compressed with compress|解压缩用compress压缩的文件',
  category: 'file',
  options: [
    // 基本操作
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Verbose mode, print decompression statistics|详细模式，打印解压缩统计信息',
      group: 'output'
    },
    {
      name: '-f',
      flag: '-f',
      type: 'boolean',
      description: 'Force decompression, overwrite existing files|强制解压缩，覆盖现有文件',
      group: 'behavior'
    },
    {
      name: '-c',
      flag: '-c',
      type: 'boolean',
      description: 'Write output to stdout instead of creating files|将输出写入标准输出而不是创建文件',
      group: 'output'
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
          output: 'uncompress: missing file operand|uncompress: 缺少文件操作数',
          exitCode: 1
        }
      }
      
      // 解析选项
      let verbose = false
      let force = false
      let toStdout = false
      let files = []
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-v') {
          verbose = true
        } else if (arg === '-f') {
          force = true
        } else if (arg === '-c') {
          toStdout = true
        } else if (arg === '--help') {
          return {
            output: this.help.zh,
            exitCode: 0
          }
        } else if (arg.startsWith('-')) {
          return {
            output: `uncompress: invalid option: ${arg}|uncompress: 无效选项: ${arg}`,
            exitCode: 1
          }
        } else {
          files.push(arg)
        }
      }
      
      if (files.length === 0) {
        return {
          output: 'uncompress: no files specified|uncompress: 未指定文件',
          exitCode: 1
        }
      }
      
      const results = []
      
      for (const file of files) {
        const result = this.uncompressFile(file, { verbose, force, toStdout })
        results.push(result)
      }
      
      return {
        output: results.join('\n'),
        exitCode: 0
      }
      
    } catch (error) {
      return {
        output: `uncompress: ${error.message}`,
        exitCode: 1
      }
    }
  },
  
  uncompressFile(filename, options) {
    const { verbose, force, toStdout } = options
    const results = []
    
    // 检查文件扩展名
    let outputFile = filename
    if (filename.endsWith('.Z')) {
      outputFile = filename.slice(0, -2)
    } else if (!filename.includes('.')) {
      // 尝试添加.Z扩展名
      filename = `${filename}.Z`
      outputFile = filename.slice(0, -2)
    } else {
      results.push(`uncompress: ${filename} does not end in .Z|uncompress: ${filename} 不以.Z结尾`)
      return results.join('\n')
    }
    
    // 模拟文件大小
    const compressedSize = Math.floor(Math.random() * 5000) + 500
    const expansionRatio = 2 + Math.random() * 3 // 2-5x expansion
    const originalSize = Math.floor(compressedSize * expansionRatio)
    const percentage = (((originalSize - compressedSize) / compressedSize) * 100).toFixed(1)
    
    if (verbose) {
      results.push(`Uncompressing ${filename}...|正在解压缩 ${filename}...`)
    }
    
    if (toStdout) {
      results.push(`-- stdout output --`)
      results.push(`[Decompressed content of ${filename}]`)
      results.push(`[${filename} 的解压缩内容]`)
      results.push(`-- end of output --`)
    } else {
      results.push(`${filename}: -- replaced with ${outputFile}`)
      results.push(`${filename}: -- 替换为 ${outputFile}`)
    }
    
    if (verbose) {
      results.push(`Compressed size: ${compressedSize} bytes|压缩后大小: ${compressedSize} 字节`)
      results.push(`Uncompressed size: ${originalSize} bytes|解压缩后大小: ${originalSize} 字节`)
      results.push(`Expansion: ${percentage}%|扩展: ${percentage}%`)
      results.push('')
    }
    
    return results.join('\n')
  },
  
  help: {
    'en': `uncompress - Uncompress files compressed with compress

SYNOPSIS
    uncompress [options] [file...]

DESCRIPTION
    uncompress restores files compressed with the compress command.
    Files with .Z extension are uncompressed and the .Z extension is removed.
    The original compressed file is deleted after successful decompression.

OPTIONS
    -v              Verbose mode, print decompression statistics
    -f              Force decompression, overwrite existing files
    -c              Write output to stdout instead of creating files

EXAMPLES
    uncompress file.txt.Z       # Uncompress to file.txt
    uncompress -v *.Z           # Uncompress all .Z files with statistics
    uncompress -c data.Z > data.txt  # Uncompress to stdout
    uncompress -f backup.Z      # Force overwrite existing file

NOTES
    - Files must have .Z extension or it will be added automatically
    - Original .Z files are removed after successful decompression
    - Use -c option to preserve original compressed files
    - File ownership, permissions, and timestamps are preserved
    - Compatible with files compressed by compress command

EXIT STATUS
    0    Success
    1    Error occurred
    2    Warning (file not compressed, etc.)`,

    'zh': `uncompress - 解压缩用compress压缩的文件

语法
    uncompress [选项] [文件...]

描述
    uncompress 恢复用compress命令压缩的文件。
    带有.Z扩展名的文件被解压缩并删除.Z扩展名。
    成功解压缩后删除原始压缩文件。

选项
    -v              详细模式，打印解压缩统计信息
    -f              强制解压缩，覆盖现有文件
    -c              将输出写入标准输出而不是创建文件

示例
    uncompress file.txt.Z       # 解压缩为file.txt
    uncompress -v *.Z           # 解压缩所有.Z文件并显示统计
    uncompress -c data.Z > data.txt  # 解压缩到标准输出
    uncompress -f backup.Z      # 强制覆盖现有文件

注意
    - 文件必须有.Z扩展名，否则会自动添加
    - 成功解压缩后删除原始.Z文件
    - 使用-c选项保留原始压缩文件
    - 保留文件所有权、权限和时间戳
    - 与compress命令压缩的文件兼容

退出状态
    0    成功
    1    发生错误
    2    警告（文件未压缩等）`
  },
  
  examples: [
    {
      command: 'uncompress file.txt.Z',
      description: 'Uncompress file.txt.Z to file.txt|将file.txt.Z解压缩为file.txt'
    },
    {
      command: 'uncompress -v *.Z',
      description: 'Uncompress all .Z files with verbose output|解压缩所有.Z文件并显示详细信息'
    },
    {
      command: 'uncompress -c archive.Z',
      description: 'Uncompress to stdout without removing original|解压缩到标准输出而不删除原文件'
    },
    {
      command: 'uncompress -f backup',
      description: 'Force uncompress backup.Z, overwrite if exists|强制解压缩backup.Z，如存在则覆盖'
    }
  ]
}

export default uncompress