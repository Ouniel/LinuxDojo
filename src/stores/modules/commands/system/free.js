/**
 * free - 显示系统中已用和空闲的内存量
 */

export const free = {
    name: 'free',
    description: 'Display amount of free and used memory in the system|显示系统中已用和空闲的内存量',

    handler: (args, context) => {
        if (args.includes('--help')) {
            return free.help
        }

        const isHuman = args.includes('-h') || args.includes('--human')
        const isMega = args.includes('-m') || args.includes('--mega')
        const isGiga = args.includes('-g') || args.includes('--giga')

        // 模拟内存数据 (单位: KB)
        const total = 16384000
        const used = 8456120
        const freeMem = 2546880
        const shared = 120456
        const buffCache = 5381000
        const available = 7546880

        const swapTotal = 2097152
        const swapUsed = 0
        const swapFree = 2097152

        let unit = 1
        let unitStr = ''

        if (isHuman) {
            // 简单模拟 -h，实际逻辑更复杂
            unit = 1024 * 1024
            unitStr = 'G'
        } else if (isGiga) {
            unit = 1024 * 1024
            unitStr = ''
        } else if (isMega) {
            unit = 1024
            unitStr = ''
        }

        const format = (num) => {
            if (isHuman) {
                if (num > 1024 * 1024) return (num / (1024 * 1024)).toFixed(1) + 'G'
                if (num > 1024) return (num / 1024).toFixed(1) + 'M'
                return num + 'K'
            }
            return Math.round(num / unit)
        }

        let output = []
        output.push('              total        used        free      shared  buff/cache   available')
        output.push(`Mem:    ${format(total).toString().padStart(11)} ${format(used).toString().padStart(11)} ${format(freeMem).toString().padStart(11)} ${format(shared).toString().padStart(11)} ${format(buffCache).toString().padStart(11)} ${format(available).toString().padStart(11)}`)
        output.push(`Swap:   ${format(swapTotal).toString().padStart(11)} ${format(swapUsed).toString().padStart(11)} ${format(swapFree).toString().padStart(11)}`)

        return output.join('\n')
    },

    options: [
        {
            name: '-h, --human',
            flag: '-h',
            type: 'boolean',
            description: 'Show human-readable output'
        },
        {
            name: '-m, --mega',
            flag: '-m',
            type: 'boolean',
            description: 'Show output in megabytes'
        },
        {
            name: '-g, --giga',
            flag: '-g',
            type: 'boolean',
            description: 'Show output in gigabytes'
        },
        {
            name: '-t, --total',
            flag: '-t',
            type: 'boolean',
            description: 'Show total for RAM + swap'
        },
        {
            name: '-s, --seconds',
            flag: '-s',
            type: 'input',
            description: 'Repeat printing every N seconds',
            placeholder: 'seconds'
        }
    ],
    help: `Usage:
 free [options]

Options:
 -b, --bytes         show output in bytes
 -k, --kilo          show output in kilobytes
 -m, --mega          show output in megabytes
 -g, --giga          show output in gigabytes
     --tera          show output in terabytes
     --peta          show output in petabytes
 -h, --human         show human-readable output
     --si            use powers of 1000 not 1024
 -l, --lohi          show detailed low and high memory statistics
 -t, --total         show total for RAM + swap
 -s N, --seconds N   repeat printing every N seconds
 -c N, --count N     repeat printing N times, then exit
 -w, --wide          wide output

     --help     display this help and exit
 -V, --version  output version information and exit`
}
