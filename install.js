#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const zlib = require('zlib');
const tar = require('tar');

const streamPipeline = promisify(pipeline);

const SHOWBOAT_VERSION = '0.4.0';
const BASE_URL = `https://github.com/simonw/showboat/releases/download/v${SHOWBOAT_VERSION}`;

function getPlatformInfo() {
  const platform = process.platform;
  const arch = process.arch;

  let platformName, archName, extension;

  // Map Node.js platform to showboat platform naming
  switch (platform) {
    case 'darwin':
      platformName = 'darwin';
      break;
    case 'linux':
      platformName = 'linux';
      break;
    case 'win32':
      platformName = 'windows';
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  // Map Node.js arch to showboat arch naming
  switch (arch) {
    case 'x64':
      archName = 'amd64';
      break;
    case 'arm64':
      archName = 'arm64';
      break;
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }

  // Determine file extension
  extension = platform === 'win32' ? 'zip' : 'tar.gz';

  return { platformName, archName, extension };
}

function getDownloadURL() {
  const { platformName, archName, extension } = getPlatformInfo();
  const filename = `showboat-${platformName}-${archName}.${extension}`;
  return `${BASE_URL}/${filename}`;
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Failed to clean up partial download:', unlinkErr.message);
          }
        });
        reject(err);
      });
    }).on('error', reject);
  });
}

async function extractTarGz(archivePath, destDir) {
  await tar.extract({
    file: archivePath,
    cwd: destDir,
  });
}

async function extractZip(archivePath, destDir) {
  // For zip files, we use adm-zip to extract the archive
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(archivePath);
  zip.extractAllTo(destDir, true);
}

async function install() {
  try {
    console.log('Installing showboat...');
    
    const { platformName, extension } = getPlatformInfo();
    const url = getDownloadURL();
    
    console.log(`Downloading from: ${url}`);
    
    const binDir = path.join(__dirname, 'bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    const archivePath = path.join(binDir, `showboat.${extension}`);
    
    await downloadFile(url, archivePath);
    console.log('Download complete. Extracting...');

    if (extension === 'tar.gz') {
      await extractTarGz(archivePath, binDir);
    } else if (extension === 'zip') {
      await extractZip(archivePath, binDir);
    }

    // Clean up archive
    fs.unlinkSync(archivePath);

    // Make the binary executable (Unix-like systems)
    const binaryName = platformName === 'windows' ? 'showboat.exe' : 'showboat';
    const binaryPath = path.join(binDir, binaryName);
    
    if (platformName !== 'windows') {
      fs.chmodSync(binaryPath, '755');
    }

    console.log('showboat installed successfully!');
  } catch (error) {
    console.error('Installation failed:', error.message);
    process.exit(1);
  }
}

install();
