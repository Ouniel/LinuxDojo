import { formatHelp } from '../utils/helpFormatter.js'

export const parted = {
  name: 'parted',
  description: 'Partition manipulation program|分区操作程序',
  category: 'disk',
  
  options: [
    // 操作模式组
    {
      flag: '-l',
      longFlag: '--list',
      description: '列出所有块设备上的分区布局',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-s',
      longFlag: '--script',
      description: '脚本模式（不提示用户）',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-i',
      longFlag: '--interactive',
      description: '交互模式（默认）',
      type: 'boolean',
      group: '操作模式'
    },
    
    // 显示选项组
    {
      flag: '-m',
      longFlag: '--machine',
      description: '机器可解析的输出',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-a',
      longFlag: '--align',
      description: '为新分区设置对齐方式',
      type: 'select',
      inputKey: 'align_type',
      options: ['none', 'cylinder', 'minimal', 'optimal'],
      optionLabels: ['无对齐', '柱面对齐', '最小对齐', '最佳对齐'],
      default: 'optimal',
      group: '显示选项'
    },
    
    // 其他选项组
    {
      flag: '-v',
      longFlag: '--version',
      description: '显示版本信息',
      type: 'boolean',
      group: '其他选项'
    },
    {
      flag: '-h',
      longFlag: '--help',
      description: '显示帮助信息',
      type: 'boolean',
      group: '其他选项'
    },
    
    // 设备参数
    {
      inputKey: 'device',
      description: '磁盘设备',
      type: 'input',
      placeholder: '设备路径（如 /dev/sda）',
      required: false
    },
    
    // 命令参数
    {
      inputKey: 'command',
      description: '要执行的parted命令',
      type: 'input',
      placeholder: 'parted命令（如 mklabel gpt, mkpart primary ext4 1MiB 100GiB）',
      required: false
    }
  ],
  
  execute(args, context) {
    if (args.length === 0 || args.includes('--help')) {
      return formatHelp({
        name: 'parted',
        description: 'Partition manipulation program|分区操作程序',
        usage: 'parted [OPTIONS] [DEVICE] [COMMAND [ARGUMENTS]]|parted [选项] [设备] [命令 [参数]]',
        options: [
          '-l, --list           List partitions|列出分区',
          '-s, --script         Script mode|脚本模式',
          '-i, --interactive    Interactive mode|交互模式',
          '-m, --machine        Machine parseable|机器可解析输出',
          '-a, --align TYPE     Alignment type|对齐类型',
          '-v, --version        Show version|显示版本'
        ],
        examples: [
          'parted -l|列出所有分区',
          'parted /dev/sda print|显示/dev/sda的分区表',
          'parted /dev/sda mklabel gpt|创建GPT分区表',
          'parted /dev/sda mkpart primary ext4 1MiB 100GiB|创建分区',
          'parted /dev/sda rm 1|删除分区1',
          'parted /dev/sda resizepart 2 200GiB|调整分区2大小'
        ],
        notes: [
          'More user-friendly than fdisk|比fdisk更友好',
          'Supports GPT and MBR|支持GPT和MBR',
          'Can resize partitions|可以调整分区大小'
        ]
      })
    }

    const listMode = args.includes('-l') || args.includes('--list')
    const machineMode = args.includes('-m') || args.includes('--machine')
    const device = args.find(arg => arg.startsWith('/dev/'))

    if (listMode) {
      if (machineMode) {
        return `/dev/sda:500GB:scsi:512:512:gpt:ATA Samsung SSD 860:;\n` +
               `1:1049kB:538MB:537MB:fat32:EFI System Partition:boot, esp;\n` +
               `2:538MB:53.7GB:53.2GB:ext4::;\n` +
               `3:53.7GB:107GB:53.7GB:ext4::;\n` +
               `4:107GB:161GB:53.7GB:ext4::;\n` +
               `5:161GB:537GB:376GB:::lvm;\n` +
               `/dev/sdb:1000GB:scsi:4096:4096:gpt:ATA WD Blue:;\n` +
               `1:1049kB:107GB:107GB:ntfs:Data:msftdata;\n` +
               `2:107GB:215GB:107GB:ext4::;\n` +
               `3:215GB:1000GB:785GB:::lvm;`
      }

      return `Model: ATA Samsung SSD 860 (scsi)\n` +
             `Disk /dev/sda: 500GB\n` +
             `Sector size (logical/physical): 512B/512B\n` +
             `Partition Table: gpt\n` +
             `Disk Flags: \n\n` +
             `Number  Start   End     Size    File system  Name                  Flags\n` +
             ` 1      1049kB  538MB   537MB   fat32        EFI System Partition  boot, esp\n` +
             ` 2      538MB   53.7GB  53.2GB  ext4\n` +
             ` 3      53.7GB  107GB   53.7GB  ext4\n` +
             ` 4      107GB   161GB   53.7GB  ext4\n` +
             ` 5      161GB   537GB   376GB                         lvm\n\n` +
             `Model: ATA WD Blue (scsi)\n` +
             `Disk /dev/sdb: 1000GB\n` +
             `Sector size (logical/physical): 4096B/4096B\n` +
             `Partition Table: gpt\n\n` +
             `Number  Start   End     Size    File system  Name  Flags\n` +
             ` 1      1049kB  107GB   107GB   ntfs         Data  msftdata\n` +
             ` 2      107GB   215GB   107GB   ext4\n` +
             ` 3      215GB   1000GB  785GB                       lvm\n`
    }

    if (!device) {
      return `GNU Parted 3.4\n` +
             `使用 /dev/sda\n` +
             `欢迎使用 GNU Parted！输入 'help' 来查看命令列表。\n` +
             `(parted) `
    }

    return `GNU Parted 3.4\n` +
           `使用 ${device}\n` +
           `(parted) `
  }
}

export default parted
