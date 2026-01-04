import { useState } from 'react';
import UserInput from './components/UserInput';
import ClockInButton from './components/ClockInButton';
import ClockOutButton from './components/ClockOutButton';
import RecordList from './components/RecordList';
import { ClockRecord } from '@attendance-kit/types';
import './App.css';

function App() {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [records, setRecords] = useState<ClockRecord[]>([]);

  const handleClockIn = async () => {
    if (!userId || !userName) {
      alert('ユーザーIDと名前を入力してください');
      return;
    }

    const newRecord: ClockRecord = {
      id: Date.now().toString(),
      userId,
      clockInTime: new Date(),
      type: 'clock-in',
    };

    setRecords([newRecord, ...records]);
    alert('出勤打刻しました');
  };

  const handleClockOut = async () => {
    if (!userId) {
      alert('ユーザーIDを入力してください');
      return;
    }

    const lastRecord = records.find(r => r.userId === userId && !r.clockOutTime);
    if (!lastRecord) {
      alert('出勤打刻が見つかりません');
      return;
    }

    const updatedRecord: ClockRecord = {
      ...lastRecord,
      clockOutTime: new Date(),
      type: 'clock-out',
    };

    setRecords(records.map(r => r.id === lastRecord.id ? updatedRecord : r));
    alert('退勤打刻しました');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>勤怠管理システム</h1>
      </header>
      <main className="app-main">
        <div className="clock-section">
          <UserInput
            userId={userId}
            userName={userName}
            onUserIdChange={setUserId}
            onUserNameChange={setUserName}
          />
          <div className="button-group">
            <ClockInButton onClick={handleClockIn} />
            <ClockOutButton onClick={handleClockOut} />
          </div>
        </div>
        <RecordList records={records} />
      </main>
    </div>
  );
}

export default App;
