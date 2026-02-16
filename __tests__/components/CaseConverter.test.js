import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CaseConverterClient from '../../app/case-converter/CaseConverter.client';

describe('CaseConverter Tool', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<CaseConverterClient />);
  });

  test('renders title and description', () => {
    expect(screen.getByText('Case Converter')).toBeInTheDocument();
  });

  test('renders input textarea', () => {
    expect(screen.getByPlaceholderText(/enter your text/i)).toBeInTheDocument();
  });

  test('converts to uppercase', async () => {
    const input = screen.getByPlaceholderText(/enter your text/i);
    await user.type(input, 'hello world');
    
    const uppercaseBtn = screen.getByText(/UPPERCASE/i);
    await user.click(uppercaseBtn);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('HELLO WORLD')).toBeInTheDocument();
    });
  });

  test('converts to lowercase', async () => {
    const input = screen.getByPlaceholderText(/enter your text/i);
    await user.type(input, 'HELLO WORLD');
    
    const lowercaseBtn = screen.getByText(/lowercase/i);
    await user.click(lowercaseBtn);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('hello world')).toBeInTheDocument();
    });
  });

  test('converts to title case', async () => {
    const input = screen.getByPlaceholderText(/enter your text/i);
    await user.type(input, 'hello world');
    
    const titleCaseBtn = screen.getByText(/Title Case/i);
    await user.click(titleCaseBtn);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Hello World')).toBeInTheDocument();
    });
  });

  test('converts to camelCase', async () => {
    const input = screen.getByPlaceholderText(/enter your text/i);
    await user.type(input, 'hello world');
    
    const camelCaseBtn = screen.getByText(/camelCase/i);
    await user.click(camelCaseBtn);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('helloWorld')).toBeInTheDocument();
    });
  });

  test('converts to PascalCase', async () => {
    const input = screen.getByPlaceholderText(/enter your text/i);
    await user.type(input, 'hello world');
    
    const pascalCaseBtn = screen.getByText(/PascalCase/i);
    await user.click(pascalCaseBtn);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('HelloWorld')).toBeInTheDocument();
    });
  });

  test('converts to snake_case', async () => {
    const input = screen.getByPlaceholderText(/enter your text/i);
    await user.type(input, 'hello world');
    
    const snakeCaseBtn = screen.getByText(/snake_case/i);
    await user.click(snakeCaseBtn);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('hello_world')).toBeInTheDocument();
    });
  });

  test('converts to kebab-case', async () => {
    const input = screen.getByPlaceholderText(/enter your text/i);
    await user.type(input, 'hello world');
    
    const kebabCaseBtn = screen.getByText(/kebab-case/i);
    await user.click(kebabCaseBtn);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('hello-world')).toBeInTheDocument();
    });
  });

  test('copies result to clipboard', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    const input = screen.getByPlaceholderText(/enter your text/i);
    await user.type(input, 'test');
    
    const copyBtn = screen.getByText(/copy result/i);
    await user.click(copyBtn);
    
    expect(mockClipboard.writeText).toHaveBeenCalled();
  });

  test('clears input and output', async () => {
    const input = screen.getByPlaceholderText(/enter your text/i);
    await user.type(input, 'test text');
    
    const uppercaseBtn = screen.getByText(/UPPERCASE/i);
    await user.click(uppercaseBtn);
    
    const clearBtn = screen.getByText(/clear/i);
    await user.click(clearBtn);
    
    expect(input).toHaveValue('');
  });
});
