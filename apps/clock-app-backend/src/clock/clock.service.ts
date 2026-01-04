import { Injectable } from '@nestjs/common';
import { ClockRecord, ClockInRequest, ClockOutRequest } from '@attendance-kit/types';

@Injectable()
export class ClockService {
  private records: ClockRecord[] = [];

  async clockIn(request: ClockInRequest): Promise<ClockRecord> {
    const record: ClockRecord = {
      id: Date.now().toString(),
      userId: request.userId,
      clockInTime: new Date(),
      type: 'clock-in',
    };

    this.records.push(record);
    return record;
  }

  async clockOut(request: ClockOutRequest): Promise<ClockRecord> {
    const lastRecord = this.records
      .filter(r => r.userId === request.userId)
      .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())
      .find(r => !r.clockOutTime);

    if (!lastRecord) {
      throw new Error('No active clock-in record found');
    }

    lastRecord.clockOutTime = new Date();
    lastRecord.type = 'clock-out';

    return lastRecord;
  }

  async getRecords(userId?: string): Promise<ClockRecord[]> {
    if (userId) {
      return this.records.filter(r => r.userId === userId);
    }
    return this.records;
  }
}
