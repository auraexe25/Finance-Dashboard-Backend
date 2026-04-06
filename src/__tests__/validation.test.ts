import {
  ensureNonEmptyString,
  ensureEmail,
  ensurePositiveNumber,
  ensureOptionalString,
  ensureDate,
  ensureRecordType,
  ensureUserRole,
  ensureUserStatus
} from '../utils/validation';
import { createBadRequestError } from '../utils/errors';

describe('Validation Utilities', () => {
  describe('ensureNonEmptyString', () => {
    it('should accept non-empty strings', () => {
      expect(ensureNonEmptyString('valid', 'field')).toBe('valid');
    });

    it('should trim whitespace', () => {
      expect(ensureNonEmptyString('  valid  ', 'field')).toBe('valid');
    });

    it('should throw on empty string', () => {
      expect(() => ensureNonEmptyString('', 'field')).toThrow();
      expect(() => ensureNonEmptyString('   ', 'field')).toThrow();
    });

    it('should throw on non-string input', () => {
      expect(() => ensureNonEmptyString(123, 'field')).toThrow();
      expect(() => ensureNonEmptyString(null, 'field')).toThrow();
    });
  });

  describe('ensureEmail', () => {
    it('should accept valid email', () => {
      expect(ensureEmail('user@example.com')).toBe('user@example.com');
    });

    it('should convert to lowercase', () => {
      expect(ensureEmail('User@Example.COM')).toBe('user@example.com');
    });

    it('should throw on invalid email', () => {
      expect(() => ensureEmail('invalid-email')).toThrow();
      expect(() => ensureEmail('@example.com')).toThrow();
      expect(() => ensureEmail('user@')).toThrow();
    });
  });

  describe('ensurePositiveNumber', () => {
    it('should accept positive numbers', () => {
      expect(ensurePositiveNumber(100, 'amount')).toBe(100);
      expect(ensurePositiveNumber(0.01, 'amount')).toBe(0.01);
    });

    it('should throw on zero or negative', () => {
      expect(() => ensurePositiveNumber(0, 'amount')).toThrow();
      expect(() => ensurePositiveNumber(-10, 'amount')).toThrow();
    });

    it('should throw on non-number input', () => {
      expect(() => ensurePositiveNumber('100', 'amount')).toThrow();
      expect(() => ensurePositiveNumber(NaN, 'amount')).toThrow();
    });
  });

  describe('ensureOptionalString', () => {
    it('should return undefined for undefined input', () => {
      expect(ensureOptionalString(undefined, 'field')).toBeUndefined();
    });

    it('should validate and return non-empty string', () => {
      expect(ensureOptionalString('value', 'field')).toBe('value');
    });

    it('should throw on empty string', () => {
      expect(() => ensureOptionalString('', 'field')).toThrow();
    });
  });

  describe('ensureDate', () => {
    it('should accept valid date strings', () => {
      const date = ensureDate('2026-04-06', 'date');
      expect(date instanceof Date).toBe(true);
    });

    it('should accept Date objects', () => {
      const now = new Date();
      expect(ensureDate(now, 'date')).toBe(now);
    });

    it('should throw on invalid date', () => {
      expect(() => ensureDate('invalid-date', 'date')).toThrow();
      expect(() => ensureDate(12345, 'date')).toThrow();
    });
  });

  describe('ensureRecordType', () => {
    it('should accept valid record types', () => {
      expect(ensureRecordType('income')).toBe('income');
      expect(ensureRecordType('expense')).toBe('expense');
    });

    it('should throw on invalid type', () => {
      expect(() => ensureRecordType('transfer')).toThrow();
      expect(() => ensureRecordType('INCOME')).toThrow();
    });
  });

  describe('ensureUserRole', () => {
    it('should accept valid roles', () => {
      expect(ensureUserRole('Viewer')).toBe('Viewer');
      expect(ensureUserRole('Analyst')).toBe('Analyst');
      expect(ensureUserRole('Admin')).toBe('Admin');
    });

    it('should throw on invalid role', () => {
      expect(() => ensureUserRole('Moderator')).toThrow();
      expect(() => ensureUserRole('admin')).toThrow();
    });
  });

  describe('ensureUserStatus', () => {
    it('should accept valid statuses', () => {
      expect(ensureUserStatus('Active')).toBe('Active');
      expect(ensureUserStatus('Inactive')).toBe('Inactive');
    });

    it('should throw on invalid status', () => {
      expect(() => ensureUserStatus('Banned')).toThrow();
      expect(() => ensureUserStatus('active')).toThrow();
    });
  });
});
