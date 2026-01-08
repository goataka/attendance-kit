import { Injectable } from '@nestjs/common';
import { ClockEvent, ClockRecord, ClockInRequest, ClockOutRequest } from '@attendance-kit/types';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class ClockService {
  private dynamoClient: DynamoDBDocumentClient;
  private tableName: string;
  private useMemoryStore: boolean;
  private memoryRecords: ClockEvent[] = [];

  constructor() {
    this.tableName = process.env.DYNAMODB_TABLE_NAME || '';
    this.useMemoryStore = !this.tableName;

    if (!this.useMemoryStore) {
      const client = new DynamoDBClient({});
      this.dynamoClient = DynamoDBDocumentClient.from(client);
    }
  }

  async clockIn(request: ClockInRequest): Promise<ClockEvent> {
    const timestamp = new Date().toISOString();
    const event: ClockEvent = {
      id: `${request.userId}-${Date.now()}`,
      userId: request.userId,
      timestamp: new Date(timestamp),
      type: 'clock-in',
      userName: request.userName,
    };

    if (this.useMemoryStore) {
      this.memoryRecords.push(event);
    } else {
      const date = timestamp.split('T')[0]; // YYYY-MM-DD format
      await this.dynamoClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            userId: event.userId,
            timestamp: timestamp,
            id: event.id,
            type: event.type,
            userName: event.userName,
            date: date,
          },
        }),
      );
    }

    return event;
  }

  async clockOut(request: ClockOutRequest): Promise<ClockEvent> {
    const timestamp = new Date().toISOString();
    const event: ClockEvent = {
      id: `${request.userId}-${Date.now()}`,
      userId: request.userId,
      timestamp: new Date(timestamp),
      type: 'clock-out',
    };

    if (this.useMemoryStore) {
      this.memoryRecords.push(event);
    } else {
      const date = timestamp.split('T')[0]; // YYYY-MM-DD format
      await this.dynamoClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            userId: event.userId,
            timestamp: timestamp,
            id: event.id,
            type: event.type,
            date: date,
          },
        }),
      );
    }

    return event;
  }

  async getRecords(userId?: string): Promise<ClockRecord[]> {
    let events: ClockEvent[] = [];

    if (this.useMemoryStore) {
      events = userId
        ? this.memoryRecords.filter(e => e.userId === userId)
        : this.memoryRecords;
    } else {
      if (userId) {
        const result = await this.dynamoClient.send(
          new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId,
            },
            ScanIndexForward: false, // Sort by timestamp descending
          }),
        );
        events = (result.Items || []).map(item => ({
          id: item.id,
          userId: item.userId,
          timestamp: new Date(item.timestamp),
          type: item.type,
          userName: item.userName,
        }));
      } else {
        // For no userId filter, scan the table (not efficient, but OK for MVP)
        // In production, you'd want to use GSI or limit this operation
        events = this.memoryRecords; // Fallback to memory for now
      }
    }

    // Convert events to display records (pair clock-in with clock-out)
    return this.pairEventsToRecords(events);
  }

  private pairEventsToRecords(events: ClockEvent[]): ClockRecord[] {
    const records: ClockRecord[] = [];
    const sortedEvents = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    let i = 0;
    while (i < sortedEvents.length) {
      const event = sortedEvents[i];

      if (event.type === 'clock-in') {
        // Look for matching clock-out
        const clockOutEvent = sortedEvents
          .slice(i + 1)
          .find(e => e.userId === event.userId && e.type === 'clock-out');

        records.push({
          id: event.id,
          userId: event.userId,
          clockInTime: event.timestamp,
          clockOutTime: clockOutEvent?.timestamp,
          type: clockOutEvent ? 'clock-out' : 'clock-in',
        });

        // Skip the clock-out event if found
        if (clockOutEvent) {
          const clockOutIndex = sortedEvents.indexOf(clockOutEvent);
          if (clockOutIndex > i) {
            sortedEvents.splice(clockOutIndex, 1);
          }
        }
      }

      i++;
    }

    return records;
  }
}
