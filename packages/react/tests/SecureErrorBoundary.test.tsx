import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { SecureErrorBoundary } from '../src/boundaries/SecureErrorBoundary';

const Bomb: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Boom');
  }
  return <div>Child OK</div>;
};

describe('SecureErrorBoundary', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // keep spy installed, just reset call history
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error occurs', () => {
    render(
      <SecureErrorBoundary fallback={<div>Fallback</div>}>
        <Bomb />
      </SecureErrorBoundary>,
    );
    expect(screen.getByText('Child OK')).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('renders the fallback and calls onError when a child throws', () => {
    const onError = vi.fn();

    render(
      <SecureErrorBoundary fallback={<div>Fallback</div>} onError={onError}>
        <Bomb shouldThrow />
      </SecureErrorBoundary>,
    );

    // Fallback should be shown after error
    expect(screen.getByText('Fallback')).toBeInTheDocument();

    // onError should be called (React StrictMode may call lifecycle twice in dev)
    expect(onError).toHaveBeenCalled();

    const [errorArg, infoArg] = onError.mock.lastCall!;
    expect(errorArg).toBeInstanceOf(Error);
    expect((errorArg as Error).message).toBe('Boom');
    expect(infoArg).toBeDefined();
    // React provides a componentStack string on ErrorInfo
    expect(typeof infoArg!.componentStack).toBe('string');
  });
});
