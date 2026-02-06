import { formatHelp } from '../utils/helpFormatter.js'

export const mkfs = {
  name: 'mkfs',
  description: 'Build a Linux filesystem|创建Linux文件系统',
  category: 'disk',
  
  options: [
    // 文件系统类型组
    {
      flag: '-t',
      longFlag: '--type',
      description: '指定文件系统类型',
      type: 'select',
      inputKey: 'fs_type',
      options: ['ext2', 'ext3', 'ext4', 'xfs', 'btrfs', 'vfat', 'ntfs', 'swap'],
      optionLabels: ['ext2', 'ext3', 'ext4', 'XFS', 'Btrfs', 'VFAT', 'NTFS', 'Swap'],
      default: 'ext4',
      group: '文件系统类型'
    },
    
    // 标签选项组
    {
      flag: '-L',
      longFlag: '--label',
      description: '设置文件系统卷标',
      type: 'input',
      inputKey: 'volume_label',
      placeholder: '卷标名称（如 Data, System）',
      group: '标签选项'
    },
    {
      flag: '-U',
      longFlag: '--uuid',
      description: '设置文件系统UUID',
      type: 'input',
      inputKey: 'fs_uuid',
      placeholder: 'UUID（如 a1b2c3d4-e5f6-7890-1234-567890abcdef）',
      group: '标签选项'
    },
    {
      flag: '-n',
      longFlag: '--name',
      description: '设置文件系统名称（用于NTFS）',
      type: 'input',
      inputKey: 'fs_name',
      placeholder: '文件系统名称',
      group: '标签选项'
    },
    
    // 大小选项组
    {
      flag: '-b',
      longFlag: '--block-size',
      description: '指定块大小',
      type: 'select',
      inputKey: 'block_size',
      options: ['1024', '2048', '4096', '8192'],
      optionLabels: ['1KB', '2KB', '4KB', '8KB'],
      default: '4096',
      group: '大小选项'
    },
    
    // 创建选项组
    {
      flag: '-c',
      description: '创建文件系统前检查坏块',
      type: 'boolean',
      group: '创建选项'
    },
    {
      flag: '-f',
      longFlag: '--force',
      description: '强制创建（即使设备已有文件系统）',
      type: 'boolean',
      group: '创建选项'
    },
    {
      flag: '-v',
      longFlag: '--verbose',
      description: '详细输出',
      type: 'boolean',
      group: '创建选项'
    },
    {
      flag: '-q',
      longFlag: '--quiet',
      description: '安静模式',
      type: 'boolean',
      group: '创建选项'
    },
    {
      flag: '-V',
      longFlag: '--version',
      description: '显示版本信息',
      type: 'boolean',
      group: '创建选项'
    },
    
    // 特定文件系统选项组
    {
      flag: '-O',
      longFlag: '--features',
      description: '启用/禁用特定功能（ext4）',
      type: 'input',
      inputKey: 'features',
      placeholder: '功能列表（如 ^metadata_csum,64bit）',
      group: '特定选项'
    },
    {
      flag: '-E',
      longFlag: '--extended-options',
      description: '扩展选项',
      type: 'input',
      inputKey: 'extended_opts',
      placeholder: '扩展选项',
      group: '特定选项'
    },
    {
      flag: '-i',
      longFlag: '--bytes-per-inode',
      description: '每个inode的字节数',
      type: 'input',
      inputKey: 'bytes_per_inode',
      placeholder: '字节数（如 16384）',
      group: '特定选项'
    },
    {
      flag: '-N',
      description: '指定inode数量',
      type: 'input',
      inputKey: 'inode_count',
      placeholder: 'inode数量',
      group: '特定选项'
    },
    {
      flag: '-m',
      description: '保留给超级用户的百分比',
      type: 'input',
      inputKey: 'reserved_percent',
      placeholder: '百分比（默认5）',
      default: '5',
      group: '特定选项'
    },
    
    // 设备参数
    {
      inputKey: 'device',
      description: '目标设备或分区',
      type: 'input',
      placeholder: '设备路径（如 /dev/sda1, /dev/nvme0n1p1）',
      required: true
    }
  ],
  
  execute(args, context) {
    if (args.length === 0 || args.includes('--help')) {
      return formatHelp({
        name: 'mkfs',
        description: 'Build a Linux filesystem|创建Linux文件系统',
        usage: 'mkfs [OPTIONS] DEVICE|mkfs [选项] 设备',
        options: [
          '-t, --type TYPE      Filesystem type|文件系统类型',
          '-L, --label LABEL    Volume label|卷标',
          '-U, --uuid UUID      Filesystem UUID|UUID',
          '-b, --block-size SZ  Block size|块大小',
          '-c                   Check for bad blocks|检查坏块',
          '-f, --force          Force|强制',
          '-v, --verbose        Verbose|详细',
          '-q, --quiet          Quiet|安静',
          '-O, --features FEAT  Features|功能',
          '-i, --bytes-per-inode N  Bytes per inode|每inode字节数',
          '-m PERCENT           Reserved blocks percent|保留块百分比'
        ],
        examples: [
          'mkfs -t ext4 /dev/sda1|在/dev/sda1上创建ext4文件系统',
          'mkfs -t ext4 -L Data /dev/sdb1|创建带卷标的ext4',
          'mkfs.ext4 /dev/sda1|使用专用工具创建ext4',
          'mkfs -t xfs -f /dev/sdc1|强制创建XFS文件系统',
          'mkfs -t vfat -n USB /dev/sdd1|创建FAT32文件系统'
        ],
        notes: [
          'DESTROYS ALL DATA on device|会销毁设备上所有数据',
          'Use with extreme caution|请极其谨慎使用',
          'mkfs.type is a shortcut|mkfs.type是快捷方式'
        ]
      })
    }

    const device = args.find(arg => arg.startsWith('/dev/'))
    
    if (!device) {
      return 'mkfs: 必须指定设备'
    }

    // 解析文件系统类型
    let fsType = 'ext4'
    const typeIndex = args.indexOf('-t')
    if (typeIndex !== -1 && typeIndex + 1 < args.length) {
      fsType = args[typeIndex + 1]
    }

    // 解析卷标
    let label = ''
    const labelIndex = args.indexOf('-L')
    if (labelIndex !== -1 && labelIndex + 1 < args.length) {
      label = args[labelIndex + 1]
    }

    const verbose = args.includes('-v') || args.includes('--verbose')
    const force = args.includes('-f') || args.includes('--force')

    let output = ''
    
    if (verbose) {
      output += `mke2fs ${fsType === 'ext4' ? '1.46.5' : '1.0'} (${new Date().toISOString().split('T')[0]})\n`
    }

    output += `${fsType === 'ext4' ? 'mke2fs' : `mkfs.${fsType}`}: Creating filesystem on ${device}\n`
    
    if (label) {
      output += `Filesystem label=${label}\n`
    }

    // 模拟文件系统创建过程
    const uuid = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
    output += `UUID: ${uuid}\n`
    
    if (fsType === 'ext4') {
      output += `Superblock backups stored on blocks: \n`
      output += `\t32768, 98304, 163840, 229376, 294912, 819200, 884736\n\n`
      output += `Allocating group tables: done\n`
      output += `Writing inode tables: done\n`
      output += `Creating journal (16384 blocks): done\n`
      output += `Writing superblocks and filesystem accounting information: done\n\n`
    } else if (fsType === 'xfs') {
      output += `meta-data=${device}               isize=512    agcount=4, agsize=65536 blks\n`
      output += `         =                       sectsz=512   attr=2, projid32bit=1\n`
      output += `         =                       crc=1        finobt=1, sparse=1, rmapbt=0\n`
      output += `         =                       reflink=1    bigtime=0 inobtcount=0\n`
      output += `data     =                       bsize=4096   blocks=262144, imaxpct=25\n`
      output += `         =                       sunit=0      swidth=0 blks\n`
      output += `naming   =version 2              bsize=4096   ascii-ci=0, ftype=1\n`
      output += `log      =internal log           bsize=4096   blocks=2560, version=2\n`
      output += `         =                       sectsz=512   sunit=0 blks, lazy-count=1\n`
      output += `realtime =none                   extsz=4096   blocks=0, rtextents=0\n`
    }

    output += `\nFilesystem created successfully on ${device}\n`
    
    return output
  }
}

export default mkfs
