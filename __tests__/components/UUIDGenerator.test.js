import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UUIDGeneratorClient from '../../app/uuid-generator/UUIDGenerator.client';

describe('UUIDGenerator Tool', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<UUIDGeneratorClient />);
  });

  test('renders title and description', () => {
    expect(screen.getByText('UUID Generator')).toBeInTheDocument();
  });

  test('generates a single UUID', async () => {
    const generateBtn = screen.getByText(/generate uuid/i);
    await user.click(generateBtn);
    
    await waitFor(() => {
      const uuidInput = screen.getByRole('textbox');
      const uuid = uuidInput.value;
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  test('copies UUID to clipboard', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    const generateBtn = screen.getByText(/generate uuid/i);
    await user.click(generateBtn);
    
    await waitFor(async () => {
      const copyBtn = screen.getByText(/copy/i);
      await user.click(copyBtn);
    });
    
    expect(mockClipboard.writeText).toHaveBeenCalled();
  });

  test('generates multiple UUIDs', async () => {
    const countInput = screen.getByLabelText(/count/i) || screen.getByRole('spinbutton');
    await user.clear(countInput);
    await user.type(countInput, '5');
    
    const generateBtn = screen.getByText(/generate multiple/i);
    await user.click(generateBtn);
    
    await waitFor(() => {
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('clears generated UUIDs', async () => {
    const generateBtn = screen.getByText(/generate uuid/i);
    await user.click(generateBtn);
    
    await waitFor(async () => {
      const clearBtn = screen.getByText(/clear/i);
      await user.click(clearBtn);
    });
    
    const uuidInput = screen.getByRole('textbox');
    expect(uuidInput.value).toBe('');
  });

  test('generated UUIDs are valid format', async () => {
    const generateBtn = screen.getByText(/generate uuid/i);
    await user.click(generateBtn);
    await user.click(generateBtn);
    await user.click(generateBtn);
    
    await waitFor(() => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const textboxes = screen.getAllByRole('textbox');
      textboxes.forEach(textbox => {
        if (textbox.value) {
          expect(textbox.value).toMatch(uuidRegex);
        }
      });
    });
  });

  test('handles large batch generation', async () => {
    const countInput = screen.getByLabelText(/count/i) || screen.getByRole('spinbutton');
    await user.clear(countInput);
    await user.type(countInput, '100');
    
    const generateBtn = screen.getByText(/generate multiple/i);
    await user.click(generateBtn);
    
    await waitFor(() => {
      const text = screen.getByText(/generated 100 uuids/i) || screen.getByText(/100/i);
      expect(text).toBeInTheDocument();
    });
  });
});
