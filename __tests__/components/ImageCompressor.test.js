import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageCompressorClient from '../../app/image-compressor/ImageCompressor.client';
import { createMockImageFile, simulateFileDrop, waitForElementToBeRemoved, expectElementToHaveText } from '../../__tests__/test-utils';

describe('ImageCompressor Tool', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<ImageCompressorClient />);
  });

  test('renders title and description', () => {
    expect(screen.getByText('Image Compressor')).toBeInTheDocument();
    expect(screen.getByText(/reduce image file size/i)).toBeInTheDocument();
  });

  test('renders file drop zone and input', () => {
    expect(screen.getByText(/drag and drop here/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/or click to select file/i)).toBeInTheDocument();
  });

  test('renders quality slider', () => {
    expect(screen.getByLabelText(/compression quality/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('75')).toBeInTheDocument(); // Default value
  });

  test('validates image file on drop', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = new File([''], 'document.txt', { type: 'text/plain' });
    
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });

  test('validates image file on input selection', async () => {
    const fileInput = screen.getByLabelText(/or click to select file/i);
    const mockFile = new File([''], 'document.txt', { type: 'text/plain' });

    await userEvent.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });

  test('displays uploaded image and stats', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('test.jpg', 'image/jpeg');
    Object.defineProperty(mockFile, 'size', { value: 10240 }); // 10KB

    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/test.jpg/i)).toBeInTheDocument();
      expect(screen.getByText(/10 KB/i)).toBeInTheDocument();
      expect(screen.getByText(/original dimensions:/i)).toBeInTheDocument();
      expect(screen.getByText(/800 x 600/i)).toBeInTheDocument(); // Default dimensions from mock
    });
  });

  test('compresses image when quality is changed', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('test.jpg', 'image/jpeg');
    Object.defineProperty(mockFile, 'size', { value: 10240 });
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/original dimensions:/i)).toBeInTheDocument();
    });

    const qualitySlider = screen.getByLabelText(/compression quality/i);
    // Change quality from default 75 to 50
    fireEvent.change(qualitySlider, { target: { value: 50 } });

    await waitFor(() => {
      expect(screen.getByText(/compressed dimensions:/i)).toBeInTheDocument();
      expect(screen.getByText(/compressed size:/i)).toBeInTheDocument();
    });
  });

  test('download button works after compression', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('test.jpg', 'image/jpeg');
    Object.defineProperty(mockFile, 'size', { value: 10240 });
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/download compressed/i)).toBeInTheDocument();
    });

    const downloadBtn = screen.getByText(/download compressed/i);
    await user.click(downloadBtn);
    
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  test('clear button resets the state', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('test.jpg', 'image/jpeg');
    Object.defineProperty(mockFile, 'size', { value: 10240 });
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/test.jpg/i)).toBeInTheDocument();
    });

    const clearBtn = screen.getByText(/clear/i);
    await user.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText(/drag and drop here/i)).toBeInTheDocument();
      expect(screen.queryByText(/test.jpg/i)).not.toBeInTheDocument();
    });
  });

  test('handles large files correctly', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    // Mock a 15MB file, which is > max 10MB limit for validation
    const largeFile = createMockImageFile('large.jpg', 'image/jpeg');
    Object.defineProperty(largeFile, 'size', { value: 15 * 1024 * 1024 });
    
    await simulateFileDrop(dropZone, [largeFile]);

    await waitFor(() => {
      expect(screen.getByText(/file is too large/i)).toBeInTheDocument();
    });
  });

  test('displays correct dimensions for PNG', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('test.png', 'image/png');
    Object.defineProperty(mockFile, 'size', { value: 5120 }); // 5KB
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/original dimensions:/i)).toBeInTheDocument();
      expect(screen.getByText(/800 x 600/i)).toBeInTheDocument(); // Mock dimensions
    });
  });
});
