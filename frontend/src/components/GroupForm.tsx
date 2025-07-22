import { useState } from 'react';
import type { Group, ScoreColumn } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../utils/grading';

interface GroupFormProps {
  group?: Group | null;
  onSave: (group: Group | Omit<Group, 'id'>) => void;
  onCancel: () => void;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  group,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(group?.name || '');
  const [learners, setLearners] = useState<Array<{name: string, learnerId: string}>>(group?.learners.map(l => ({ name: l.name, learnerId: l.learnerId })) || [{ name: '', learnerId: '1' }]);

  // Get next available learner ID
  const getNextLearnerId = () => {
    if (!group?.learners?.length) return '1';
    const existingIds = group.learners
      .map(l => parseInt(l.learnerId))
      .filter(id => !isNaN(id))
      .sort((a, b) => a - b);
    
    let nextId = 1;
    for (const id of existingIds) {
      if (id === nextId) {
        nextId++;
      } else {
        break;
      }
    }
    return nextId.toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate all learner IDs are unique
    const learnerIds = learners.map(l => l.learnerId.trim()).filter(Boolean);
    const uniqueIds = new Set(learnerIds);
    if (learnerIds.length !== uniqueIds.size) {
      alert('Each Learner ID must be unique within the group.');
      return;
    }

    const validLearners = learners
      .filter(l => l.name.trim() && l.learnerId.trim())
      .map((learner, index) => ({
        id: group?.learners[index]?.id || generateId(),
        name: learner.name.trim(),
        learnerId: learner.learnerId.trim(),
        scores: group?.learners[index]?.scores || {},
      }));

    if (validLearners.length === 0) {
      alert('Please add at least one valid learner with both name and learner ID.');
      return;
    }

    const defaultColumns: ScoreColumn[] = [
      {
        id: 'learnerId',
        name: 'Learner ID',
        type: 'score' as const,
      },
      {
        id: 'learnerName',
        name: 'Learner Name',
        type: 'score' as const,
      },
      {
        id: 'newColumn',
        name: 'New Column',
        type: 'score' as const,
      },
    ];

    const groupData = {
      name: name.trim(),
      learners: validLearners,
      columns: group?.columns || defaultColumns,
    };

    if (group) {
      onSave({ ...group, ...groupData });
    } else {
      onSave(groupData);
    }
  };

  const addLearner = () => {
    setLearners([...learners, { name: '', learnerId: getNextLearnerId() }]);
  };

  const updateLearner = (index: number, field: 'name' | 'learnerId', value: string) => {
    const updated = [...learners];
    updated[index] = { ...updated[index], [field]: value };
    setLearners(updated);
  };

  const removeLearner = (index: number) => {
    if (learners.length > 1) {
      setLearners(learners.filter((_, i) => i !== index));
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
              {learners.map((learner, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={learner.learnerId}
                    onChange={(e) => updateLearner(index, 'learnerId', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Learner ID"
                  />
                  <input
                    type="text"
                    value={learner.name}
                    onChange={(e) => updateLearner(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={`Learner name`}
                  />
                  {learners.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLearner(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove learner"
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
