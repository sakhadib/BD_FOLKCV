import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import AnnotationPage from './components/AnnotationPage';
import ExplorePage from './components/ExplorePage';

type Page = 'annotate' | 'explore';

function AppContent() {
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('annotate');

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showSignup) {
      return <Signup onSwitchToLogin={() => setShowSignup(false)} />;
    }
    return <Login onSwitchToSignup={() => setShowSignup(true)} />;
  }

  if (currentPage === 'explore') {
    return <ExplorePage onNavigate={setCurrentPage} />;
  }

  return <AnnotationPage onNavigate={setCurrentPage} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
