import React, { useState } from 'react';
import type { Subject, GradingCriteria } from '../interfaces';
import { defaultGradingCriteria, generateId } from '../utils/grading';
import { X, Plus, Trash2 } from 'lucide-react';

interface SubjectFormProps {
  subject?: Subject;
  onSave: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  subject,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(subject?.name || '');

  const [gradingCriteria, setGradingCriteria] = useState<GradingCriteria[]>(
    subject?.gradingCriteria || defaultGradingCriteria
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),

      gradingCriteria,
      groups: subject?.groups || [],
    });
  };

  const addGradingCriteria = () => {
    const newCriteria: GradingCriteria = {
      id: generateId(),
      grade: '',
      minScore: 0,
      color: '#6b7280',
    };
    setGradingCriteria([...gradingCriteria, newCriteria]);
  };

  const updateGradingCriteria = (id: string, updates: Partial<GradingCriteria>) => {
    setGradingCriteria(criteria =>
      criteria.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  const removeGradingCriteria = (id: string) => {
    setGradingCriteria(criteria => criteria.filter(c => c.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {subject ? 'Edit Subject' : 'Create New Subject'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Computer Programming"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Grading Criteria
              </label>
              <button
                type="button"
                onClick={addGradingCriteria}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
              >
                <Plus size={16} />
                Add Grade
              </button>
            </div>
            
            <div className="space-y-3">
              {gradingCriteria.map((criteria) => (
                <div key={criteria.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={criteria.grade}
                    onChange={(e) => updateGradingCriteria(criteria.id, { grade: e.target.value })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    placeholder="A"
                  />
                  <span className="text-gray-500">≥</span>
                  <input
                    type="number"
                    value={criteria.minScore}
                    onChange={(e) => updateGradingCriteria(criteria.id, { minScore: Number(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    min="0"
                    max="100"
                  />
                  <input
                    type="color"
                    value={criteria.color}
                    onChange={(e) => updateGradingCriteria(criteria.id, { color: e.target.value })}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => removeGradingCriteria(criteria.id)}
                    className="text-red-500 hover:text-red-700 ml-auto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              {subject ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
