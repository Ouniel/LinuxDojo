import { formatHelp } from '../utils/helpFormatter.js'

export const chgrp = {
  name: 'chgrp',
  description: 'Change group ownership of files|更改文件的组所有权',
  
  options: [
    // 基本选项组
    {
      flag: '-R',
      longFlag: '--recursive',
      description: '递归更改文件和目录',
      type: 'boolean',
      group: '基本选项'
    },
    {
      flag: '-v',
      longFlag: '--verbose',
      description: '为每个处理的文件输出诊断信息',
      type: 'boolean',
      group: '基本选项'
    },
    {
      flag: '-c',
      longFlag: '--changes',
      description: '类似verbose但仅在进行更改时报告',
      type: 'boolean',
      group: '基本选项'
    },
    {
      flag: '-h',
      longFlag: '--no-dereference',
      description: '影响符号链接而不是引用的文件',
      type: 'boolean',
      group: '基本选项'
    },
    
    // 参考选项组
    {
      flag: '--reference',
      description: '使用参考文件的组而不是指定组值',
      type: 'input',
      inputKey: 'reference_file',
      placeholder: '参考文件路径',
      group: '参考选项'
    },
    
    // 输入参数
    {
      inputKey: 'group_name',
      description: '要设置的组名',
      type: 'input',
      placeholder: '组名（如 staff, users）',
      required: true
    },
    {
      inputKey: 'target_files',
      description: '要更改组的文件或目录',
      type: 'input',
      placeholder: '文件路径（支持多个文件，用空格分隔）',
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
    const options = {
      recursive: false,
      verbose: false,
      changes: false,
      reference: null,
      dereference: true
    }
    
    let group = ''
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-R' || arg === '--recursive') {
        options.recursive = true
      } else if (arg === '-v' || arg === '--verbose') {
        options.verbose = true
      } else if (arg === '-c' || arg === '--changes') {
        options.changes = true
      } else if (arg === '--reference') {
        options.reference = args[++i]
      } else if (arg === '-h' || arg === '--no-dereference') {
        options.dereference = false
      } else if (arg === '--help') {
        return formatHelp({
          name: 'chgrp',
          description: 'Change group ownership of files|更改文件的组所有权',
          usage: 'chgrp [OPTIONS] GROUP FILE...|chgrp [选项] 组 文件...',
          options: [
            '-R, --recursive      Change files and directories recursively|递归更改文件和目录',
            '-v, --verbose        Output a diagnostic for every file processed|为每个处理的文件输出诊断信息',
            '-c, --changes        Like verbose but report only when a change is made|类似verbose但仅在进行更改时报告',
            '--reference=RFILE    Use RFILE\'s group rather than specifying a GROUP value|使用RFILE的组而不是指定组值',
            '-h, --no-dereference Affect symbolic links instead of any referenced file|影响符号链接而不是引用的文件',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'chgrp staff file.txt|将文件组更改为staff',
            'chgrp -R users /home/user|递归更改目录组',
            'chgrp --reference=file1 file2|使用file1的组设置file2'
          ]
        })
      } else if (!arg.startsWith('-')) {
        if (!group) {
          group = arg
        } else {
          files.push(arg)
        }
      }
    }
    
    // 如果使用reference选项，从参考文件获取组
    if (options.reference) {
      const refPath = resolvePath(options.reference, currentPath)
      if (!refPath.item) {
        return `chgrp: cannot access '${options.reference}': No such file or directory`
      }
      group = refPath.item.group || 'users'
    }
    
    if (!group) {
      return 'chgrp: missing operand\nUsage: chgrp [OPTIONS] GROUP FILE...'
    }
    
    if (files.length === 0) {
      return 'chgrp: missing file operand\nUsage: chgrp [OPTIONS] GROUP FILE...'
    }
    
    const results = []
    
    // 递归更改组的函数
    function changeGroupRecursive(item, path, targetGroup) {
      const oldGroup = item.group || 'users'
      
      if (oldGroup !== targetGroup) {
        item.group = targetGroup
        
        if (options.verbose || options.changes) {
          results.push(`group of '${path}' changed from ${oldGroup} to ${targetGroup}`)
        }
      } else if (options.verbose) {
        results.push(`group of '${path}' retained as ${targetGroup}`)
      }
      
      // 如果是目录且启用递归
      if (options.recursive && item.type === 'directory' && item.children) {
        for (const [name, child] of Object.entries(item.children)) {
          const childPath = `${path}/${name}`
          changeGroupRecursive(child, childPath, targetGroup)
        }
      }
    }
    
    // 处理每个文件
    for (const filename of files) {
      const resolvedPath = resolvePath(filename, currentPath)
      
      if (!resolvedPath.item) {
        results.push(`chgrp: cannot access '${filename}': No such file or directory`)
        continue
      }
      
      changeGroupRecursive(resolvedPath.item, filename, group)
    }
    
    return results.length > 0 ? results.join('\n') : ''
  }
}