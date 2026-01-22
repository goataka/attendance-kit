import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { App } from '../../App';

describe('App Snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });
});
