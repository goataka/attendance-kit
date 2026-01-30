/**
 * シードスクリプトの単体テスト
 * 
 * 実際のDynamoDB接続は行わず、スクリプトの基本的な動作を検証
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Seed Data Files', () => {
  it('users.jsonが存在し、有効なJSONである', () => {
    const filePath = path.join(__dirname, '../seeds/data/users.json');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(content);
    
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  it('users.jsonの各ユーザーが必須フィールドを持つ', () => {
    const filePath = path.join(__dirname, '../seeds/data/users.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(content);
    
    users.forEach((user: any) => {
      expect(user).toHaveProperty('userId');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('department');
      expect(typeof user.userId).toBe('string');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.department).toBe('string');
    });
  });

  it('clock-records.jsonが存在し、有効なJSONである', () => {
    const filePath = path.join(__dirname, '../seeds/data/clock-records.json');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = JSON.parse(content);
    
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);
  });

  it('clock-records.jsonの各レコードが必須フィールドを持つ', () => {
    const filePath = path.join(__dirname, '../seeds/data/clock-records.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = JSON.parse(content);
    
    records.forEach((record: any) => {
      expect(record).toHaveProperty('userId');
      expect(record).toHaveProperty('type');
      expect(record).toHaveProperty('daysAgo');
      expect(record).toHaveProperty('hour');
      expect(record).toHaveProperty('minute');
      expect(typeof record.userId).toBe('string');
      expect(['clock-in', 'clock-out']).toContain(record.type);
      expect(typeof record.daysAgo).toBe('number');
      expect(typeof record.hour).toBe('number');
      expect(typeof record.minute).toBe('number');
      expect(record.daysAgo).toBeGreaterThanOrEqual(0);
      expect(record.hour).toBeGreaterThanOrEqual(0);
      expect(record.hour).toBeLessThan(24);
      expect(record.minute).toBeGreaterThanOrEqual(0);
      expect(record.minute).toBeLessThan(60);
    });
  });

  it('clock-records.jsonのユーザーIDがusers.jsonに存在する', () => {
    const usersPath = path.join(__dirname, '../seeds/data/users.json');
    const recordsPath = path.join(__dirname, '../seeds/data/clock-records.json');
    
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const records = JSON.parse(fs.readFileSync(recordsPath, 'utf-8'));
    
    const validUserIds = users.map((u: any) => u.userId);
    
    records.forEach((record: any) => {
      expect(validUserIds).toContain(record.userId);
    });
  });
});
