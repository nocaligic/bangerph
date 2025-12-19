import React from 'react';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-mono font-bold uppercase border-4 border-black transition-all duration-150 ease-in-out active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-banger-yellow text-black shadow-hard hover:bg-white",
    secondary: "bg-banger-cyan text-black shadow-hard hover:bg-white",
    danger: "bg-banger-pink text-white shadow-hard hover:bg-black",
    outline: "bg-white text-black shadow-hard hover:bg-gray-100"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px]",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
