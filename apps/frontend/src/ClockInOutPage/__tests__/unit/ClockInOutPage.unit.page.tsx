import { screen, fireEvent, waitFor } from '@testing-library/react';

export class ClockInOutPageUnitPage {
  getUserIdInput() {
    return screen.getByLabelText('User ID') as HTMLInputElement;
  }

  getPasswordInput() {
    return screen.getByLabelText('Password') as HTMLInputElement;
  }

  getClockInButton() {
    return screen.getByText('出勤');
  }

  getClockOutButton() {
    return screen.getByText('退勤');
  }

  getLoginButton() {
    return screen.getByText('ログイン');
  }

  getLogoutButton() {
    return screen.getByText('ログアウト');
  }

  fillUserId(userId: string) {
    const input = this.getUserIdInput();
    fireEvent.change(input, { target: { value: userId } });
  }

  fillPassword(password: string) {
    const input = this.getPasswordInput();
    fireEvent.change(input, { target: { value: password } });
  }

  clickLogin() {
    const button = this.getLoginButton();
    fireEvent.click(button);
  }

  clickClockIn() {
    const button = this.getClockInButton();
    fireEvent.click(button);
  }

  clickClockOut() {
    const button = this.getClockOutButton();
    fireEvent.click(button);
  }

  async expectSuccessMessage(message: string) {
    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  }

  async expectErrorMessage(message: string) {
    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  }

  expectLoginFormVisible() {
    expect(this.getUserIdInput()).toBeInTheDocument();
    expect(this.getPasswordInput()).toBeInTheDocument();
  }

  expectLoginFormNotVisible() {
    expect(screen.queryByLabelText('User ID')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  }

  expectClockButtonsVisible() {
    expect(this.getClockInButton()).toBeInTheDocument();
    expect(this.getClockOutButton()).toBeInTheDocument();
  }

  expectLogoutButtonVisible() {
    expect(this.getLogoutButton()).toBeInTheDocument();
  }

  async login(userId: string, password: string) {
    this.fillUserId(userId);
    this.fillPassword(password);
    this.clickLogin();
  }

  async clockIn(userId: string, password: string) {
    this.fillUserId(userId);
    this.fillPassword(password);
    this.clickClockIn();
  }
}
