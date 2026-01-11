import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { ClockInOutPage } from '../pages/ClockInOutPage';

const meta = {
  title: 'Pages/ClockInOutPage',
  component: ClockInOutPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ClockInOutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  parameters: {
    docs: {
      description: {
        story: 'デフォルトの打刻画面。テスト用アカウント情報が表示されています。',
      },
    },
  },
};
