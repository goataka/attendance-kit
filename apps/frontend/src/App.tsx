import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { LoginPage } from './LoginPage/LoginPage';
import { ClockInOutPage } from './ClockInOutPage/ClockInOutPage';
import { ClocksListPage } from './ClocksListPage/ClocksListPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/clock" element={<ClockInOutPage />} />
          <Route path="/clocks" element={<ClocksListPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
