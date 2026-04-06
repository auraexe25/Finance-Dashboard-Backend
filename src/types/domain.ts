export const USER_ROLES = ['Viewer', 'Analyst', 'Admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['Active', 'Inactive'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const RECORD_TYPES = ['income', 'expense'] as const;
export type RecordType = (typeof RECORD_TYPES)[number];
