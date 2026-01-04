import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, Search, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans text-primary bg-background bg-grain">
      <header className="sticky top-0 z-50 w-full glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 font-bold text-lg text-primary cursor-pointer group tracking-tight"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span>Idéfabrikken</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center px-3 py-2 rounded-lg bg-surface border border-border text-sm text-primary-muted focus-within:border-accent-primary focus-within:ring-1 focus-within:ring-accent-primary transition-all shadow-sm">
              <Search className="w-4 h-4 mr-2 opacity-40" />
              <input 
                type="text" 
                placeholder="Søk..." 
                className="bg-transparent border-none outline-none placeholder:text-primary-muted/60 w-48 text-primary"
              />
              <div className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated border border-border ml-2 text-primary-muted font-medium">⌘K</div>
            </div>

            <button className="p-2 rounded-lg hover:bg-surface-elevated transition-colors text-primary-muted hover:text-primary relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent-primary rounded-full border border-white"></span>
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/ideas/new')}
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all bg-primary text-white h-9 px-4 gap-2 shadow-md hover:bg-black/90"
            >
              <Plus className="w-4 h-4" />
              Ny idé
            </motion.button>
            
            <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-xs font-bold text-primary shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
              VG
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
};