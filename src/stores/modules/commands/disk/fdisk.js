import { formatHelp } from '../utils/helpFormatter.js'

export const fdisk = {
  name: 'fdisk',
  description: 'Partition table manipulator for Linux|Linux分区表操作工具',
  category: 'disk',
  
  options: [
    // 操作模式组
    {
      flag: '-l',
      description: '列出分区表并退出',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-s',
      description: '显示分区大小（以块为单位）',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-u',
      description: '以扇区而非柱面显示大小',
      type: 'boolean',
      group: '操作模式'
    },
    
    // 分区操作组
    {
      flag: '-n',
      description: '创建新分区',
      type: 'boolean',
      group: '分区操作'
    },
    {
      flag: '-d',
      description: '删除分区',
      type: 'input',
      inputKey: 'delete_partition',
      placeholder: '分区号',
      group: '分区操作'
    },
    {
      flag: '-t',
      description: '更改分区类型',
      type: 'boolean',
      group: '分区操作'
    },
    {
      flag: '-a',
      description: '切换可启动标志',
      type: 'boolean',
      group: '分区操作'
    },
    
    // 其他选项组
    {
      flag: '-v',
      description: '显示版本信息',
      type: 'boolean',
      group: '其他选项'
    },
    {
      flag: '-b',
      description: '指定扇区大小',
      type: 'input',
      inputKey: 'sector_size',
      placeholder: '扇区大小（如 512, 1024, 2048, 4096）',
      group: '其他选项'
    },
    {
      flag: '-C',
      description: '指定柱面数',
      type: 'input',
      inputKey: 'cylinders',
      placeholder: '柱面数',
      group: '其他选项'
    },
    {
      flag: '-H',
      description: '指定磁头数',
      type: 'input',
      inputKey: 'heads',
      placeholder: '磁头数',
      group: '其他选项'
    },
    {
      flag: '-S',
      description: '指定每磁道扇区数',
      type: 'input',
      inputKey: 'sectors',
      placeholder: '每磁道扇区数',
      group: '其他选项'
    },
    
    // 设备参数
    {
      inputKey: 'device',
      description: '磁盘设备',
      type: 'input',
      placeholder: '设备路径（如 /dev/sda, /dev/nvme0n1）',
      required: false
    }
  ],
  
  execute(args, context) {
    if (args.length === 0 || args.includes('--help')) {
      return formatHelp({
        name: 'fdisk',
        description: 'Partition table manipulator for Linux|Linux分区表操作工具',
        usage: 'fdisk [OPTIONS] DEVICE|fdisk [选项] 设备',
        options: [
          '-l                   List partitions|列出分区表',
          '-s PARTITION         Show partition size|显示分区大小',
          '-u                   Use sectors|使用扇区显示',
          '-n                   Create new partition|创建新分区',
          '-d PARTITION         Delete partition|删除分区',
          '-t                   Change partition type|更改分区类型',
          '-a                   Toggle bootable flag|切换可启动标志',
          '-v                   Show version|显示版本',
          '-b SIZE              Sector size|扇区大小',
          '-C NUM               Cylinders|柱面数',
          '-H NUM               Heads|磁头数',
          '-S NUM               Sectors per track|每磁道扇区数'
        ],
        examples: [
          'fdisk -l|列出所有磁盘分区',
          'fdisk -l /dev/sda|列出/dev/sda的分区',
          'fdisk /dev/sdb|对/dev/sdb进行分区操作',
          'fdisk -s /dev/sda1|显示分区大小'
        ],
        notes: [
          'WARNING: fdisk modifies partition tables|警告：fdisk会修改分区表',
          'Root privileges required|需要root权限',
          'Backup data before modifying|修改前请备份数据'
        ]
      })
    }

    const listMode = args.includes('-l')
    const device = args.find(arg => arg.startsWith('/dev/'))

    if (listMode) {
      // 列出分区表
      let output = ''
      
      if (device) {
        // 列出指定设备
        output += `Disk ${device}: 500 GiB, 536870912000 bytes, 1048576000 sectors\n`
        output += `Disk model: Samsung SSD 860\n`
        output += `Units: sectors of 1 * 512 = 512 bytes\n`
        output += `Sector size (logical/physical): 512 bytes / 512 bytes\n`
        output += `I/O size (minimum/optimal): 512 bytes / 512 bytes\n`
        output += `Disklabel type: gpt\n`
        output += `Disk identifier: A1B2C3D4-E5F6-7890-1234-567890ABCDEF\n\n`
        
        output += `Device          Start        End    Sectors   Size Type\n`
        output += `${device}1       2048    1050623    1048576   512M EFI System\n`
        output += `${device}2    1050624  104857599  103806976  49.5G Linux filesystem\n`
        output += `${device}3  104857600  209715199  104857600    50G Linux filesystem\n`
        output += `${device}4  209715200  314572799  104857600    50G Linux filesystem\n`
        output += `${device}5  314572800 1048575966  734003167 349.9G Linux LVM\n`
      } else {
        // 列出所有设备
        output += `Disk /dev/sda: 500 GiB, 536870912000 bytes, 1048576000 sectors\n`
        output += `Disk model: Samsung SSD 860\n`
        output += `Units: sectors of 1 * 512 = 512 bytes\n\n`
        
        output += `Device     Boot     Start       End   Sectors   Size Id Type\n`
        output += `/dev/sda1  *         2048   1050623   1048576   512M 83 Linux\n`
        output += `/dev/sda2         1050624 104857599 103806976  49.5G 83 Linux\n`
        output += `/dev/sda3       104857600 209715199 104857600    50G 83 Linux\n`
        output += `/dev/sda4       209715200 314572799 104857600    50G 83 Linux\n`
        output += `/dev/sda5       314572800 419430399 104857600    50G 8e Linux LVM\n\n`
        
        output += `Disk /dev/sdb: 1 TiB, 1099511627776 bytes, 2147483648 sectors\n`
        output += `Disk model: WD Blue HDD\n`
        output += `Disklabel type: gpt\n\n`
        
        output += `Device       Start        End    Sectors  Size Type\n`
        output += `/dev/sdb1     2048  209715199  209713152  100G Microsoft basic data\n`
        output += `/dev/sdb2  209715200  419430399  209715200  100G Linux filesystem\n`
        output += `/dev/sdb3  419430400 2147483647 1728053248  824G Linux LVM\n`
      }
      
      return output
    }

    if (!device) {
      return 'fdisk: 必须指定设备（如 /dev/sda）或使用 -l 选项'
    }

    // 交互模式提示
    return `Welcome to fdisk (${device}).\n\n` +
           `Changes will remain in memory only, until you decide to write them.\n` +
           `Be careful before using the write command.\n\n` +
           `Command (m for help): `
  }
}

export default fdisk
