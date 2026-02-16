import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Test utilities for ToolForge components
 */

/**
 * Create a mock file for testing file uploads
 */
export function createMockFile(name, type, size = 1024) {
  const blob = new Blob(['mock file content'], { type });
  blob.name = name;
  blob.size = size;
  return new File([blob], name, { type });
}

/**
 * Create a mock image file
 */
export function createMockImageFile(name = 'test.jpg', type = 'image/jpeg') {
  return createMockFile(name, type, 10240);
}

/**
 * Simulate file drop on a drop zone
 */
export async function simulateFileDrop(dropZone, files) {
  const dataTransfer = {
    files,
    items: files.map(file => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })),
    types: ['Files'],
  };

  await userEvent.click(dropZone);
  
  // Trigger drag events
  const dragEnterEvent = new Event('dragenter', { bubbles: true });
  Object.defineProperty(dragEnterEvent, 'dataTransfer', { value: dataTransfer });
  dropZone.dispatchEvent(dragEnterEvent);

  const dragOverEvent = new Event('dragover', { bubbles: true });
  Object.defineProperty(dragOverEvent, 'dataTransfer', { value: dataTransfer });
  dropZone.dispatchEvent(dragOverEvent);

  const dropEvent = new Event('drop', { bubbles: true });
  Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
  dropZone.dispatchEvent(dropEvent);
}

/**
 * Simulate file selection via input
 */
export async function simulateFileInput(input, files) {
  await userEvent.upload(input, files);
}

/**
 * Wait for an element to be removed
 */
export async function waitForElementToBeRemoved(callback) {
  return waitFor(callback, { timeout: 5000 });
}

/**
 * Check if an element has the expected text content
 */
export function expectElementToHaveText(testId, text) {
  expect(screen.getByTestId(testId)).toHaveTextContent(text);
}

/**
 * Common test data
 */
export const testData = {
  sampleText: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.`,
  
  sampleJSON: {
    name: 'test',
    value: 123,
    nested: {
      array: [1, 2, 3],
      boolean: true,
    },
  },
  
  invalidJSON: '{"invalid: json",
  
  base64Text: 'Hello World!',
  base64Encoded: 'SGVsbG8gV29ybGQh',
};

/**
 * Performance test helper
 */
export function measurePerformance(fn, iterations = 100) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return end - start;
}
