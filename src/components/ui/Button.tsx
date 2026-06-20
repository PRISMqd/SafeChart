import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'teal' | 'light' | 'teal-outline' | 'sage' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy/90',
  teal: 'bg-teal text-white hover:bg-teal/90',
  light: 'bg-cream text-navy border border-gray-200 hover:bg-gray-50',
  'teal-outline': 'bg-white text-teal border border-teal hover:bg-teal/5',
  sage: 'bg-sage text-white hover:bg-sage/90',
  ghost: 'bg-transparent text-navy hover:bg-navy/5',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`font-heading font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
