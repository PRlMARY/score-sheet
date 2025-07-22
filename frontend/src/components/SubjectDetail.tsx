import React, { useState } from 'react';
import type { Subject, Group } from '../interfaces';
import { ArrowLeft, Plus, Users, Settings, Trash2 } from 'lucide-react';
import { GroupForm } from './GroupForm';
import { ScoreTable } from './ScoreTable';

interface SubjectDetailProps {
  subject: Subject;
  onBack: () => void;
  onUpdateSubject: (subject: Subject) => void;
  onEditSubject: () => void;
}

export const SubjectDetail: React.FC<SubjectDetailProps> = ({
  subject,
  onBack,
  onUpdateSubject,
  onEditSubject,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const handleCreateGroup = (groupData: Omit<Group, 'id'>) => {
    const newGroup: Group = {
      ...groupData,
      id: Math.random().toString(36).substr(2, 9),
    };

    const updatedSubject = {
      ...subject,
      groups: [...subject.groups, newGroup],
      updatedAt: new Date(),
    };

    onUpdateSubject(updatedSubject);
    setShowGroupForm(false);
  };

  const handleUpdateGroup = (updatedGroup: Group | Omit<Group, 'id'>) => {
    if (!('id' in updatedGroup) || !updatedGroup.id) {
      return handleCreateGroup(updatedGroup);
    }

    const updatedSubject = {
      ...subject,
      groups: subject.groups.map(g => g.id === updatedGroup.id ? updatedGroup : g),
      updatedAt: new Date(),
    };

    onUpdateSubject(updatedSubject);
    setEditingGroup(null);

    if (selectedGroup?.id === updatedGroup.id) {
      setSelectedGroup(updatedGroup);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      const updatedSubject = {
        ...subject,
        groups: subject.groups.filter(g => g.id !== groupId),
        updatedAt: new Date(),
      };

      onUpdateSubject(updatedSubject);

      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    }
  };

  if (selectedGroup) {
    return (
      <ScoreTable
        group={selectedGroup}
        gradingCriteria={subject.gradingCriteria}
        onBack={() => setSelectedGroup(null)}
        onUpdateGroup={handleUpdateGroup}
      />
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEditSubject}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
            title="Edit Subject"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setShowGroupForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            New Group
          </button>
        </div>
      </div>

      {/* Grading Criteria Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Grading Criteria</h3>
        <div className="flex flex-wrap gap-2">
          {subject.gradingCriteria.map((criteria) => (
            <div
              key={criteria.id}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: criteria.color }}
            >
              <span>{criteria.grade}</span>
              <span>≥{criteria.minScore}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      {subject.groups.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-500 mb-4">Create your first group to start managing learner scores</p>
          <button
            onClick={() => setShowGroupForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subject.groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <Users size={24} className="text-primary-600" />
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingGroup(group)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Edit Group"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Delete Group"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {group.name}
              </h3>

              <div className="text-sm text-gray-500 mb-4">
                <p>{group.learners.length} learners</p>
                <p>{group.columns.filter(c => c.type === 'score').length} score columns</p>
              </div>

              <button
                onClick={() => setSelectedGroup(group)}
                className="w-full bg-primary-50 hover:bg-primary-100 text-primary-700 py-2 px-4 rounded-lg transition-colors"
              >
                Manage Scores
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Group Form Modal */}
      {(showGroupForm || editingGroup) && (
        <GroupForm
          group={editingGroup}
          onSave={editingGroup ? handleUpdateGroup : handleCreateGroup}
          onCancel={() => {
            setShowGroupForm(false);
            setEditingGroup(null);
          }}
        />
      )}
    </div>
  );
};
