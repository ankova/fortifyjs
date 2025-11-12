import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll } from 'vitest';

const origError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0] ?? '');
    if (msg.includes('The above error occurred')) return;
    origError(...args);
  };
});
afterAll(() => {
  console.error = origError;
});
