import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../shared/contexts/AuthContext';

const meta = {
  title: 'Pages/LoginPage',
  component: LoginPage,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </BrowserRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
