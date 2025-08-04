/**
 * 基础命令模块
 * 包含基本的文件和目录操作命令
 */

import { ls } from './ls.js'
import { cat } from './cat.js'
import { cd } from './cd.js'
import { mkdir } from './mkdir.js'
import { touch } from './touch.js'
import { rm } from './rm.js'
import { cp } from './cp.js'
import { mv } from './mv.js'
import { pwd } from './pwd.js'
import { find } from './find.js'
import { chmod } from './chmod.js'
import { chown } from './chown.js'
import { ln } from './ln.js'
import { echo } from './echo.js'
import { printf } from './printf.js'
import { head } from './head.js'
import { tail } from './tail.js'
import { more } from './more.js'
import { less } from './less.js'
import { whoami } from './whoami.js'
import { uname } from './uname.js'
import { which } from './which.js'
import { rmdir } from './rmdir.js'
import { date } from './date.js'
import { sleep } from './sleep.js'
import { tee } from './tee.js'
import { env } from './env.js'
import { cal } from './cal.js'
import { locate } from './locate.js'
import { file } from './file.js'
import { stat } from './stat.js'
import { chgrp } from './chgrp.js'
import { printenv } from './printenv.js'
import { whereis } from './whereis.js'
import { type } from './type.js'
import { history } from './history.js'
import { alias } from './alias.js'
import { unalias } from './unalias.js'
import { test } from './test.js'
import { expr } from './expr.js'
import { bc } from './bc.js'
import { watch } from './watch.js'
import { xargs } from './xargs.js'
import { read } from './read.js'

export const basicCommands = {
  ls,
  cat,
  cd,
  pwd,
  mkdir,
  touch,
  rm,
  cp,
  mv,
  find,
  chmod,
  chown,
  ln,
  head,
  tail,
  more,
  less,
  echo,
  printf,
  whoami,
  uname,
  which,
  sleep,
  tee,
  env,
  rmdir,
  date,
  cal,
  locate,
  file,
  stat,
  chgrp,
  printenv,
  whereis,
  type,
  history,
  alias,
  unalias,
  test,
  expr,
  bc,
  watch,
  xargs,
  read
}

export default basicCommands
