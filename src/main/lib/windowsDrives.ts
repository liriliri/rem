import childProcess from 'node:child_process'

type ExecFn = (
  command: string,
  callback: (error: Error | null, stdout: string, stderr: string) => void
) => void

const POWERSHELL_LIST_DRIVES_CMD =
  'powershell.exe -NoProfile -NonInteractive -Command "[System.IO.DriveInfo]::GetDrives() | ForEach-Object { $_.Name.Substring(0,2) }"'
const WMIC_LIST_DRIVES_CMD = 'wmic logicaldisk get caption'

export function parseWindowsDrives(stdout: string): string[] {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[A-Za-z]:$/.test(line))
}

function runCommand(execFn: ExecFn, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFn(command, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }

      resolve(stdout)
    })
  })
}

export async function getWindowsDrives(execFn: ExecFn = childProcess.exec): Promise<string[]> {
  try {
    const stdout = await runCommand(execFn, POWERSHELL_LIST_DRIVES_CMD)
    return parseWindowsDrives(stdout)
  } catch {
    try {
      const stdout = await runCommand(execFn, WMIC_LIST_DRIVES_CMD)
      return parseWindowsDrives(stdout)
    } catch {
      return []
    }
  }
}
