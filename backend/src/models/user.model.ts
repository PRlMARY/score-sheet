import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });

UserSchema.index({ username: 1 });

export const User = model<IUser>('User', UserSchema);