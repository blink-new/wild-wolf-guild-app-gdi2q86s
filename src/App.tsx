import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Calendar } from './pages/Calendar';
import { Wiki } from './pages/Wiki';
import { Forum } from './pages/Forum';
import { Messages } from './pages/Messages';
import { AdminPanel } from './pages/AdminPanel';
import { Profile } from './pages/Profile';
import { Utilities } from './pages/Utilities';
import { LoadingScreen } from './components/LoadingScreen';
import { DiscordCallback } from './pages/DiscordCallback';
import { WikiArticlePage } from './pages/WikiArticle';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <Routes>
              <Route path="/auth/discord/callback" element={<DiscordCallback />} />
              <Route path="/wiki/:id" element={<WikiArticlePage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="members" element={<Members />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="wiki" element={<Wiki />} />
                <Route path="forum" element={<Forum />} />
                <Route path="messages" element={<Messages />} />
                <Route path="utilities" element={<Utilities />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<AdminPanel />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;