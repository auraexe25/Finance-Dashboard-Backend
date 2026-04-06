import { ParsedQs } from 'qs';
import mongoose from 'mongoose';
import { RecordType, RECORD_TYPES, USER_ROLES, USER_STATUSES, UserRole, UserStatus } from '../types/domain';
import { createBadRequestError } from './errors';

export const ensureNonEmptyString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createBadRequestError(`${fieldName} must be a non-empty string`);
  }
  return value.trim();
};

export const ensureEmail = (value: unknown): string => {
  const email = ensureNonEmptyString(value, 'email').toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw createBadRequestError('email is invalid');
  }
  return email;
};

export const ensurePositiveNumber = (value: unknown, fieldName: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw createBadRequestError(`${fieldName} must be a positive number`);
  }
  return value;
};

export const ensureOptionalString = (value: unknown, fieldName: string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return ensureNonEmptyString(value, fieldName);
};

export const ensureDate = (value: unknown, fieldName: string): Date => {
  if (typeof value !== 'string' && !(value instanceof Date)) {
    throw createBadRequestError(`${fieldName} must be a valid date`);
  }
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    throw createBadRequestError(`${fieldName} must be a valid date`);
  }
  return dateValue;
};

export const ensureRecordType = (value: unknown): RecordType => {
  if (typeof value !== 'string' || !RECORD_TYPES.includes(value as RecordType)) {
    throw createBadRequestError(`type must be one of ${RECORD_TYPES.join(', ')}`);
  }
  return value as RecordType;
};

export const ensureUserRole = (value: unknown): UserRole => {
  if (typeof value !== 'string' || !USER_ROLES.includes(value as UserRole)) {
    throw createBadRequestError(`role must be one of ${USER_ROLES.join(', ')}`);
  }
  return value as UserRole;
};

export const ensureUserStatus = (value: unknown): UserStatus => {
  if (typeof value !== 'string' || !USER_STATUSES.includes(value as UserStatus)) {
    throw createBadRequestError(`status must be one of ${USER_STATUSES.join(', ')}`);
  }
  return value as UserStatus;
};

export const ensureObjectId = (value: string, fieldName: string): string => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createBadRequestError(`${fieldName} must be a valid ObjectId`);
  }
  return value;
};

export const getQueryString = (value: string | ParsedQs | (string | ParsedQs)[] | undefined): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
};

export const getQueryNumber = (
  value: string | ParsedQs | (string | ParsedQs)[] | undefined,
  fieldName: string,
  defaultValue: number,
  minValue: number,
  maxValue: number
): number => {
  const rawValue = getQueryString(value);
  if (rawValue === undefined) {
    return defaultValue;
  }
  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed < minValue || parsed > maxValue) {
    throw createBadRequestError(`${fieldName} must be an integer between ${minValue} and ${maxValue}`);
  }
  return parsed;
};
