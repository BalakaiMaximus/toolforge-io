import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageConverterClient from '../../app/image-converter/ImageConverter.client';
import { createMockImageFile, simulateFileDrop, expectElementToHaveText } from '../../__tests__/test-utils';

describe('ImageConverter Tool', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<ImageConverterClient />);
  });

  test('renders title and description', () => {
    expect(screen.getByText('Image Converter')).toBeInTheDocument();
    expect(screen.getByText(/convert between JPG and PNG/i)).toBeInTheDocument();
  });

  test('renders file drop zone, input, and format selection', () => {
    expect(screen.getByText(/drag and drop here/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/or click to select file/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/convert to/i)).toBeInTheDocument();
  });

  test('validates image file on drop', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = new File([''], 'document.txt', { type: 'text/plain' });
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });

  test('displays uploaded file info', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('test.png', 'image/png');
    Object.defineProperty(mockFile, 'size', { value: 5120 }); // 5KB
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/test.png/i)).toBeInTheDocument();
      expect(screen.getByText(/5 KB/i)).toBeInTheDocument();
      expect(screen.getByText(/original format: png/i)).toBeInTheDocument();
    });
  });

  test('converts JPG to PNG', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('test.jpg', 'image/jpeg');
    Object.defineProperty(mockFile, 'size', { value: 10240 });
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/original format: jpg/i)).toBeInTheDocument();
    });

    // Select PNG as target format
    const formatSelect = screen.getByLabelText(/convert to/i);
    await userEvent.selectOptions(formatSelect, 'png');

    await waitFor(() => {
      expect(screen.getByText(/converted format: png/i)).toBeInTheDocument();
      expect(screen.getByText(/download converted/i)).toBeInTheDocument();
    });
  });

  test('converts PNG to JPG', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('test.png', 'image/png');
    Object.defineProperty(mockFile, 'size', { value: 5120 });
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/original format: png/i)).toBeInTheDocument();
    });

    // Select JPG as target format
    const formatSelect = screen.getByLabelText(/convert to/i);
    await user.selectOptions(formatSelect, 'jpg');

    await waitFor(() => {
      expect(screen.getByText(/converted format: jpg/i)).toBeInTheDocument();
      expect(screen.getByText(/download converted/i)).toBeInTheDocument();
    });
  });

  test('download button works after conversion', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('test.jpg', 'image/jpeg');
    Object.defineProperty(mockFile, 'size', { value: 10240 });
    await simulateFileDrop(dropZone, [mockFile]);

    const formatSelect = screen.getByLabelText(/convert to/i);
    await user.selectOptions(formatSelect, 'png');

    await waitFor(() => {
      expect(screen.getByText(/download converted/i)).toBeInTheDocument();
    });

    const downloadBtn = screen.getByText(/download converted/i);
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
      expect(screen.getByLabelText(/convert to/i)).toHaveValue('jpg'); // Default format
    });
  });

  test('handles conversion of unsupported file types gracefully', async () => {
    const dropZone = screen.getByText(/drag and drop here/i);
    const mockFile = createMockImageFile('invalid.gif', 'image/gif'); // GIF is not explicitly supported in logic
    Object.defineProperty(mockFile, 'size', { value: 10240 });
    await simulateFileDrop(dropZone, [mockFile]);

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });
});
