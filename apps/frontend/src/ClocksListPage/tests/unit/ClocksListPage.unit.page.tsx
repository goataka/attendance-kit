import { screen, fireEvent, waitFor } from '@testing-library/react';

export class ClocksListPageUnitPage {
  getUserIdFilterInput() {
    return screen.getByLabelText('User ID') as HTMLInputElement;
  }

  getTypeFilterSelect() {
    return screen.getByLabelText('打刻種別') as HTMLSelectElement;
  }

  getSearchButton() {
    return screen.getByText('検索');
  }

  getResetButton() {
    return screen.getByText('リセット');
  }

  fillUserIdFilter(userId: string) {
    const input = this.getUserIdFilterInput();
    fireEvent.change(input, { target: { value: userId } });
  }

  selectTypeFilter(type: string) {
    const select = this.getTypeFilterSelect();
    fireEvent.change(select, { target: { value: type } });
  }

  clickSearch() {
    const button = this.getSearchButton();
    fireEvent.click(button);
  }

  clickReset() {
    const button = this.getResetButton();
    fireEvent.click(button);
  }

  getClockRecordRows() {
    const table = screen.getByRole('table');
    const tbody = table.querySelector('tbody');
    return tbody ? tbody.querySelectorAll('tr') : [];
  }

  async expectClockRecordsVisible() {
    await waitFor(() => {
      expect(this.getClockRecordRows().length).toBeGreaterThan(0);
    });
  }

  async expectNoRecordsMessage() {
    await waitFor(() => {
      expect(screen.getByText('打刻データがありません')).toBeInTheDocument();
    });
  }

  async expectLoadingMessage() {
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  }

  async expectErrorMessage(message: string) {
    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  }

  expectUserIdInRecords(userId: string) {
    const cells = screen.getAllByText(userId);
    expect(cells.length).toBeGreaterThan(0);
  }

  async searchByUserId(userId: string) {
    this.fillUserIdFilter(userId);
    this.clickSearch();
  }

  async searchByType(type: string) {
    this.selectTypeFilter(type);
    this.clickSearch();
  }
}
