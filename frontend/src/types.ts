export interface GradingCriteria {
  id: string;
  grade: string;
  minScore: number;
  color: string;
}

export interface ScoreColumn {
  id: string;
  name: string;
  type: 'score' | 'sum' | 'grade';
  sourceColumns?: string[]; // For sum columns
}

export interface Learner {
  id: string;
  name: string;
  scores: Record<string, number | string>;
}

export interface Group {
  id: string;
  name: string;
  learners: Learner[];
  columns: ScoreColumn[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  gradingCriteria: GradingCriteria[];
  groups: Group[];
  createdAt: Date;
  updatedAt: Date;
}

export type ColumnType = 'score' | 'sum' | 'grade';
