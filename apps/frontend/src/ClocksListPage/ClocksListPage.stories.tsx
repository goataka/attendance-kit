import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { ClocksListPage } from './ClocksListPage';

const meta = {
  title: 'Pages/ClocksListPage',
  component: ClocksListPage,
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
} satisfies Meta<typeof ClocksListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFilters: Story = {
  parameters: {
    docs: {
      description: {
        story: '打刻一覧画面。ユーザーID、日時、種別でフィルタリングできます。',
      },
    },
  },
};
