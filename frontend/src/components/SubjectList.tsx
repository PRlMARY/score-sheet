import React from 'react';
import type { Subject } from '../types';
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
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Subjects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your courses and student groups</p>
        </div>
        <button
          onClick={onCreateSubject}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-soft hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Plus size={20} />
          New Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <BookOpen size={48} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No subjects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Create your first subject to start managing student scores and grades</p>
          <button
            onClick={onCreateSubject}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 hover:shadow-soft-lg transition-all duration-200 cursor-pointer group animate-slide-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary-100 dark:bg-primary-900/30 rounded-xl p-3">
                  <BookOpen size={24} className="text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                  {subject.groups.length} groups
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {subject.name}
              </h3>
              
              {subject.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {subject.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400 dark:text-gray-500" />
                  <span>
                    {subject.groups.reduce((total, group) => total + group.learners.length, 0)} learners
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
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
