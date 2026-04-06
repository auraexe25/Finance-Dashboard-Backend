import mongoose, { Schema, Document } from 'mongoose';
import { USER_ROLES, USER_STATUSES, UserRole, UserStatus } from '../types/domain';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  lastBalanceUpdate: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: USER_ROLES, default: 'Viewer' },
  status: { type: String, enum: USER_STATUSES, default: 'Active' },
  balance: { type: Number, default: 0 },
  lastBalanceUpdate: { type: Date, default: () => new Date() }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);