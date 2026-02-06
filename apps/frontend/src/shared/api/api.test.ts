import { describe, test, expect } from 'vitest';
import { resolveBackendUrl } from './api';

describe('resolveBackendUrl', () => {
  test.each([
    {
      ケース: '環境変数のURLが提供された場合はそれを使用すること',
      envUrl: 'https://api.example.com',
      isDev: false,
      windowOrigin: undefined,
      期待値: 'https://api.example.com',
    },
    {
      ケース: '環境変数のURLから/apiサフィックスを削除すること',
      envUrl: 'https://api.example.com/api',
      isDev: false,
      windowOrigin: undefined,
      期待値: 'https://api.example.com',
    },
    {
      ケース: '環境変数のURLから/api/サフィックスを削除すること',
      envUrl: 'https://api.example.com/api/',
      isDev: false,
      windowOrigin: undefined,
      期待値: 'https://api.example.com',
    },
    {
      ケース: '開発環境ではlocalhostにフォールバックすること',
      envUrl: undefined,
      isDev: true,
      windowOrigin: 'https://app.example.com',
      期待値: 'http://localhost:3000',
    },
    {
      ケース: '本番環境ではwindowのoriginを使用すること',
      envUrl: undefined,
      isDev: false,
      windowOrigin: 'https://app.example.com',
      期待値: 'https://app.example.com',
    },
    {
      ケース:
        'windowのoriginが利用できない場合はlocalhostにフォールバックすること',
      envUrl: undefined,
      isDev: false,
      windowOrigin: undefined,
      期待値: 'http://localhost:3000',
    },
  ])('$ケース', ({ envUrl, isDev, windowOrigin, 期待値 }) => {
    const url = resolveBackendUrl(envUrl, isDev, windowOrigin);
    expect(url).toBe(期待値);
  });
});
