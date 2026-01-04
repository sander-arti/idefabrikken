import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Framer Motion Variants
export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10 }
};

export const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } }
};

export const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export function getStatusColor(status: string) {
  switch (status) {
    case 'draft': return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    case 'evaluating': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'evaluated': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'go': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'hold': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'reject': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-zinc-100 text-zinc-600';
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'draft': return 'Utkast';
    case 'evaluating': return 'Evaluerer';
    case 'evaluated': return 'Beslutt';
    case 'go': return 'Gå videre';
    case 'hold': return 'Avvent';
    case 'reject': return 'Forkastet';
    default: return status;
  }
}