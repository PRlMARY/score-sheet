import { Schema, model, Document } from 'mongoose';
import type { ColumnType } from '../types/type';

export interface IScoreColumn extends Document {
  name: string;
  type: ColumnType;
  sourceColumns?: string[];
}

const ScoreColumnSchema = new Schema<IScoreColumn>({
  name: { type: String, required: true },
  type: { type: String, enum: ['score', 'sum', 'grade'], required: true },
  sourceColumns: [{ type: String }],
});

export const ScoreColumn = model<IScoreColumn>('ScoreColumn', ScoreColumnSchema);