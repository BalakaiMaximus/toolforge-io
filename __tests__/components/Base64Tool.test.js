import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Base64ToolClient from '../../app/base64-tool/Base64Tool.client';

describe('Base64Tool', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<Base64ToolClient />);
  });

  test('renders title and description', () => {
    expect(screen.getByText('Base64 Tool')).toBeInTheDocument();
  });

  test('encodes text to base64', async () => {
    const input = screen.getByPlaceholderText(/enter text to encode/i);
    await user.type(input, 'Hello World');
    
    const encodeBtn = screen.getByText(/encode/i);
    await user.click(encodeBtn);
    
    await waitFor(() => {
      const output = screen.getByRole('textbox', { name: /result/i });
      expect(output.value).toBe('SGVsbG8gV29ybGQ=');
    });
  });

  test('decodes base64 to text', async () => {
    const input = screen.getByPlaceholderText(/enter text to decode/i);
    await user.type(input, 'SGVsbG8gV29ybGQ=');
    
    const decodeBtn = screen.getByText(/decode/i);
    await user.click(decodeBtn);
    
    await waitFor(() => {
      const output = screen.getByRole('textbox', { name: /result/i });
      expect(output.value).toBe('Hello World');
    });
  });

  test('toggles between encode and decode modes', async () => {
    const modeToggle = screen.getByRole('tab', { name: /decode/i });
    await user.click(modeToggle);
    
    expect(screen.getByPlaceholderText(/enter text to decode/i)).toBeInTheDocument();
  });

  test('copies result to clipboard', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    const input = screen.getByPlaceholderText(/enter text to encode/i);
    await user.type(input, 'Test');
    
    const encodeBtn = screen.getByText(/encode/i);
    await user.click(encodeBtn);
    
    await waitFor(async () => {
      const copyBtn = screen.getByText(/copy/i);
      await user.click(copyBtn);
    });
    
    expect(mockClipboard.writeText).toHaveBeenCalled();
  });

  test('clears input and output', async () => {
    const input = screen.getByPlaceholderText(/enter text to encode/i);
    await user.type(input, 'Test text');
    
    const encodeBtn = screen.getByText(/encode/i);
    await user.click(encodeBtn);
    
    const clearBtn = screen.getByText(/clear/i);
    await user.click(clearBtn);
    
    expect(input).toHaveValue('');
  });

  test('handles empty input gracefully', async () => {
    const encodeBtn = screen.getByText(/encode/i);
    await user.click(encodeBtn);
    
    await waitFor(() => {
      const output = screen.getByRole('textbox', { name: /result/i });
      expect(output.value).toBe('');
    });
  });

  test('handles special characters', async () => {
    const input = screen.getByPlaceholderText(/enter text to encode/i);
    const specialChars = 'Hello! @#$%^&*()_+';
    await user.type(input, specialChars);
    
    const encodeBtn = screen.getByText(/encode/i);
    await user.click(encodeBtn);
    
    await waitFor(() => {
      const output = screen.getByRole('textbox', { name: /result/i });
      expect(output.value.length).toBeGreaterThan(0);
    });
  });

  test('handles unicode characters', async () => {
    const input = screen.getByPlaceholderText(/enter text to encode/i);
    await user.type(input, 'Hello 世界 🌍');
    
    const encodeBtn = screen.getByText(/encode/i);
    await user.click(encodeBtn);
    
    await waitFor(() => {
      const output = screen.getByRole('textbox', { name: /result/i });
      expect(output.value.length).toBeGreaterThan(0);
    });
  });
});
