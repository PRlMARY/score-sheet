import { Schema, model, Document, Types } from 'mongoose';
import type { ILearner } from './learner.model';
import type { IScoreColumn } from './scoreColumn.model';

export interface IGroup extends Document {
    name: string;
    learners: Types.ObjectId[] | ILearner[];
    columns: Types.ObjectId[] | IScoreColumn[];
}

const GroupSchema = new Schema<IGroup>({
    name: { type: String, required: true },
    learners: [{ type: Schema.Types.ObjectId, ref: 'Learner' }],
    columns: [{ type: Schema.Types.ObjectId, ref: 'ScoreColumn' }],
});

export const Group = model<IGroup>('Group', GroupSchema);