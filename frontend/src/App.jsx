import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Lazy load pages to reduce initial bundle size
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ExecutiveDashboard = lazy(() => import('./pages/ExecutiveDashboard'));
const ProgramManagement = lazy(() => import('./pages/ProgramManagement'));
const BookInventory = lazy(() => import('./pages/BookInventory'));
const MemberManagement = lazy(() => import('./pages/MemberManagement'));

// Protect routes based on authentication and role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // Or an unauthorized page
  }

  return children;
};

// Fallback loader
const FallbackLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-grey">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          },
        }}
      />
      <div className="font-sans antialiased text-white bg-brand-grey min-h-screen selection:bg-brand-orange/30">
        <Suspense fallback={<FallbackLoader />}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Treasurer Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Treasurer']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/programs" 
            element={
              <ProtectedRoute allowedRoles={['Treasurer', 'Executive']}>
                <ProgramManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute allowedRoles={['Treasurer', 'Executive']}>
                <BookInventory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/members" 
            element={
              <ProtectedRoute allowedRoles={['Treasurer']}>
                <MemberManagement />
              </ProtectedRoute>
            } 
          />

          {/* Executive & Member Unified Portal */}
          <Route 
            path="/portal" 
            element={
              <ProtectedRoute allowedRoles={['Executive', 'Treasurer', 'Member']}>
                <ExecutiveDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  </Router>
  );
}

export default App;
