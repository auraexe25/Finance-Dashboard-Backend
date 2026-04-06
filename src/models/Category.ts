import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdBy: mongoose.Types.ObjectId;
  isSystem: boolean;
}

const CategorySchema: Schema<ICategory> = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  color: { type: String, default: '#6366f1' },
  icon: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

CategorySchema.index({ createdBy: 1, name: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
