import React from 'react';

type ButtonVariant = 'primary' | 'teal' | 'light' | 'teal-outline' | 'sage' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:bg-opacity-90',
  teal: 'bg-teal text-white hover:bg-opacity-90',
  light: 'bg-warm text-navy hover:bg-opacity-80',
  'teal-outline': 'border-2 border-teal text-teal bg-white hover:bg-teal hover:text-white',
  sage: 'bg-sage text-white hover:bg-opacity-90',
  ghost: 'bg-transparent text-navy hover:bg-warm',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
