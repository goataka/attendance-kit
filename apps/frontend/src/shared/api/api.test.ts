import { describe, it, expect } from 'vitest';
import { resolveBackendUrl } from './api';

describe('resolveBackendUrl', () => {
  it('uses the environment URL when provided', () => {
    const url = resolveBackendUrl('https://api.example.com', false, undefined);

    expect(url).toBe('https://api.example.com');
  });

  it('trims the /api suffix from the environment URL when provided', () => {
    const url = resolveBackendUrl('https://api.example.com/api', false, undefined);

    expect(url).toBe('https://api.example.com');
  });

  it('trims the /api/ suffix from the environment URL when provided', () => {
    const url = resolveBackendUrl('https://api.example.com/api/', false, undefined);

    expect(url).toBe('https://api.example.com');
  });

  it('falls back to localhost in development', () => {
    const url = resolveBackendUrl(undefined, true, 'https://app.example.com');

    expect(url).toBe('http://localhost:3000');
  });

  it('uses the window origin in production when available', () => {
    const url = resolveBackendUrl(undefined, false, 'https://app.example.com');

    expect(url).toBe('https://app.example.com');
  });

  it('falls back to localhost when window origin is not available', () => {
    const url = resolveBackendUrl(undefined, false, undefined);

    expect(url).toBe('http://localhost:3000');
  });
});
