import './ClockButton.css';

interface ClockInButtonProps {
  onClick: () => void;
}

function ClockInButton({ onClick }: ClockInButtonProps) {
  return (
    <button className="clock-button clock-in" onClick={onClick}>
      出勤打刻
    </button>
  );
}

export default ClockInButton;
