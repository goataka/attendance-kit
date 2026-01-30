import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { LoginPage } from './LoginPage/LoginPage';
import { ClockInOutPage } from './ClockInOutPage/ClockInOutPage';
import { ClocksListPage } from './ClocksListPage/ClocksListPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ClockInOutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/clocks" element={<ClocksListPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
