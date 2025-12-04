/**
 * umount - 卸载文件系统
 */

export const umount = {
    name: 'umount',
    description: 'Unmount file systems|卸载文件系统',

    handler: (args, context) => {
        if (args.includes('--help') || args.includes('-h')) {
            return umount.help
        }

        if (args.length === 0) {
            return 'umount: usage: umount [-hV] umount -a [options] umount [options] <source> | <directory>'
        }

        const target = args.find(a => !a.startsWith('-'))

        if (target) {
            // 模拟卸载
            if (target === '/' || target === '/proc' || target === '/sys' || target === '/dev') {
                return `umount: ${target}: target is busy.`
            }
            return '' // 成功卸载不输出
        }

        return ''
    },

    options: [
        {
            name: 'target',
            type: 'input',
            description: 'Mount point or device',
            placeholder: '/mnt/data',
            inputKey: 'target'
        },
        {
            name: '-a, --all',
            flag: '-a',
            type: 'boolean',
            description: 'Unmount all filesystems'
        },
        {
            name: '-f, --force',
            flag: '-f',
            type: 'boolean',
            description: 'Force unmount (in case of an unreachable NFS system)'
        },
        {
            name: '-l, --lazy',
            flag: '-l',
            type: 'boolean',
            description: 'Lazy unmount'
        }
    ],
    help: `Usage:
 umount [-hV]
 umount -a [options]
 umount [options] <source> | <directory>

Options:
 -a, --all               unmount all filesystems
 -A, --all-targets       unmount all mountpoints for the given device in the
                           current namespace
 -c, --no-canonicalize   don't canonicalize paths
 -d, --detach-loop       if mounted loop device, also free this loop device
     --fake              dry run; skip the umount(2) syscall
 -f, --force             force unmount (in case of an unreachable NFS system)
 -i, --internal-only     don't call the umount.<type> helpers
 -l, --lazy              detach the filesystem now, clean up things later
 -n, --no-mtab           don't write to /etc/mtab
 -O, --test-opts <list>  limit the set of filesystems (use with -a)
 -R, --recursive         recursively unmount a target with all its children
 -r, --read-only         in case unmounting fails, try to remount read-only
     --source <source>   explicitly specifies source (path, label, uuid)
     --target <target>   explicitly specifies mountpoint
 -v, --verbose           say what is being done
 -q, --quiet             suppress 'not mounted' error messages

 -h, --help              display this help
 -V, --version           display version`
}
