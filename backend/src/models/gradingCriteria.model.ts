import { Schema, model, Document } from 'mongoose';

export interface IGradingCriteria extends Document {
    grade: string;
    minScore: number;
    color: string;
}

const GradingCriteriaSchema = new Schema<IGradingCriteria>({
    grade: { type: String, required: true },
    minScore: { type: Number, required: true },
    color: { type: String, required: true },
});

export const GradingCriteria = model<IGradingCriteria>('GradingCriteria', GradingCriteriaSchema);
