import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { NewIdea } from './pages/NewIdea';
import { IdeaDetails } from './pages/IdeaDetails';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ideas/new" element={<NewIdea />} />
        <Route path="/ideas/:id" element={<IdeaDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}