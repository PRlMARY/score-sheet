import { Schema, model, Document } from 'mongoose';

export interface ILearner extends Document {
    learnerId: string;
    name: string;
    scores: Record<string, number | string>;
}

const LearnerSchema = new Schema<ILearner>({
    learnerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    scores: { type: Schema.Types.Mixed, default: {} },
});

export const Learner = model<ILearner>('Learner', LearnerSchema);