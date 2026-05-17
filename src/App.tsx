import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProviderProvider } from './context/ProviderContext';
import { AIAssistantProvider } from './context/AIAssistantContext';
import AppLayout from './components/layout/AppLayout';
import GlobalAIAssistant from './components/GlobalAIAssistant';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const PlacementAssistant = lazy(() => import('./pages/PlacementAssistant'));
const NetworkCheck = lazy(() => import('./pages/NetworkCheck'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const SetupGuides = lazy(() => import('./pages/SetupGuides'));
const RealTimeCoverage = lazy(() => import('./pages/RealTimeCoverage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );
}

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

        {/* Protected routes - lazy loaded */}
        <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></ProtectedRoute>} />
        <Route path="/placement" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><PlacementAssistant /></Suspense></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><NetworkCheck /></Suspense></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Profile /></Suspense></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Settings /></Suspense></ProtectedRoute>} />
        <Route path="/guides" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SetupGuides /></Suspense></ProtectedRoute>} />
        <Route path="/realtime" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><RealTimeCoverage /></Suspense></ProtectedRoute>} />

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
