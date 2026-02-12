import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { App } from '../../App';

describe('Appスナップショット', () => {
  it('スナップショットと一致すること', () => {
    // Given: Appコンポーネント
    // When: Appコンポーネントをレンダリング
    const { container } = render(<App />);
    // Then: スナップショットと一致する
    expect(container).toMatchSnapshot();
  });
});
