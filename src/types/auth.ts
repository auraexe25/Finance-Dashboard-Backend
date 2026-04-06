import { UserRole, UserStatus } from './domain';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  status: UserStatus;
}
