import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/head
jest.mock('next/head', () => {
  return function Head({ children }) {
    return children;
  };
});

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  toBlob: jest.fn((callback) => callback(new Blob(['test'], { type: 'image/jpeg' }))),
  toDataURL: jest.fn(() => 'data:image/jpeg;base64,test'),
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(100) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(100) })),
  setTransform: jest.fn(),
  drawFocusIfNeeded: jest.fn(),
  drawWidgetAsOnScreen: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  transform: jest.fn(),
  measureText: jest.fn(() => ({ width: 100 })),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  clip: jest.fn(),
  rect: jest.fn(),
  arc: jest.fn(),
  ellipse: jest.fn(),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
class MockFileReader {
  readAsDataURL(blob) {
    this.result = 'data:image/jpeg;base64,mock-image-data';
    setTimeout(() => this.onload?.({ target: this }), 0);
  }
  readAsText(blob) {
    this.result = 'mock text content';
    setTimeout(() => this.onload?.({ target: this }), 0);
  }
}
global.FileReader = MockFileReader;

// Mock Image
class MockImage {
  constructor() {
    this.width = 800;
    this.height = 600;
    setTimeout(() => this.onload?.(), 0);
  }
}
global.Image = MockImage;

// Suppress console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
