import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages will be imported here
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import ProgramManagement from './pages/ProgramManagement';
import BookInventory from './pages/BookInventory';
import MemberManagement from './pages/MemberManagement';

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

function App() {
  return (
    <Router>
      <div className="font-sans antialiased text-brand-charcoal bg-brand-grey min-h-screen selection:bg-brand-orange/30">
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
              <ProtectedRoute allowedRoles={['Treasurer']}>
                <ProgramManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute allowedRoles={['Treasurer']}>
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
      </div>
    </Router>
  );
}

export default App;
