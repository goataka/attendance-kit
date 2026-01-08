# 共通設定パッケージ

勤怠管理システムの共通設定を提供するパッケージ。

## 提供する設定

- `vite.config.base.ts` - ベースVite設定

## 使用方法

```typescript
import { baseConfig } from '@attendance-kit/config/vite.config.base';
import { defineConfig, mergeConfig } from 'vite';

export default mergeConfig(baseConfig, defineConfig({
  // プロジェクト固有の設定
}));
```
