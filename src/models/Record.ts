import mongoose, { Schema, Document } from 'mongoose';
import { RECORD_TYPES, RecordType } from '../types/domain';

export interface IRecord extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  notes?: string;
  categoryId?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
}

const RecordSchema: Schema<IRecord> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: RECORD_TYPES, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model<IRecord>('Record', RecordSchema);