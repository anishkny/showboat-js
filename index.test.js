const showboat = require('./index');
const fs = require('fs');
const path = require('path');

describe('showboat module', () => {
  const binaryName = process.platform === 'win32' ? 'showboat.exe' : 'showboat';
  const expectedBinaryPath = path.join(__dirname, 'bin', binaryName);

  describe('binaryPath', () => {
    it('should export the correct binary path', () => {
      expect(showboat.binaryPath).toBe(expectedBinaryPath);
    });

    it('should point to a path in the bin directory', () => {
      expect(showboat.binaryPath).toContain('bin');
      expect(showboat.binaryPath).toContain(binaryName);
    });
  });

  describe('showboat function', () => {
    it('should be a function', () => {
      expect(typeof showboat).toBe('function');
    });

    it('should reject when binary does not exist', async () => {
      // Check if binary exists first
      if (!fs.existsSync(expectedBinaryPath)) {
        await expect(showboat(['--version'])).rejects.toThrow('showboat binary not found');
      } else {
        // If binary exists, this test is not applicable
        expect(true).toBe(true);
      }
    });

    // Integration test - only runs if binary is installed
    if (fs.existsSync(expectedBinaryPath)) {
      it('should execute showboat binary with --version flag', async () => {
        const result = await showboat(['--version']);
        expect(result).toHaveProperty('stdout');
        expect(result).toHaveProperty('stderr');
        expect(result.stdout).toContain('0.4.0');
      }, 10000);

      it('should execute showboat binary with --help flag', async () => {
        const result = await showboat(['--help']);
        expect(result).toHaveProperty('stdout');
        expect(result.stdout).toContain('showboat');
      }, 10000);
    }

    it('should return a promise', () => {
      const mockBinaryPath = showboat.binaryPath;
      // Even if it rejects, it should still be a promise
      const result = showboat(['--version']);
      expect(result).toBeInstanceOf(Promise);
      
      // Clean up the promise to prevent unhandled rejection
      result.catch(() => {});
    });

    it('should accept empty arguments array', () => {
      const result = showboat([]);
      expect(result).toBeInstanceOf(Promise);
      
      // Clean up the promise to prevent unhandled rejection
      result.catch(() => {});
    });

    it('should accept options parameter', () => {
      const result = showboat(['--version'], { timeout: 5000 });
      expect(result).toBeInstanceOf(Promise);
      
      // Clean up the promise to prevent unhandled rejection
      result.catch(() => {});
    });
  });
});
