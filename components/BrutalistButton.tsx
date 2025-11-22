
import React from 'react';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-mono font-bold uppercase border-4 border-black dark:border-white transition-all duration-150 ease-in-out active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-banger-yellow text-black shadow-hard dark:shadow-hard-white hover:bg-white dark:hover:bg-black dark:hover:text-white",
    secondary: "bg-banger-cyan text-black shadow-hard dark:shadow-hard-white hover:bg-white dark:hover:bg-black dark:hover:text-white",
    danger: "bg-[#ff0000] text-white shadow-hard dark:shadow-hard-white hover:bg-white hover:text-[#ff0000]",
    success: "bg-[#00ff00] text-black shadow-hard dark:shadow-hard-white hover:bg-white hover:text-[#00cc00]",
    outline: "bg-white dark:bg-black text-black dark:text-white shadow-hard dark:shadow-hard-white hover:bg-gray-100 dark:hover:bg-zinc-800"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm shadow-hard-sm dark:shadow-hard-sm-white active:translate-x-[2px] active:translate-y-[2px]",
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
