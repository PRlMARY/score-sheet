import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  password: string;
  currentSessionId?: string;
  sessionExpiresAt?: Date;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  currentSessionId: { type: String, sparse: true },
  sessionExpiresAt: { type: Date },
  lastLoginAt: { type: Date },
}, { timestamps: true });

export const User = model<IUser>('User', UserSchema);