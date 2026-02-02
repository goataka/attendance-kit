import { describe, it, expect } from 'vitest';
import { resolveBackendUrl } from './api';

describe('resolveBackendUrl', () => {
  it('環境変数のURLが提供された場合はそれを使用すること', () => {
    const url = resolveBackendUrl('https://api.example.com', false, undefined);

    expect(url).toBe('https://api.example.com');
  });

  it('環境変数のURLから/apiサフィックスを削除すること', () => {
    const url = resolveBackendUrl('https://api.example.com/api', false, undefined);

    expect(url).toBe('https://api.example.com');
  });

  it('環境変数のURLから/api/サフィックスを削除すること', () => {
    const url = resolveBackendUrl('https://api.example.com/api/', false, undefined);

    expect(url).toBe('https://api.example.com');
  });

  it('開発環境ではlocalhostにフォールバックすること', () => {
    const url = resolveBackendUrl(undefined, true, 'https://app.example.com');

    expect(url).toBe('http://localhost:3000');
  });

  it('本番環境ではwindowのoriginを使用すること', () => {
    const url = resolveBackendUrl(undefined, false, 'https://app.example.com');

    expect(url).toBe('https://app.example.com');
  });

  it('windowのoriginが利用できない場合はlocalhostにフォールバックすること', () => {
    const url = resolveBackendUrl(undefined, false, undefined);

    expect(url).toBe('http://localhost:3000');
  });
});
