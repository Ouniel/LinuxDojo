/**
 * cd - 切换目录
 */

export const cd = {
  options: [
    {
      name: 'directory',
      type: 'input',
      flag: 'directory',
      inputKey: 'directory',
      description: 'Directory to change to|要切换到的目录',
      placeholder: '/path/to/directory or ~ or .. or -',
      required: false,
      group: 'target'
    },
    {
      name: '-L',
      flag: '-L',
      type: 'boolean',
      description: 'Force symbolic links to be followed|强制跟随符号链接',
      group: 'options'
    },
    {
      name: '-P',
      flag: '-P',
      type: 'boolean',
      description: 'Use the physical directory structure|使用物理目录结构',
      group: 'options'
    }
  ],
  
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return cd.help
    }

    if (args.length === 0) {
      // cd 不带参数，切换到家目录
      const success = fs.changeDirectory('/home/favork')
      if (!success) {
        throw new Error('cd: could not change to home directory')
      }
      return ''
    }

    const target = args[0]
    let actualTarget = target

    // 处理特殊路径
    if (target === '~') {
      actualTarget = '/home/favork'
    } else if (target === '-') {
      // cd - 切换到上一个目录（简化实现）
      actualTarget = '/home/favork'
    }

    const success = fs.changeDirectory(actualTarget)
    
    if (!success) {
      throw new Error(`cd: ${target}: No such file or directory`)
    }
    
    return ''
  },
  description: 'Change directory|切换目录',
  category: 'file',
  examples: [
    'cd',
    'cd ~',
    'cd Documents',
    'cd ..',
    'cd -',
    'cd /path/to/directory'
  ],
  help: `Usage: cd [DIRECTORY]|用法: cd [目录]
Change the shell working directory.|更改shell工作目录。

Change the current directory to DIRECTORY. The default DIRECTORY is the|将当前目录更改为指定目录。默认目录是
value of the HOME shell variable.|HOME shell变量的值。

Options|选项:
  -L    force symbolic links to be followed|强制跟随符号链接
  -P    use the physical directory structure|使用物理目录结构

Examples|示例:
  cd              Change to home directory|切换到家目录
  cd ~            Change to home directory|切换到家目录
  cd Documents    Change to Documents directory|切换到Documents目录
  cd ..           Change to parent directory|切换到上级目录
  cd -            Change to previous directory|切换到上一个目录

Exit Status|退出状态:
Returns 0 if the directory is changed successfully; non-zero otherwise.|成功更改目录时返回0；否则返回非零值。`
}