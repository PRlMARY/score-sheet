import { useState } from 'react';
import type { ScoreColumn } from '../interfaces';
import type { ColumnType } from '../type.d.ts';
import { X, Calculator, Award, Hash } from 'lucide-react';

interface ColumnFormProps {
  column?: ScoreColumn;
  availableColumns: ScoreColumn[];
  onSave: (column: Omit<ScoreColumn, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export const ColumnForm: React.FC<ColumnFormProps> = ({
  column,
  availableColumns,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(column?.name || '');
  const [type, setType] = useState<ColumnType>(column?.type || 'score');
  const [sourceColumns, setSourceColumns] = useState<string[]>(column?.sourceColumns ?? []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const columnData = {
      name: name.trim(),
      type,
      sourceColumns: type !== 'score' ? sourceColumns : undefined,
    };

    if (column) {
      onSave({ ...column, ...columnData });
    } else {
      onSave(columnData);
    }
  };

  const handleSourceColumnToggle = (columnId: string) => {
    if (sourceColumns.includes(columnId)) {
      setSourceColumns(sourceColumns.filter(id => id !== columnId));
    } else {
      if (type === 'grade') {
        // Grade columns can only have one source
        setSourceColumns([columnId]);
      } else {
        // Sum columns can have multiple sources
        setSourceColumns([...sourceColumns, columnId]);
      }
    }
  };

  const getTypeIcon = (columnType: ColumnType) => {
    switch (columnType) {
      case 'score':
        return <Hash size={16} />;
      case 'sum':
        return <Calculator size={16} />;
      case 'grade':
        return <Award size={16} />;
    }
  };

  const getTypeDescription = (columnType: ColumnType) => {
    switch (columnType) {
      case 'score':
        return 'Manual numeric input for scores';
      case 'sum':
        return 'Automatically calculates sum of selected columns';
      case 'grade':
        return 'Automatically assigns grade based on score and criteria';
    }
  };

  const canSelectSources = type !== 'score';
  const availableSourceColumns = availableColumns.filter(col => 
    col.id !== column?.id && (type === 'grade' ? col.type !== 'grade' : true)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {column ? 'Edit Column' : 'Add New Column'}
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
              Column Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Homework 1, Midterm, Total"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Column Type *
            </label>
            <div className="space-y-3">
              {(['score', 'sum', 'grade'] as ColumnType[]).map((columnType) => (
                <label
                  key={columnType}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    type === columnType
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={columnType}
                    checked={type === columnType}
                    onChange={(e) => setType(e.target.value as ColumnType)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(columnType)}
                      <span className="font-medium text-gray-900 capitalize">
                        {columnType} Column
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getTypeDescription(columnType)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {canSelectSources && availableSourceColumns.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Source Columns *
                {type === 'grade' && (
                  <span className="text-xs text-gray-500 ml-1">(select one)</span>
                )}
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableSourceColumns.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type={type === 'grade' ? 'radio' : 'checkbox'}
                      name={type === 'grade' ? 'sourceColumn' : undefined}
                      checked={sourceColumns.includes(col.id)}
                      onChange={() => handleSourceColumnToggle(col.id)}
                    />
                    <div className="flex items-center gap-2">
                      {getTypeIcon(col.type)}
                      <span className="text-sm text-gray-900">{col.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {canSelectSources && availableSourceColumns.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No source columns available. Create some score columns first.
              </p>
            </div>
          )}

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
              disabled={canSelectSources && sourceColumns.length === 0}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {column ? 'Update Column' : 'Add Column'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
