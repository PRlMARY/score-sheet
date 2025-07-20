import { useState } from 'react';
import type { Group, ScoreColumn } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../utils/grading';

interface GroupFormProps {
  group?: Group;
  onSave: (group: Group | Omit<Group, 'id'>) => void;
  onCancel: () => void;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  group,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(group?.name || '');
  const [learnerNames, setLearnerNames] = useState<string[]>(
    group?.learners.map(l => l.name) || ['']
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validLearnerNames = learnerNames.filter(n => n.trim());
    if (validLearnerNames.length === 0) return;

    const learners = validLearnerNames.map((learnerName, index) => ({
      id: group?.learners[index]?.id || generateId(),
      name: learnerName.trim(),
      scores: group?.learners[index]?.scores || {},
    }));

    const defaultColumns: ScoreColumn[] = [
      {
        id: 'learner',
        name: 'Learner',
        type: 'score' as const,
      },
    ];

    const groupData = {
      name: name.trim(),
      learners,
      columns: group?.columns || defaultColumns,
    };

    if (group) {
      onSave({ ...group, ...groupData });
    } else {
      onSave(groupData);
    }
  };

  const addLearner = () => {
    setLearnerNames([...learnerNames, '']);
  };

  const updateLearnerName = (index: number, name: string) => {
    const updated = [...learnerNames];
    updated[index] = name;
    setLearnerNames(updated);
  };

  const removeLearner = (index: number) => {
    if (learnerNames.length > 1) {
      setLearnerNames(learnerNames.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {group ? 'Edit Group' : 'Create New Group'}
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
              Group Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., CPE.A, Section 1"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Learners *
              </label>
              <button
                type="button"
                onClick={addLearner}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
              >
                <Plus size={16} />
                Add Learner
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {learnerNames.map((learnerName, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={learnerName}
                    onChange={(e) => updateLearnerName(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={`Learner ${index + 1} name`}
                  />
                  {learnerNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLearner(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
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
              {group ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
