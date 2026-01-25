import { mockApi } from './mockApi';
import { api as realApi } from './api';

// Use mock API for tests, real API for production/development
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const api = USE_MOCK_API ? mockApi : realApi;
