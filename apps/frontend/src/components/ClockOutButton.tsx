import './ClockButton.css';

interface ClockOutButtonProps {
  onClick: () => void;
}

function ClockOutButton({ onClick }: ClockOutButtonProps) {
  return (
    <button className="clock-button clock-out" onClick={onClick}>
      退勤打刻
    </button>
  );
}

export default ClockOutButton;
