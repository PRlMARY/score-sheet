import React from 'react';
import { Subject } from '../types';
import { BookOpen, Users, Calendar, Plus } from 'lucide-react';

interface SubjectListProps {
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
  onCreateSubject: () => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  onSelectSubject,
  onCreateSubject,
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
        <button
          onClick={onCreateSubject}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          New Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
          <p className="text-gray-500 mb-4">Create your first subject to start managing scores</p>
          <button
            onClick={onCreateSubject}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => onSelectSubject(subject)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <BookOpen size={24} className="text-primary-600" />
                <span className="text-sm text-gray-500">
                  {subject.groups.length} groups
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {subject.name}
              </h3>
              
              {subject.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {subject.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>
                    {subject.groups.reduce((total, group) => total + group.learners.length, 0)} learners
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>
                    {new Date(subject.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
