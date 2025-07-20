import { GradingCriteria, ScoreColumn, Learner } from '../types';

export const calculateSum = (
  learner: Learner,
  sourceColumns: string[]
): number => {
  return sourceColumns.reduce((sum, columnId) => {
    const score = learner.scores[columnId];
    return sum + (typeof score === 'number' ? score : 0);
  }, 0);
};

export const calculateGrade = (
  score: number,
  gradingCriteria: GradingCriteria[]
): string => {
  // Sort criteria by minScore in descending order
  const sortedCriteria = [...gradingCriteria].sort((a, b) => b.minScore - a.minScore);
  
  for (const criteria of sortedCriteria) {
    if (score >= criteria.minScore) {
      return criteria.grade;
    }
  }
  
  // If no criteria match, return the lowest grade
  return sortedCriteria[sortedCriteria.length - 1]?.grade || 'F';
};

export const getGradeColor = (
  grade: string,
  gradingCriteria: GradingCriteria[]
): string => {
  const criteria = gradingCriteria.find(c => c.grade === grade);
  return criteria?.color || '#6b7280';
};

export const defaultGradingCriteria: GradingCriteria[] = [
  { id: '1', grade: 'A', minScore: 90, color: '#10b981' },
  { id: '2', grade: 'B', minScore: 80, color: '#3b82f6' },
  { id: '3', grade: 'C', minScore: 70, color: '#f59e0b' },
  { id: '4', grade: 'D', minScore: 60, color: '#f97316' },
  { id: '5', grade: 'F', minScore: 0, color: '#ef4444' },
];

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
