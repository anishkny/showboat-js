const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const platform = process.platform;
const binaryName = platform === 'win32' ? 'showboat.exe' : 'showboat';
const binaryPath = path.join(__dirname, 'bin', binaryName);

/**
 * Execute showboat with the given arguments
 * @param {string[]} args - Arguments to pass to showboat
 * @param {object} options - Options for child_process.execFile
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function showboat(args = [], options = {}) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(binaryPath)) {
      reject(new Error('showboat binary not found. Please run: npm install'));
      return;
    }

    execFile(binaryPath, args, options, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

module.exports = showboat;
module.exports.binaryPath = binaryPath;
