import { ClockRecord } from '@attendance-kit/types';
import './RecordList.css';

interface RecordListProps {
  records: ClockRecord[];
}

function RecordList({ records }: RecordListProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="record-list">
      <h2>打刻履歴</h2>
      {records.length === 0 ? (
        <p className="empty-message">打刻履歴がありません</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ユーザーID</th>
                <th>出勤時刻</th>
                <th>退勤時刻</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.userId}</td>
                  <td>{formatDate(record.clockInTime)}</td>
                  <td>{record.clockOutTime ? formatDate(record.clockOutTime) : '-'}</td>
                  <td>
                    <span className={`status ${record.clockOutTime ? 'completed' : 'in-progress'}`}>
                      {record.clockOutTime ? '完了' : '勤務中'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecordList;
