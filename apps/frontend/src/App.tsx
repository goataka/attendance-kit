import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClockInOutPage } from './pages/ClockInOutPage';
import { RecordsListPage } from './pages/RecordsListPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClockInOutPage />} />
        <Route path="/records" element={<RecordsListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
