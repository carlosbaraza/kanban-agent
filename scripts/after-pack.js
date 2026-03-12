const { chmod } = require('fs/promises')
const { join } = require('path')

/**
 * After-pack hook: ensure the CLI binary in Resources/bin is executable
 */
exports.default = async function afterPack(context) {
  const appOutDir = context.appOutDir
  const resourcesDir = join(
    appOutDir,
    `${context.packager.appInfo.productFilename}.app`,
    'Contents',
    'Resources',
    'bin'
  )

  try {
    await chmod(join(resourcesDir, 'index.mjs'), 0o755)
    console.log('  • Made CLI binary executable')
  } catch (err) {
    console.warn('  • Warning: Could not chmod CLI binary:', err.message)
  }
}
