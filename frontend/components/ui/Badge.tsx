import React from 'react';
import { cn, getStatusColor, getStatusLabel } from '../../lib/utils';
import { motion } from 'framer-motion';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className }) => {
  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide uppercase shadow-sm backdrop-blur-md",
        getStatusColor(status),
        className
      )}
    >
      {status === 'evaluating' && (
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      )}
      {getStatusLabel(status)}
    </motion.span>
  );
};