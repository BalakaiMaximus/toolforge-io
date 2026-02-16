import {
  loadImage,
  getImageDimensions,
  validateImageFile,
  formatFileSize,
  downloadFile,
} from '../../app/lib/imageUtils';

describe('Image Utilities', () => {
  describe('validateImageFile', () => {
    test('returns valid for supported image types', () => {
      const jpgFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      const webpFile = new File([''], 'test.webp', { type: 'image/webp' });

      expect(validateImageFile(jpgFile).valid).toBe(true);
      expect(validateImageFile(pngFile).valid).toBe(true);
      expect(validateImageFile(webpFile).valid).toBe(true);
    });

    test('returns invalid for non-image files', () => {
      const txtFile = new File([''], 'test.txt', { type: 'text/plain' });
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });

      expect(validateImageFile(txtFile).valid).toBe(false);
      expect(validateImageFile(pdfFile).valid).toBe(false);
    });

    test('returns invalid for files that are too large', () => {
      // Create a mock file that's 20MB
      const largeFile = new File(['x'.repeat(20 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 20 * 1024 * 1024 });
      
      const result = validateImageFile(largeFile, 10 * 1024 * 1024);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    test('returns invalid for empty filename', () => {
      const noNameFile = new File([''], '', { type: 'image/jpeg' });
      expect(validateImageFile(noNameFile).valid).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    test('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(512)).toBe('512 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('handles decimal places option', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB');
      expect(formatFileSize(1536, 2)).toBe('1.50 KB');
    });
  });

  describe('getImageDimensions', () => {
    test('calculates dimensions for resize', () => {
      const result = getImageDimensions(1000, 800, 500, 400, true);
      expect(result.width).toBe(500);
      expect(result.height).toBe(400);
    });

    test('maintains aspect ratio when only width provided', () => {
      const result = getImageDimensions(1000, 800, 500, null, true);
      expect(result.width).toBe(500);
      expect(result.height).toBe(400); // Maintains 1000:800 ratio
    });

    test('maintains aspect ratio when only height provided', () => {
      const result = getImageDimensions(1000, 800, null, 400, true);
      expect(result.width).toBe(500); // Maintains 1000:800 ratio
      expect(result.height).toBe(400);
    });

    test('allows distortion when maintainAspectRatio is false', () => {
      const result = getImageDimensions(1000, 800, 200, 600, false);
      expect(result.width).toBe(200);
      expect(result.height).toBe(600);
    });

    test('returns original dimensions when no target provided', () => {
      const result = getImageDimensions(1000, 800, null, null, true);
      expect(result.width).toBe(1000);
      expect(result.height).toBe(800);
    });
  });
});
