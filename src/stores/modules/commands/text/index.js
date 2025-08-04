/**
 * 文本处理命令模块
 * 包含常用的文本处理和分析命令
 */

import { grep } from './grep.js'
import { sed } from './sed.js'
import { awk } from './awk.js'
import { sort } from './sort.js'
import { uniq } from './uniq.js'
import { wc } from './wc.js'
import { cut } from './cut.js'
import { tr } from './tr.js'
import { diff } from './diff.js'
import { join } from './join.js'
import { egrep } from './egrep.js'
import { fgrep } from './fgrep.js'
import { comm } from './comm.js'
import { paste } from './paste.js'
import { split } from './split.js'
import { csplit } from './csplit.js'

export const textCommands = {
  grep,
  sed,
  awk,
  sort,
  uniq,
  wc,
  cut,
  tr,
  diff,
  join,
  egrep,
  fgrep,
  comm,
  paste,
  split,
  csplit
}

export default textCommands
