import { describe, expect, it } from 'vitest'
import { getWindowsDrives, parseWindowsDrives } from './windowsDrives'

type ExecCallback = (error: Error | null, stdout: string, stderr: string) => void

describe('parseWindowsDrives', () => {
  it('parses valid drive labels and ignores non-drive lines', () => {
    const parsed = parseWindowsDrives('Caption\r\nC:\r\nD:\r\n\\\\?\\Volume{abc}\r\n')

    expect(parsed).toEqual(['C:', 'D:'])
  })
})

describe('getWindowsDrives', () => {
  it('uses powershell result when available', async () => {
    const execFn = (command: string, callback: ExecCallback) => {
      callback(null, 'C:\r\nD:\r\n', '')
    }

    const drives = await getWindowsDrives(execFn)

    expect(drives).toEqual(['C:', 'D:'])
  })

  it('falls back to wmic when powershell fails', async () => {
    let calls = 0
    const commands: string[] = []
    const execFn = (command: string, callback: ExecCallback) => {
      calls += 1
      commands.push(command)
      if (calls === 1) {
        callback(new Error('powershell missing'), '', '')
        return
      }
      callback(null, 'Caption\r\nE:\r\n', '')
    }

    const drives = await getWindowsDrives(execFn)

    expect(drives).toEqual(['E:'])
    expect(commands[0]).toContain('powershell.exe')
    expect(commands[1]).toBe('wmic logicaldisk get caption')
  })

  it('returns empty array when both commands fail', async () => {
    const execFn = (command: string, callback: ExecCallback) => {
      callback(new Error('command failed'), '', '')
    }

    const drives = await getWindowsDrives(execFn)

    expect(drives).toEqual([])
  })
})
