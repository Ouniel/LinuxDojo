import { formatHelp } from '../utils/helpFormatter.js'

export const file = {
  options: [
    {
      flag: '-b',
      longFlag: '--brief',
      description: 'Don\'t prepend filenames|不显示文件名前缀',
      type: 'boolean'
    },
    {
      flag: '-i',
      longFlag: '--mime',
      description: 'Output MIME type strings|输出MIME类型字符串',
      type: 'boolean'
    },
    {
      flag: '--mime-type',
      description: 'Output MIME type|输出MIME类型',
      type: 'boolean'
    },
    {
      flag: '--mime-encoding',
      description: 'Output MIME encoding|输出MIME编码',
      type: 'boolean'
    }
  ],
  name: 'file',
  description: 'Determine file type|确定文件类型',
  category: 'basic',
  requiresArgs: true,
  examples: [
    'file document.txt',
    'file -b script.sh',
    'file -i image.jpg',
    'file --mime-type *.txt'
  ],
  help: `Usage: file [OPTION]... FILE...|用法: file [选项]... 文件...
Determine type of FILEs.|确定文件的类型。

  -b, --brief           don't prepend filenames to output lines|不在输出行前加文件名
  -i, --mime            output MIME type strings|输出MIME类型字符串
      --mime-type       output the MIME type|输出MIME类型
      --mime-encoding   output the MIME encoding|输出MIME编码
      --help            display this help and exit|显示此帮助信息并退出

Examples|示例:
  file document.txt     Determine file type|确定文件类型
  file -b script.sh     Brief output without filename|简洁输出不含文件名
  file -i image.jpg     Show MIME type|显示MIME类型
  file --mime-type *.txt  Show MIME type for txt files|显示txt文件的MIME类型`,
  
  handler(args, context, fs) {
    const { currentPath } = context
    const fileSystem = fs.fileSystem || fs
    
    // 简化的路径解析函数
    const resolvePath = (filename, basePath) => {
      // 这里简化处理，实际应该有更完整的路径解析逻辑
      const pathParts = basePath.split('/').filter(part => part !== '')
      let current = fileSystem['/']
      
      // 导航到当前路径
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return { item: null }
        }
      }
      
      // 查找文件
      if (current.children && current.children[filename]) {
        return { item: current.children[filename] }
      }
      
      return { item: null }
    }
    const options = {
      brief: false,
      mime: false,
      mimeType: false,
      mimeEncoding: false
    }
    
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-b' || arg === '--brief') {
        options.brief = true
      } else if (arg === '-i' || arg === '--mime') {
        options.mime = true
      } else if (arg === '--mime-type') {
        options.mimeType = true
      } else if (arg === '--mime-encoding') {
        options.mimeEncoding = true
      } else if (arg === '--help') {
        return formatHelp({
          name: 'file',
          description: 'Determine file type|确定文件类型',
          usage: 'file [OPTIONS] FILE...|file [选项] 文件...',
          options: [
            '-b, --brief          Don\'t prepend filenames|不显示文件名前缀',
            '-i, --mime           Output MIME type strings|输出MIME类型字符串',
            '--mime-type          Output MIME type|输出MIME类型',
            '--mime-encoding      Output MIME encoding|输出MIME编码',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'file document.txt|检查文件类型',
            'file -b script.sh|简洁输出文件类型',
            'file -i image.jpg|显示MIME类型'
          ]
        })
      } else if (!arg.startsWith('-')) {
        files.push(arg)
      }
    }
    
    if (files.length === 0) {
      return 'file: missing file operand\nUsage: file [OPTIONS] FILE...'
    }
    
    const results = []
    
    for (const filename of files) {
      const resolvedPath = resolvePath(filename, currentPath)
      const item = resolvedPath.item
      
      if (!item) {
        results.push(`file: cannot open '${filename}' (No such file or directory)`)
        continue
      }
      
      let fileType = ''
      let mimeType = ''
      let encoding = 'us-ascii'
      
      if (item.type === 'directory') {
        fileType = 'directory'
        mimeType = 'inode/directory'
      } else {
        // 根据文件扩展名判断类型
        const ext = filename.toLowerCase().split('.').pop()
        
        switch (ext) {
          case 'txt':
          case 'md':
          case 'readme':
            fileType = 'ASCII text'
            mimeType = 'text/plain'
            break
          case 'js':
            fileType = 'JavaScript source'
            mimeType = 'text/javascript'
            break
          case 'html':
          case 'htm':
            fileType = 'HTML document'
            mimeType = 'text/html'
            break
          case 'css':
            fileType = 'CSS stylesheet'
            mimeType = 'text/css'
            break
          case 'json':
            fileType = 'JSON data'
            mimeType = 'application/json'
            break
          case 'xml':
            fileType = 'XML document'
            mimeType = 'application/xml'
            break
          case 'sh':
          case 'bash':
            fileType = 'Bourne-Again shell script'
            mimeType = 'text/x-shellscript'
            break
          case 'py':
            fileType = 'Python script'
            mimeType = 'text/x-python'
            break
          case 'jpg':
          case 'jpeg':
            fileType = 'JPEG image data'
            mimeType = 'image/jpeg'
            encoding = 'binary'
            break
          case 'png':
            fileType = 'PNG image data'
            mimeType = 'image/png'
            encoding = 'binary'
            break
          case 'gif':
            fileType = 'GIF image data'
            mimeType = 'image/gif'
            encoding = 'binary'
            break
          case 'pdf':
            fileType = 'PDF document'
            mimeType = 'application/pdf'
            encoding = 'binary'
            break
          case 'zip':
            fileType = 'Zip archive data'
            mimeType = 'application/zip'
            encoding = 'binary'
            break
          case 'tar':
            fileType = 'POSIX tar archive'
            mimeType = 'application/x-tar'
            encoding = 'binary'
            break
          case 'gz':
            fileType = 'gzip compressed data'
            mimeType = 'application/gzip'
            encoding = 'binary'
            break
          default:
            // 检查是否是可执行文件
            if (item.permissions && item.permissions.includes('x')) {
              fileType = 'executable'
              mimeType = 'application/x-executable'
            } else {
              fileType = 'data'
              mimeType = 'application/octet-stream'
              encoding = 'binary'
            }
        }
      }
      
      let output = ''
      
      if (options.mime || options.mimeType || options.mimeEncoding) {
        if (options.mimeType || options.mime) {
          output = mimeType
        }
        if (options.mimeEncoding || options.mime) {
          if (output) output += '; '
          output += `charset=${encoding}`
        }
      } else {
        output = fileType
      }
      
      if (options.brief) {
        results.push(output)
      } else {
        results.push(`${filename}: ${output}`)
      }
    }
    
    return results.join('\n')
  }
}