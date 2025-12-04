/**
 * nc (netcat) - 任意 TCP 和 UDP 连接和监听工具
 */

export const nc = {
    name: 'nc',
    description: 'Arbitrary TCP and UDP connections and listens|任意 TCP 和 UDP 连接和监听工具',

    handler: (args, context) => {
        if (args.includes('--help') || args.includes('-h')) {
            return nc.help
        }

        const isListen = args.includes('-l')
        const isVerbose = args.includes('-v')
        const portIndex = args.indexOf('-p')
        const port = portIndex !== -1 ? args[portIndex + 1] : (args.find(a => /^\d+$/.test(a)) || '8080')
        const host = args.find(a => !a.startsWith('-') && a !== port) || 'localhost'

        let output = []

        if (isListen) {
            if (isVerbose) {
                output.push(`Listening on [0.0.0.0] (family 0, port ${port})`)
            }
            output.push(`Connection from [192.168.1.5] port ${port} [tcp/*] accepted (family 2, sport 54321)`)
            output.push('Simulated incoming data...')
        } else {
            if (isVerbose) {
                output.push(`Connection to ${host} ${port} port [tcp/*] succeeded!`)
            }
            output.push('Simulated connection established.')
            output.push('Type something to send (Ctrl+C to exit)')
        }

        return output.join('\n')
    },

    options: [
        {
            name: 'mode',
            type: 'group',
            description: 'Mode',
            options: [
                {
                    name: '-l, --listen',
                    flag: '-l',
                    type: 'boolean',
                    description: 'Listen mode, for inbound connects'
                },
                {
                    name: '-z, --zero',
                    flag: '-z',
                    type: 'boolean',
                    description: 'Zero-I/O mode [used for scanning]'
                }
            ]
        },
        {
            name: 'options',
            type: 'group',
            description: 'Options',
            options: [
                {
                    name: '-p, --source-port',
                    flag: '-p',
                    type: 'input',
                    description: 'Source port',
                    placeholder: 'port'
                },
                {
                    name: '-v, --verbose',
                    flag: '-v',
                    type: 'boolean',
                    description: 'Verbose'
                },
                {
                    name: '-u, --udp',
                    flag: '-u',
                    type: 'boolean',
                    description: 'UDP mode'
                },
                {
                    name: '-e, --exec',
                    flag: '-e',
                    type: 'input',
                    description: 'Program to exec after connect',
                    placeholder: 'filename'
                }
            ]
        },
        {
            name: 'target',
            type: 'group',
            description: 'Target',
            options: [
                {
                    name: 'hostname',
                    type: 'input',
                    description: 'Target hostname or IP',
                    placeholder: 'host',
                    inputKey: 'host'
                },
                {
                    name: 'port',
                    type: 'input',
                    description: 'Target port',
                    placeholder: 'port',
                    inputKey: 'port'
                }
            ]
        }
    ],
    help: `nc - arbitrary TCP and UDP connections and listens

Usage: nc [options] [hostname] [port[s]]

Options:
  -4		Use IPv4 only
  -6		Use IPv6 only
  -b, --allow-broadcast	Allow broadcast
  -c, --sh-exec <command>	Executes the given command via /bin/sh
  -d, --detach		Detach from stdin
  -e, --exec <command>	Executes the given command
  -k, --keep-open		Keep a listening socket open for multiple connects
  -l, --listen		Listen mode, for inbound connects
  -n, --nodns		Do not resolve hostnames via DNS
  -p, --source-port <port>	Specify source port to use
  -u, --udp		Use UDP instead of default TCP
  -v, --verbose		Set verbosity level (can be used multiple times)
  -w, --wait <seconds>	Connect timeout for netcat
  -z, --zero		Zero-I/O mode [used for scanning]`
}
