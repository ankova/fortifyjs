import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { SecureErrorBoundary } from '../src/boundaries/SecureErrorBoundary';

function Boom() {
  throw new Error('boom');
}

describe('SecureErrorBoundary', () => {
  it('renders fallback on error', () => {
    const ui = render(
      <SecureErrorBoundary fallback={<div>fallback</div>}>
        <Boom />
      </SecureErrorBoundary>,
    );
    expect(ui.getByText('fallback')).toBeTruthy();
  });
});
