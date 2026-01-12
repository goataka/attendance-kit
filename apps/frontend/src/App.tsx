import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClockInOutPage } from './ClockInOutPage/ClockInOutPage';
import { ClocksListPage } from './ClocksListPage/ClocksListPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClockInOutPage />} />
        <Route path="/clocks" element={<ClocksListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
