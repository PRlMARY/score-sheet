import { useState, useEffect } from 'react';
import type { Group, GradingCriteria, ScoreColumn, ColumnType } from '../types';
import { ArrowLeft, Plus, Settings, Trash2, Calculator, Award } from 'lucide-react';
import { calculateSum, calculateGrade, getGradeColor, generateId } from '../utils/grading';
import { ColumnForm } from './ColumnForm';

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
    
    const newGroup = {
      ...updatedGroup,
      columns: [...updatedGroup.columns, newColumn],
    };
    
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

  const scoreColumns = updatedGroup.columns.filter(col => col.type === 'score');
  const computedColumns = updatedGroup.columns.filter(col => col.type !== 'score');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{updatedGroup.name}</h1>
            <p className="text-gray-600">{updatedGroup.learners.length} learners</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowColumnForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Column
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">
                  Learner
                </th>
                {scoreColumns.map((column) => (
                  <th key={column.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900 min-w-[120px]">
                    <div className="flex items-center justify-center gap-2">
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
                {computedColumns.map((column) => (
                  <th key={column.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900 min-w-[120px]">
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
                <tr key={learner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    {learner.name}
                  </td>
                  {scoreColumns.map((column) => (
                    <td key={column.id} className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={learner.scores[column.id] || ''}
                        onChange={(e) => handleScoreChange(learner.id, column.id, e.target.value)}
                        className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </td>
                  ))}
                  {computedColumns.map((column) => (
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

      {/* Column Form Modal */}
      {(showColumnForm || editingColumn) && (
        <ColumnForm
        column={editingColumn || undefined}
          availableColumns={scoreColumns.concat(computedColumns.filter(c => c.type === 'sum'))}
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
