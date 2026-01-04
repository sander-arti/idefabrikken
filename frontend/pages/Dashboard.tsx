import React, { useState, useEffect } from 'react';
import { listIdeas } from '../lib/api';
import { IdeaCard } from '../components/IdeaCard';
import { Layout } from '../components/ui/Layout';
import { cn, containerVariants, pageVariants } from '../lib/utils';
import { IdeaStatus, Idea } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const TABS: { label: string; value: 'all' | IdeaStatus }[] = [
  { label: 'Alle', value: 'all' },
  { label: 'Utkast', value: 'draft' },
  { label: 'Under evaluering', value: 'evaluating' },
  { label: 'Beslutt', value: 'evaluated' },
  { label: 'Gå videre', value: 'go' },
  { label: 'Avvent', value: 'hold' },
  { label: 'Forkastet', value: 'reject' },
];

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | IdeaStatus>('all');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      setError(null);
      try {
        const statusFilter = activeTab === 'all' ? undefined : activeTab;
        const data = await listIdeas(statusFilter);
        setIdeas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ideas');
        console.error('Failed to fetch ideas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [activeTab]);

  const filteredIdeas = ideas;

  return (
    <Layout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-12"
      >
        {/* Hero Section */}
        <div className="relative space-y-3 py-6 border-b border-border/50">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary"
          >
            Dine produktidéer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-primary-muted max-w-2xl font-medium"
          >
            Strukturer, evaluer og beslutte. Idéfabrikken gir deg innsikten du trenger.
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const count = tab.value === 'all'
                ? ideas.length
                : ideas.filter(i => i.status === tab.value).length;
            
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                  activeTab === tab.value
                    ? "text-white"
                    : "text-primary-muted hover:text-primary hover:bg-surface-elevated"
                )}
              >
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                    {tab.label}
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded bg-white/20",
                        activeTab === tab.value ? "text-white" : "bg-zinc-200 text-primary-muted"
                    )}>{count}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
            {loading ? (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24"
            >
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                <p className="text-primary-muted">Laster idéer...</p>
            </motion.div>
            ) : error ? (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-red-300 rounded-2xl bg-red-50/30"
            >
                <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300 flex items-center justify-center mb-4 shadow-sm">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-red-900">Kunne ikke laste idéer</h3>
                <p className="mt-1 text-red-700">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Prøv igjen
                </button>
            </motion.div>
            ) : filteredIdeas.length === 0 ? (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-2xl bg-surface-elevated/30"
            >
                <div className="w-16 h-16 rounded-full bg-white border border-border flex items-center justify-center mb-4 shadow-sm">
                    <span className="text-3xl">💡</span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-primary">Ingen idéer funnet</h3>
                <p className="mt-1 text-primary-muted">Ingen idéer matcher dette filteret.</p>
            </motion.div>
            ) : (
            <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
                ))}
            </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
};