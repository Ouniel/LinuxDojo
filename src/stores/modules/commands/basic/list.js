/**
 * list - 列出目录内容 (ls -l 的别名)
 * listall - 列出所有目录内容 (ls -la 的别名)
 */

import { ls } from './ls.js'

export const list = {
    ...ls,
    name: 'list',
    description: 'List directory contents (alias for ls -l)|列出目录内容 (ls -l 的别名)',
    handler: (args, context, fs) => {
        // 强制添加 -l 参数
        const newArgs = ['-l', ...args]
        return ls.handler(newArgs, context, fs)
    }
}

export const listall = {
    ...ls,
    name: 'listall',
    description: 'List all directory contents (alias for ls -la)|列出所有目录内容 (ls -la 的别名)',
    handler: (args, context, fs) => {
        // 强制添加 -l -a 参数
        const newArgs = ['-l', '-a', ...args]
        return ls.handler(newArgs, context, fs)
    }
}
