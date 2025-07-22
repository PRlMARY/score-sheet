import { Schema, model, Document, Types } from 'mongoose';
import type { IGradingCriteria } from './gradingCriteria.model';
import type { IGroup } from './group.model';

export interface ISubject extends Document {
    name: string;
    description: string;
    gradingCriteria: Types.ObjectId[] | IGradingCriteria[];
    groups: Types.ObjectId[] | IGroup[];
    createdAt: Date;
    updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    gradingCriteria: [{ type: Schema.Types.ObjectId, ref: 'GradingCriteria' }],
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
}, { timestamps: true });

export const Subject = model<ISubject>('Subject', SubjectSchema);