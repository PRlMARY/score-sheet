import { useState, useEffect } from 'react';
import type { Group, GradingCriteria, ScoreColumn, ColumnType } from '../types';
import { ArrowLeft, Plus, Settings, Trash2, Calculator, Award, Edit, UserPlus } from 'lucide-react';
import { calculateSum, calculateGrade, getGradeColor, generateId } from '../utils/grading';
import { ColumnForm } from './ColumnForm';

// Learner Form Component
interface LearnerFormProps {
  learner: { id?: string; name: string; learnerId: string } | null;
  onSave: (learner: { id?: string; name: string; learnerId: string }) => void;
  onCancel: () => void;
  defaultLearnerId: string;
}

const LearnerForm: React.FC<LearnerFormProps> = ({ learner, onSave, onCancel, defaultLearnerId }) => {
  const [formData, setFormData] = useState({
    name: learner?.name || '',
    learnerId: learner?.learnerId || defaultLearnerId
  });

  useEffect(() => {
    if (learner) {
      setFormData({
        name: learner.name,
        learnerId: learner.learnerId
      });
    } else {
      setFormData({
        name: '',
        learnerId: defaultLearnerId
      });
    }
  }, [learner, defaultLearnerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.learnerId.trim()) {
      alert('Please fill in all fields');
      return;
    }
    onSave({
      id: learner?.id,
      name: formData.name.trim(),
      learnerId: formData.learnerId.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {learner?.id ? 'Edit Learner' : 'Add New Learner'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="learnerId" className="block text-sm font-medium text-gray-700 mb-1">
              Learner ID *
            </label>
            <input
              type="text"
              id="learnerId"
              name="learnerId"
              value={formData.learnerId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Learner Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {learner?.id ? 'Update' : 'Add'} Learner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ScoreTableProps {
  group: Group;
  gradingCriteria: GradingCriteria[];
  onBack: () => void;
  onUpdateGroup: (group: Group) => void;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({
  group,
  gradingCriteria,
  onBack,
  onUpdateGroup,
}) => {
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ScoreColumn | null>(null);
  const [showLearnerForm, setShowLearnerForm] = useState(false);
  const [editingLearner, setEditingLearner] = useState<{id?: string, name: string, learnerId: string} | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [updatedGroup, setUpdatedGroup] = useState<Group>(group);

  useEffect(() => {
    // Recalculate all computed columns when scores change
    const newGroup = { ...updatedGroup };
    
    newGroup.learners = newGroup.learners.map(learner => {
      const newScores = { ...learner.scores };
      
      // Calculate sum columns
      newGroup.columns.filter(col => col.type === 'sum').forEach(col => {
        if (col.sourceColumns) {
          newScores[col.id] = calculateSum(learner, col.sourceColumns);
        }
      });
      
      // Calculate grade columns
      newGroup.columns.filter(col => col.type === 'grade').forEach(col => {
        if (col.sourceColumns && col.sourceColumns.length > 0) {
          const sourceScore = newScores[col.sourceColumns[0]];
          if (typeof sourceScore === 'number') {
            newScores[col.id] = calculateGrade(sourceScore, gradingCriteria);
          }
        }
      });
      
      return { ...learner, scores: newScores };
    });
    
    setUpdatedGroup(newGroup);
  }, [gradingCriteria]);

  const handleScoreChange = (learnerId: string, columnId: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numValue)) return;

    const newGroup = { ...updatedGroup };
    newGroup.learners = newGroup.learners.map(learner => {
      if (learner.id === learnerId) {
        const newScores = { ...learner.scores, [columnId]: numValue };
        
        // Recalculate dependent columns
        newGroup.columns.filter(col => col.type === 'sum').forEach(col => {
          if (col.sourceColumns) {
            newScores[col.id] = calculateSum({ ...learner, scores: newScores }, col.sourceColumns);
          }
        });
        
        newGroup.columns.filter(col => col.type === 'grade').forEach(col => {
          if (col.sourceColumns && col.sourceColumns.length > 0) {
            const sourceScore = newScores[col.sourceColumns[0]];
            if (typeof sourceScore === 'number') {
              newScores[col.id] = calculateGrade(sourceScore, gradingCriteria);
            }
          }
        });
        
        return { ...learner, scores: newScores };
      }
      return learner;
    });
    
    setUpdatedGroup(newGroup);
    onUpdateGroup(newGroup);
  };

  const handleAddColumn = (columnData: Omit<ScoreColumn, 'id'>) => {
    const newColumn: ScoreColumn = {
      ...columnData,
      id: generateId(),
      sourceColumns: columnData.sourceColumns ?? [],
    };
    
    const newGroup = { ...updatedGroup };
    const columns = [...newGroup.columns];
    
    // Separate different types of columns
    const scoreAndSumColumns = columns.filter(col => col.type === 'score' || col.type === 'sum');
    const gradeColumns = columns.filter(col => col.type === 'grade');
    
    // Insert new column based on its type
    if (newColumn.type === 'score' || newColumn.type === 'sum') {
      // Add to the end of score/sum columns, before grade columns
      scoreAndSumColumns.push(newColumn);
      newGroup.columns = [...scoreAndSumColumns, ...gradeColumns];
    } else {
      // Grade columns go to the end
      newGroup.columns = [...scoreAndSumColumns, ...gradeColumns, newColumn];
    }
    
    setUpdatedGroup(newGroup);
    onUpdateGroup(newGroup);
    setShowColumnForm(false);
  };

  const handleUpdateColumn = (updatedColumn: ScoreColumn) => {
    const newGroup = {
      ...updatedGroup,
      columns: updatedGroup.columns.map(col => 
        col.id === updatedColumn.id 
          ? { 
              ...updatedColumn, 
              sourceColumns: updatedColumn.sourceColumns ?? [] 
            }
          : col
      ),
    };
    
    setUpdatedGroup(newGroup);
    onUpdateGroup(newGroup);
    setEditingColumn(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (confirm('Are you sure you want to delete this column? This will remove all associated data.')) {
      const newGroup = {
        ...updatedGroup,
        columns: updatedGroup.columns.filter(col => col.id !== columnId),
        learners: updatedGroup.learners.map(learner => {
          const newScores = { ...learner.scores };
          delete newScores[columnId];
          return { ...learner, scores: newScores };
        }),
      };
      
      setUpdatedGroup(newGroup);
      onUpdateGroup(newGroup);
    }
  };

  const getColumnIcon = (type: ColumnType) => {
    switch (type) {
      case 'sum':
        return <Calculator size={16} className="text-blue-600" />;
      case 'grade':
        return <Award size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  // Separate fixed columns from reorderable columns
  const fixedColumns = [
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
  ];

  // Separate columns for rendering: score and sum are reorderable, grade columns go at end
  const reorderableColumns = updatedGroup.columns.filter(
    col => (col.type === 'score' || col.type === 'sum') && !['learnerId', 'learnerName'].includes(col.id)
  );
  
  const gradeColumns = updatedGroup.columns.filter(col => col.type === 'grade');
  
  // Helper function to check if learner IDs are sequential numeric
  const isSequentialNumericIds = () => {
    const numericIds = updatedGroup.learners
      .map(l => parseInt(l.learnerId))
      .filter(id => !isNaN(id))
      .sort((a, b) => a - b);
    
    if (numericIds.length !== updatedGroup.learners.length) return false;
    
    for (let i = 0; i < numericIds.length; i++) {
      if (numericIds[i] !== i + 1) return false;
    }
    return true;
  };

  // Helper function to get the next available Learner ID
  const getNextLearnerId = () => {
    const numericIds = updatedGroup.learners
      .map(l => parseInt(l.learnerId))
      .filter(id => !isNaN(id))
      .sort((a, b) => a - b);
    
    if (numericIds.length === 0) return '1';
    
    // Check if IDs are sequential starting from 1
    const isSequential = isSequentialNumericIds();
    if (isSequential) {
      return (numericIds.length + 1).toString();
    }
    
    // If not sequential, find the next available number
    let nextId = 1;
    for (const id of numericIds) {
      if (id === nextId) {
        nextId++;
      } else {
        break;
      }
    }
    return nextId.toString();
  };

  // Learner management functions
  const handleAddLearner = () => {
    const defaultId = isSequentialNumericIds() ? getNextLearnerId() : '';
    setEditingLearner({ name: '', learnerId: defaultId });
    setShowLearnerForm(true);
  };

  const handleEditLearner = (learner: { id: string; name: string; learnerId: string }) => {
    setEditingLearner(learner);
    setShowLearnerForm(true);
  };

  const handleDeleteLearner = (learnerId: string) => {
    if (confirm('Are you sure you want to delete this learner? This action cannot be undone.')) {
      const wasSequential = isSequentialNumericIds();
      
      const newGroup = {
        ...updatedGroup,
        learners: updatedGroup.learners.filter(l => l.id !== learnerId)
      };
      
      if (wasSequential && newGroup.learners.length > 0) {
        const shouldReassign = confirm('Do you want the system to automatically reassign Learner IDs to maintain sequence (1, 2, 3...)?');
        
        if (shouldReassign) {
          newGroup.learners = newGroup.learners.map((learner, index) => ({
            ...learner,
            learnerId: (index + 1).toString()
          }));
        }
      }
      
      setUpdatedGroup(newGroup);
      onUpdateGroup(newGroup);
    }
  };

  const handleSaveLearner = (learnerData: { id?: string; name: string; learnerId: string }) => {
    // Validate learner ID is unique
    const isDuplicateId = updatedGroup.learners.some(
      l => l.learnerId === learnerData.learnerId && l.id !== learnerData.id
    );
    
    if (isDuplicateId) {
      alert('A learner with this ID already exists. Please use a unique ID.');
      return;
    }

    const newGroup = { ...updatedGroup };
    
    if (learnerData.id) {
      // Update existing learner
      newGroup.learners = newGroup.learners.map(l => 
        l.id === learnerData.id 
          ? { ...l, name: learnerData.name, learnerId: learnerData.learnerId }
          : l
      );
    } else {
      // Add new learner
      const newLearner = {
        id: generateId(),
        name: learnerData.name,
        learnerId: learnerData.learnerId,
        scores: {}
      };
      newGroup.learners = [...newGroup.learners, newLearner];
    }
    
    setUpdatedGroup(newGroup);
    onUpdateGroup(newGroup);
    setShowLearnerForm(false);
    setEditingLearner(null);
  };

  // Column reordering functions
  const handleColumnReorder = (draggedId: string, targetId: string) => {
    const newGroup = { ...updatedGroup };
    const columns = [...newGroup.columns];
    
    // Separate columns: score/sum are reorderable, grade columns stay at end
    const reorderableColumns = columns.filter(col => col.type === 'score' || col.type === 'sum');
    const gradeColumns = columns.filter(col => col.type === 'grade');
    
    const draggedIndex = reorderableColumns.findIndex(col => col.id === draggedId);
    const targetIndex = reorderableColumns.findIndex(col => col.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Remove dragged column and insert at target position
    const [draggedColumn] = reorderableColumns.splice(draggedIndex, 1);
    reorderableColumns.splice(targetIndex, 0, draggedColumn!);
    
    // Rebuild columns array: reordered score/sum columns + grade columns at end
    // This ensures sum columns can be reordered with their calculations intact
    newGroup.columns = [...reorderableColumns, ...gradeColumns];
    
    setUpdatedGroup(newGroup);
    onUpdateGroup(newGroup);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-200">{updatedGroup.name}</h1>
            <p className="text-gray-600">{updatedGroup.learners.length} learners</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAddLearner}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <UserPlus size={20} />
            Add Learner
          </button>
          <button
            onClick={() => setShowColumnForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Column
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {fixedColumns.map((column) => (
                  <th 
                    key={column.id} 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10"
                  >
                    {column.name}
                  </th>
                ))}
                {reorderableColumns.map((column) => (
                  <th 
                    key={column.id} 
                    className={`px-4 py-3 text-center text-sm font-medium text-gray-900 min-w-[120px] cursor-move ${
                      draggedColumn === column.id ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={() => setDraggedColumn(column.id)}
                    onDragEnd={() => setDraggedColumn(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedColumn && draggedColumn !== column.id) {
                        handleColumnReorder(draggedColumn, column.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {getColumnIcon(column.type)}
                      <span>{column.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingColumn(column)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Edit Column"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete Column"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
                {gradeColumns.map((column) => (
                  <th 
                    key={column.id} 
                    className="px-4 py-3 text-center text-sm font-medium text-gray-900 min-w-[120px]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {getColumnIcon(column.type)}
                      <span>{column.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingColumn(column)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Edit Column"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete Column"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {updatedGroup.learners.map((learner) => (
                <tr key={learner.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    <div className="flex items-center justify-between">
                      <span>{learner.learnerId}</span>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditLearner(learner)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Edit Learner"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLearner(learner.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete Learner"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {learner.name}
                  </td>
                  {reorderableColumns.map((column) => (
                    <td key={column.id} className="px-4 py-3 text-center">
                      {column.type === 'score' ? (
                        <input
                          type="number"
                          value={learner.scores[column.id] || ''}
                          onChange={(e) => handleScoreChange(learner.id, column.id, e.target.value)}
                          className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {typeof learner.scores[column.id] === 'number' 
                            ? (learner.scores[column.id] as number).toFixed(1)
                            : '-'
                          }
                        </span>
                      )}
                    </td>
                  ))}
                  {gradeColumns.map((column) => (
                    <td key={column.id} className="px-4 py-3 text-center">
                      {column.type === 'grade' ? (
                        <span
                          className="inline-block px-2 py-1 rounded-full text-sm font-medium text-white"
                          style={{
                            backgroundColor: getGradeColor(
                              learner.scores[column.id] as string,
                              gradingCriteria
                            ),
                          }}
                        >
                          {learner.scores[column.id] || '-'}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {typeof learner.scores[column.id] === 'number' 
                            ? (learner.scores[column.id] as number).toFixed(1)
                            : '-'
                          }
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Learner Form Modal */}
      {showLearnerForm && (
        <LearnerForm
          learner={editingLearner}
          onSave={handleSaveLearner}
          onCancel={() => {
            setShowLearnerForm(false);
            setEditingLearner(null);
          }}
          defaultLearnerId={getNextLearnerId()}
        />
      )}

      {/* Column Form Modal */}
      {(showColumnForm || editingColumn) && (
        <ColumnForm
        column={editingColumn || undefined}
          availableColumns={reorderableColumns.filter(col => col.type === 'score' || col.type === 'sum')}
          onSave={(columnData) => {
            if (editingColumn) {
              handleUpdateColumn({ ...columnData, id: editingColumn.id } as ScoreColumn);
            } else {
              handleAddColumn(columnData);
            }
          }}
          onCancel={() => {
            setShowColumnForm(false);
            setEditingColumn(null);
          }}
        />
      )}
    </div>
  );
};
