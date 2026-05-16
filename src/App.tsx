import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProviderProvider } from './context/ProviderContext';
import { AIAssistantProvider } from './context/AIAssistantContext';
import AppLayout from './components/layout/AppLayout';
import GlobalAIAssistant from './components/GlobalAIAssistant';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PlacementAssistant from './pages/PlacementAssistant';
import NetworkCheck from './pages/NetworkCheck';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SetupGuides from './pages/SetupGuides';
import RealTimeCoverage from './pages/RealTimeCoverage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/placement" element={<ProtectedRoute><PlacementAssistant /></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><NetworkCheck /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/guides" element={<ProtectedRoute><SetupGuides /></ProtectedRoute>} />
        <Route path="/realtime" element={<ProtectedRoute><RealTimeCoverage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProviderProvider>
          <Router>
            <AIAssistantProvider>
              <AppRoutes />
              <GlobalAIAssistant />
            </AIAssistantProvider>
          </Router>
        </ProviderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
