import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WordCounterClient from '../../app/word-counter/WordCounter.client';

describe('WordCounter Tool', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<WordCounterClient />);
  });

  test('renders title and description', () => {
    expect(screen.getByText('Word Counter')).toBeInTheDocument();
    expect(screen.getByText(/Count words, characters/i)).toBeInTheDocument();
  });

  test('renders empty text area', () => {
    const textarea = screen.getByPlaceholderText(/type or paste your text/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('');
  });

  test('updates word count when text is entered', async () => {
    const textarea = screen.getByPlaceholderText(/type or paste your text/i);
    await user.type(textarea, 'Hello world test');
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // 3 words
    });
  });

  test('updates character count correctly', async () => {
    const textarea = screen.getByPlaceholderText(/type or paste your text/i);
    await user.type(textarea, 'Hello world');
    
    await waitFor(() => {
      expect(screen.getByText('11')).toBeInTheDocument(); // 11 characters
    });
  });

  test('shows reading time', async () => {
    const textarea = screen.getByPlaceholderText(/type or paste your text/i);
    // Type ~200 words
    const text = Array(200).fill('word').join(' ');
    await user.type(textarea, text);
    
    await waitFor(() => {
      expect(screen.getByText(/1 min read/i)).toBeInTheDocument();
    });
  });

  test('clear button works', async () => {
    const textarea = screen.getByPlaceholderText(/type or paste your text/i);
    await user.type(textarea, 'Some text here');
    
    const clearButton = screen.getByText(/clear/i);
    await user.click(clearButton);
    
    expect(textarea).toHaveValue('');
    expect(screen.getByText('0')).toBeInTheDocument(); // Word count reset
  });

  test('copy button copies text to clipboard', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    const textarea = screen.getByPlaceholderText(/type or paste your text/i);
    await user.type(textarea, 'Test text');
    
    const copyButton = screen.getByText(/copy/i);
    await user.click(copyButton);
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('Test text');
  });

  test('handles paste event', async () => {
    const textarea = screen.getByPlaceholderText(/type or paste your text/i);
    const pasteEvent = {
      target: { value: 'Pasted content here' },
    };
    
    fireEvent.change(textarea, pasteEvent);
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // 3 words
    });
  });

  test('handles large text input', async () => {
    const textarea = screen.getByPlaceholderText(/type or paste your text/i);
    const largeText = 'word '.repeat(10000);
    
    fireEvent.change(textarea, { target: { value: largeText } });
    
    await waitFor(() => {
      expect(screen.getByText('10000')).toBeInTheDocument();
    });
  });

  test('displays all stat cards', () => {
    expect(screen.getByText(/words/i)).toBeInTheDocument();
    expect(screen.getByText(/characters/i)).toBeInTheDocument();
    expect(screen.getByText(/sentences/i)).toBeInTheDocument();
    expect(screen.getByText(/paragraphs/i)).toBeInTheDocument();
    expect(screen.getByText(/reading time/i)).toBeInTheDocument();
  });
});
