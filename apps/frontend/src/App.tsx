import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClockInOutPage } from './ClockInOutPage/ClockInOutPage';
import { RecordsListPage } from './RecordsListPage/RecordsListPage';

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
