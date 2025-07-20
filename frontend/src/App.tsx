import { useState, useEffect } from 'react';
import type { Subject } from './types';
import { SubjectList } from './components/SubjectList';
import { SubjectDetail } from './components/SubjectDetail';
import { SubjectForm } from './components/SubjectForm';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { Header } from './components/Header';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { generateId } from './utils/grading';
import { Loader2 } from 'lucide-react';

type AppView = 'subjects' | 'subject-detail' | 'subject-form';
type AuthView = 'signin' | 'signup';

function AppContent() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [authView, setAuthView] = useState<AuthView>('signin');
  const { user, isLoading } = useAuth();

  // Load subjects from localStorage on mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem('scoresheet-subjects');
    if (savedSubjects) {
      try {
        const parsed = JSON.parse(savedSubjects);
        setSubjects(parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        })));
      } catch (error) {
        console.error('Failed to load subjects:', error);
      }
    }
  }, []);

  // Save subjects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scoresheet-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const handleCreateSubject = () => {
    setEditingSubject(null);
    setCurrentView('subject-form');
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setCurrentView('subject-form');
  };

  const handleSaveSubject = (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSubject) {
      // Update existing subject
      const updatedSubject: Subject = {
        ...editingSubject,
        ...subjectData,
        updatedAt: new Date(),
      };
      setSubjects(subjects.map(s => s.id === editingSubject.id ? updatedSubject : s));
      setSelectedSubject(updatedSubject);
    } else {
      // Create new subject
      const newSubject: Subject = {
        ...subjectData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSubjects([...subjects, newSubject]);
      setSelectedSubject(newSubject);
    }
    setCurrentView('subject-detail');
    setEditingSubject(null);
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('subject-detail');
  };

  const handleUpdateSubject = (updatedSubject: Subject) => {
    setSubjects(subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s));
    setSelectedSubject(updatedSubject);
  };

  const handleBackToSubjects = () => {
    setCurrentView('subjects');
    setSelectedSubject(null);
    setEditingSubject(null);
  };

  const handleCancelForm = () => {
    if (selectedSubject) {
      setCurrentView('subject-detail');
    } else {
      setCurrentView('subjects');
    }
    setEditingSubject(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {authView === 'signin' ? (
          <SignIn onSwitchToSignUp={() => setAuthView('signup')} />
        ) : (
          <SignUp onSwitchToSignIn={() => setAuthView('signin')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto">
        {currentView === 'subjects' && (
          <SubjectList
            subjects={subjects}
            onSelectSubject={handleSelectSubject}
            onCreateSubject={handleCreateSubject}
          />
        )}

        {currentView === 'subject-detail' && selectedSubject && (
          <SubjectDetail
            subject={selectedSubject}
            onBack={handleBackToSubjects}
            onUpdateSubject={handleUpdateSubject}
            onEditSubject={() => handleEditSubject(selectedSubject)}
          />
        )}

        {currentView === 'subject-form' && (
          <SubjectForm
            subject={editingSubject || undefined}
            onSave={handleSaveSubject}
            onCancel={handleCancelForm}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
