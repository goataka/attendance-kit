import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { RecordsListPage } from './RecordsListPage';

const meta = {
  title: 'Pages/RecordsListPage',
  component: RecordsListPage,
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
} satisfies Meta<typeof RecordsListPage>;

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
