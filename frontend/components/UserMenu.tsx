import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const initials = user.email?.substring(0, 2).toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold hover:bg-primary/90 transition-colors"
        aria-label="User menu"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">Bruker</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logg ut
          </button>
        </div>
      )}
    </div>
  );
};
