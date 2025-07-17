import { nativeImage, Tray } from 'electron'
import { resolveResources } from 'share/main/lib/util'

export function init() {
  const icon = nativeImage.createFromPath(resolveResources('tray.png'))
  const tray = new Tray(icon)
  tray.setToolTip(`${PRODUCT_NAME} ${VERSION}`)
}
