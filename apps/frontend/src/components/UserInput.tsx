import './UserInput.css';

interface UserInputProps {
  userId: string;
  userName: string;
  onUserIdChange: (value: string) => void;
  onUserNameChange: (value: string) => void;
}

function UserInput({ userId, userName, onUserIdChange, onUserNameChange }: UserInputProps) {
  return (
    <div className="user-input">
      <div className="input-group">
        <label htmlFor="userId">ユーザーID</label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={(e) => onUserIdChange(e.target.value)}
          placeholder="例: user001"
        />
      </div>
      <div className="input-group">
        <label htmlFor="userName">名前</label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          placeholder="例: 山田太郎"
        />
      </div>
    </div>
  );
}

export default UserInput;
