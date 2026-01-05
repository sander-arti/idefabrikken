import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { NewIdea } from './pages/NewIdea';
import { IdeaDetails } from './pages/IdeaDetails';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ideas/new"
            element={
              <ProtectedRoute>
                <NewIdea />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ideas/:id"
            element={
              <ProtectedRoute>
                <IdeaDetails />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}