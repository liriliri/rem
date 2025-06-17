import once from 'licia/once'
import childProcess, { ChildProcessByStdio } from 'node:child_process'
import { Readable } from 'node:stream'
import { handleEvent, resolveUnpack } from 'share/main/lib/util'
import getPort from 'licia/getPort'
import log from 'share/common/log'
import { app } from 'electron'

const logger = log('rclone')

let port = 5572
let subprocess: ChildProcessByStdio<null, Readable, Readable>

export async function start() {
  initRpc()

  const rclonePath = resolveUnpack('rclone/rclone')

  port = await getPort(port, '127.0.0.1')

  const args = ['rcd', '--rc-addr', `127.0.0.1:${port}`, '--rc-no-auth']

  subprocess = childProcess.spawn(rclonePath, args, {
    windowsHide: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  })
  subprocess.stdout.on('data', (data) => process.stdout.write(data))
  subprocess.stderr.on('data', (data) => process.stderr.write(data))
  subprocess.on('exit', (code, signal) => {
    logger.info('Rclone exit', code, signal)
  })
  subprocess.on('error', (err) => {
    logger.info('Rclone error', err)
  })

  app.on('will-quit', () => subprocess.kill())
}

const initRpc = once(() => {
  handleEvent('getRclonePort', () => port)
})
