import type { ReactNode } from 'react';

type BadgeVariant = 'navy' | 'teal' | 'sage' | 'red' | 'yellow' | 'green' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  navy: 'bg-navy text-white',
  teal: 'bg-teal/10 text-teal border border-teal/20',
  sage: 'bg-sage/20 text-navy border border-sage/30',
  red: 'bg-red-100 text-red-800 border border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  green: 'bg-green-100 text-green-800 border border-green-200',
  gray: 'bg-gray-100 text-gray-700 border border-gray-200',
};

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
