import { formatHelp } from '../utils/helpFormatter.js'

export const fsck = {
  name: 'fsck',
  description: 'Check and repair a Linux filesystem|检查和修复Linux文件系统',
  category: 'disk',
  
  options: [
    // 操作模式组
    {
      flag: '-A',
      description: '检查/etc/fstab中列出的所有文件系统',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-N',
      description: '不执行，只显示要做什么（试运行）',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-R',
      description: '跳过根文件系统（与-A一起使用）',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-s',
      description: '串行执行（一次一个文件系统）',
      type: 'boolean',
      group: '操作模式'
    },
    
    // 交互选项组
    {
      flag: '-a',
      longFlag: '--automatic',
      description: '自动修复（不询问）',
      type: 'boolean',
      group: '交互选项'
    },
    {
      flag: '-p',
      longFlag: '--preen',
      description: '自动修复安全的问题',
      type: 'boolean',
      group: '交互选项'
    },
    {
      flag: '-r',
      description: '交互式修复',
      type: 'boolean',
      group: '交互选项'
    },
    {
      flag: '-y',
      description: '对所有问题回答"是"',
      type: 'boolean',
      group: '交互选项'
    },
    {
      flag: '-n',
      description: '对所有问题回答"否"（只检查）',
      type: 'boolean',
      group: '交互选项'
    },
    
    // 显示选项组
    {
      flag: '-V',
      description: '显示详细输出',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-v',
      description: '显示进度信息',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-C',
      description: '显示进度条（需要文件描述符）',
      type: 'input',
      inputKey: 'progress_fd',
      placeholder: '文件描述符',
      group: '显示选项'
    },
    
    // 特定选项组
    {
      flag: '-t',
      longFlag: '--type',
      description: '指定文件系统类型',
      type: 'select',
      inputKey: 'fs_type',
      options: ['ext2', 'ext3', 'ext4', 'xfs', 'btrfs', 'vfat', 'auto'],
      optionLabels: ['ext2', 'ext3', 'ext4', 'XFS', 'Btrfs', 'VFAT', '自动检测'],
      default: 'auto',
      group: '特定选项'
    },
    {
      flag: '-f',
      longFlag: '--force',
      description: '强制检查（即使文件系统看起来干净）',
      type: 'boolean',
      group: '特定选项'
    },
    {
      flag: '-b',
      description: '使用替代超级块',
      type: 'input',
      inputKey: 'superblock',
      placeholder: '超级块号',
      group: '特定选项'
    },
    {
      flag: '-B',
      description: '指定块大小',
      type: 'input',
      inputKey: 'block_size',
      placeholder: '块大小',
      group: '特定选项'
    },
    
    // 设备参数
    {
      inputKey: 'device',
      description: '要检查的设备',
      type: 'input',
      placeholder: '设备路径（如 /dev/sda1）',
      required: false
    }
  ],
  
  execute(args, context) {
    if (args.length === 0 || args.includes('--help')) {
      return formatHelp({
        name: 'fsck',
        description: 'Check and repair a Linux filesystem|检查和修复Linux文件系统',
        usage: 'fsck [OPTIONS] DEVICE|fsck [选项] 设备',
        options: [
          '-A                   Check all filesystems|检查所有文件系统',
          '-N                   Dry run|试运行',
          '-a, --automatic      Auto repair|自动修复',
          '-p, --preen          Preen mode|自动修复安全项',
          '-r                   Interactive|交互式',
          '-y                   Answer yes|回答"是"',
          '-n                   Answer no (check only)|回答"否"（仅检查）',
          '-V                   Verbose|详细',
          '-v                   Progress|进度',
          '-t, --type TYPE      Filesystem type|文件系统类型',
          '-f, --force          Force check|强制检查',
          '-b SUPERBLOCK        Use alt superblock|使用替代超级块'
        ],
        examples: [
          'fsck /dev/sda1|检查/dev/sda1',
          'fsck -y /dev/sda1|自动修复/dev/sda1',
          'fsck -n /dev/sda1|只检查，不修复',
          'fsck -A|检查所有文件系统',
          'fsck -t ext4 /dev/sda1|指定文件系统类型',
          'fsck -f /dev/sda1|强制检查'
        ],
        notes: [
          'NEVER run on mounted filesystem|不要在已挂载的文件系统上运行',
          'Can cause data loss|可能导致数据丢失',
          'Backup before running|运行前备份数据'
        ]
      })
    }

    const device = args.find(arg => arg.startsWith('/dev/'))
    const autoYes = args.includes('-y')
    const autoNo = args.includes('-n')
    const autoFix = args.includes('-a') || args.includes('-p')
    const force = args.includes('-f') || args.includes('--force')
    const verbose = args.includes('-V') || args.includes('-v')

    if (!device && !args.includes('-A')) {
      return 'fsck: 必须指定设备或使用 -A 选项'
    }

    // 解析文件系统类型
    let fsType = 'ext4'
    const typeIndex = args.indexOf('-t')
    if (typeIndex !== -1 && typeIndex + 1 < args.length) {
      fsType = args[typeIndex + 1]
    }

    let output = ''

    if (device) {
      output += `fsck from util-linux 2.37.2\n`
      
      if (verbose) {
        output += `Checking ${fsType} filesystem on ${device}\n`
      }

      // 模拟检查过程
      output += `${fsType === 'ext4' ? 'e2fsck' : `fsck.${fsType}`} ${force ? '-f ' : ''}${device}\n`
      
      if (force) {
        output += `Forcing filesystem check on ${device}\n`
      }

      output += `Pass 1: Checking inodes, blocks, and sizes\n`
      output += `Pass 2: Checking directory structure\n`
      output += `Pass 3: Checking directory connectivity\n`
      output += `Pass 4: Checking reference counts\n`
      output += `Pass 5: Checking group summary information\n`

      // 模拟一些文件系统问题
      const hasErrors = Math.random() > 0.7
      
      if (hasErrors && !autoNo) {
        output += `\nInode 123456 has invalid block(s). ${autoYes || autoFix ? 'FIXED' : '(y/n)? y'}\n`
        output += `Inode 234567 is disconnected. ${autoYes || autoFix ? 'RECONNECTED' : '(y/n)? y'}\n`
        output += `Free block count wrong. ${autoYes || autoFix ? 'FIXED' : '(y/n)? y'}\n`
      }

      output += `\n${device}: ${hasErrors ? '***** FILE SYSTEM WAS MODIFIED *****' : 'clean'}\n`
      output += `${device}: ${hasErrors ? '12/' : ''}131072 files (${hasErrors ? '0.1%' : '0.0%'} non-contiguous), ${hasErrors ? '1048576/' : ''}5242880 blocks\n`
    } else if (args.includes('-A')) {
      output += `fsck -A: Checking all filesystems from /etc/fstab\n\n`
      output += `/dev/sda1: clean, 123/65536 files, 4567/262144 blocks\n`
      output += `/dev/sda2: clean, 456/131072 files, 8901/524288 blocks\n`
      output += `/dev/sda3: clean, 789/65536 files, 12345/262144 blocks\n`
    }

    return output
  }
}

export default fsck
