import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JSONFormatterClient from '../../app/json-formatter/JSONFormatter.client';

describe('JSONFormatter Tool', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<JSONFormatterClient />);
  });

  test('renders title and description', () => {
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
  });

  test('formats valid JSON', async () => {
    const input = screen.getByPlaceholderText(/paste your json/i);
    const jsonInput = '{"name":"test","value":123}';
    
    await user.type(input, jsonInput);
    
    const formatBtn = screen.getByText(/format/i);
    await user.click(formatBtn);
    
    await waitFor(() => {
      const output = screen.getByRole('textbox', { name: /formatted json/i });
      expect(output).toHaveValue();
    });
  });

  test('minifies JSON', async () => {
    const input = screen.getByPlaceholderText(/paste your json/i);
    const jsonInput = '{"name": "test"}';
    
    await user.type(input, jsonInput);
    
    const minifyBtn = screen.getByText(/minify/i);
    await user.click(minifyBtn);
    
    await waitFor(() => {
      const output = screen.getByRole('textbox', { name: /formatted json/i });
      expect(output.value).not.toContain('\n');
    });
  });

  test('validates JSON', async () => {
    const input = screen.getByPlaceholderText(/paste your json/i);
    const jsonInput = '{"valid": true}';
    
    await user.type(input, jsonInput);
    
    const validateBtn = screen.getByText(/validate/i);
    await user.click(validateBtn);
    
    await waitFor(() => {
      expect(screen.getByText(/valid json/i)).toBeInTheDocument();
    });
  });

  test('shows error for invalid JSON', async () => {
    const input = screen.getByPlaceholderText(/paste your json/i);
    const invalidJson = '{"invalid: json';
    
    await user.type(input, invalidJson);
    
    const validateBtn = screen.getByText(/validate/i);
    await user.click(validateBtn);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
    });
  });

  test('copies formatted JSON', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    const input = screen.getByPlaceholderText(/paste your json/i);
    await user.type(input, '{"test":"value"}');
    
    const formatBtn = screen.getByText(/format/i);
    await user.click(formatBtn);
    
    const copyBtn = screen.getByText(/copy/i);
    await user.click(copyBtn);
    
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });

  test('clears input and output', async () => {
    const input = screen.getByPlaceholderText(/paste your json/i);
    await user.type(input, '{"test":"value"}');
    
    const clearBtn = screen.getByText(/clear/i);
    await user.click(clearBtn);
    
    expect(input).toHaveValue('');
  });

  test('handles nested objects', async () => {
    const input = screen.getByPlaceholderText(/paste your json/i);
    const nestedJson = '{"outer":{"inner":{"deep":"value"}}}';
    
    await user.type(input, nestedJson);
    
    const formatBtn = screen.getByText(/format/i);
    await user.click(formatBtn);
    
    await waitFor(() => {
      const output = screen.getByRole('textbox', { name: /formatted json/i });
      expect(output.value).toContain('outer');
      expect(output.value).toContain('inner');
    });
  });

  test('handles arrays', async () => {
    const input = screen.getByPlaceholderText(/paste your json/i);
    const arrayJson = '[1,2,3,{"key":"value"}]';
    
    await user.type(input, arrayJson);
    
    const formatBtn = screen.getByText(/format/i);
    await user.click(formatBtn);
    
    await waitFor(() => {
      const output = screen.getByRole('textbox', { name: /formatted json/i });
      expect(output.value).toContain('[');
      expect(output.value).toContain(']');
    });
  });
});
