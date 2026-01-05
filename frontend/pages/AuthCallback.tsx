import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorDescription = hashParams.get('error_description');

    if (errorDescription) {
      setError(errorDescription);
      return;
    }

    // Redirect to intended page once authenticated
    if (!loading && user) {
      const redirectTo = localStorage.getItem('auth_redirect') || '/';
      localStorage.removeItem('auth_redirect');
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Autentisering feilet</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tilbake til innlogging
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Logger inn...</p>
      </div>
    </div>
  );
};
