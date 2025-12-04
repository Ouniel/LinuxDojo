/**
 * mount - 挂载文件系统
 */

export const mount = {
    name: 'mount',
    description: 'Mount a filesystem|挂载文件系统',

    handler: (args, context) => {
        if (args.includes('--help') || args.includes('-h')) {
            return mount.help
        }

        // 如果没有参数，显示已挂载的文件系统
        if (args.length === 0) {
            let output = []
            output.push('sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)')
            output.push('proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)')
            output.push('udev on /dev type devtmpfs (rw,nosuid,relatime,size=8163400k,nr_inodes=2040850,mode=755)')
            output.push('devpts on /dev/pts type devpts (rw,nosuid,noexec,relatime,gid=5,mode=620,ptmxmode=000)')
            output.push('tmpfs on /run type tmpfs (rw,nosuid,noexec,relatime,size=1638856k,mode=755)')
            output.push('/dev/sda1 on / type ext4 (rw,relatime,errors=remount-ro)')
            output.push('tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)')
            output.push('tmpfs on /run/lock type tmpfs (rw,nosuid,nodev,noexec,relatime,size=5120k)')
            output.push('cgroup2 on /sys/fs/cgroup type cgroup2 (rw,nosuid,nodev,noexec,relatime,nsdelegate,memory_recursiveprot)')
            return output.join('\n')
        }

        // 模拟挂载操作
        const device = args.find(a => a.startsWith('/dev/'))
        const dir = args.find(a => a.startsWith('/') && !a.startsWith('/dev/'))

        if (device && dir) {
            return '' // 成功挂载不输出任何内容
        } else if (device && !dir) {
            return `mount: ${device}: can't find in /etc/fstab.`
        } else {
            return 'mount: bad usage. Try "mount --help".'
        }
    },

    options: [
        {
            name: 'device',
            type: 'input',
            description: 'Device',
            placeholder: '/dev/sdb1',
            inputKey: 'device'
        },
        {
            name: 'directory',
            type: 'input',
            description: 'Mount point',
            placeholder: '/mnt/data',
            inputKey: 'directory'
        },
        {
            name: '-t, --types',
            flag: '-t',
            type: 'input',
            description: 'Filesystem type',
            placeholder: 'ext4'
        },
        {
            name: '-o, --options',
            flag: '-o',
            type: 'input',
            description: 'Mount options',
            placeholder: 'rw,remount'
        },
        {
            name: '-r, --read-only',
            flag: '-r',
            type: 'boolean',
            description: 'Mount the filesystem read-only'
        },
        {
            name: '-w, --rw',
            flag: '-w',
            type: 'boolean',
            description: 'Mount the filesystem read-write'
        }
    ],
    help: `Usage:
 mount [-lhV]
 mount -a [options]
 mount [options] [--source] <source> | [--target] <directory>
 mount [options] <source> <directory>
 mount <operation> <mountpoint> [<target>]

Options:
 -a, --all               mount all filesystems mentioned in fstab
 -c, --no-canonicalize   don't canonicalize paths
 -f, --fake              dry run; skip the mount(2) syscall
 -F, --fork              fork off for each device (use with -a)
 -T, --fstab <path>      alternative file to /etc/fstab
 -i, --internal-only     don't call the mount.<type> helpers
 -l, --show-labels       show also filesystem labels
 -n, --no-mtab           don't write to /etc/mtab
 -o, --options <list>    comma-separated list of mount options
 -O, --test-opts <list>  limit the set of filesystems (use with -a)
 -r, --read-only         mount the filesystem read-only (same as -o ro)
 -t, --types <list>      limit the set of filesystem types
     --source <src>      explicitly specifies source (path, label, uuid)
     --target <target>   explicitly specifies mountpoint
 -v, --verbose           say what is being done
 -w, --rw, --read-write  mount the filesystem read-write (default)

 -h, --help              display this help
 -V, --version           display version`
}
