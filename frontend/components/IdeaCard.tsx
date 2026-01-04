import React from 'react';
import { Idea } from '../types';
import { Badge } from './ui/Badge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cardVariants } from '../lib/utils';
import { ArrowRight, TrendingUp } from 'lucide-react';

export const IdeaCard: React.FC<{ idea: Idea }> = ({ idea }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/ideas/${idea.id}`)}
      className="group relative flex flex-col justify-between rounded-xl paper-card p-6 transition-all hover:shadow-lg hover:border-accent-primary/50 cursor-pointer overflow-hidden bg-white"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold leading-snug tracking-tight text-primary group-hover:text-accent-primary transition-colors">
            {idea.title}
          </h3>
          {idea.scores?.total && idea.status !== 'evaluating' && (
             <div className="flex items-center gap-1 bg-surface-elevated px-2 py-1 rounded-md border border-border">
                <TrendingUp className="w-3 h-3 text-primary-muted" />
                <span className="text-sm font-bold text-primary">
                    {idea.scores.total}
                </span>
             </div>
          )}
        </div>
        
        <p className="text-sm text-primary-muted line-clamp-2 leading-relaxed h-10">
          {idea.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-dashed border-border mt-2">
            <Badge status={idea.status} />
            <div className="flex items-center gap-2">
                <span className="text-xs text-primary-muted">{idea.createdAt}</span>
                {idea.createdBy && (
                    <div className="w-6 h-6 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-[10px] text-primary font-bold" title={idea.createdBy.name}>
                        {idea.createdBy.avatar}
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Hover Indication */}
      <div className="absolute bottom-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
         <ArrowRight className="w-4 h-4 text-accent-primary" />
      </div>
    </motion.div>
  );
};