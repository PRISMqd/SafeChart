import React from 'react';

type BadgeVariant = 'navy' | 'teal' | 'sage' | 'red' | 'yellow' | 'green';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  navy: 'bg-navy text-white',
  teal: 'bg-teal text-white',
  sage: 'bg-sage text-white',
  red: 'bg-red-100 text-red-800 border border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  green: 'bg-green-100 text-green-800 border border-green-200',
};

export default function Badge({ variant = 'navy', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
