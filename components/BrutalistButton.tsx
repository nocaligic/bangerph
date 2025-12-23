import React from 'react';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

import { useDegenMode } from '../contexts/DegenContext';
import { Sparkles } from 'lucide-react';

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const { degenMode } = useDegenMode();
  const baseStyles = "relative font-mono font-bold uppercase border-4 border-black transition-all duration-150 ease-in-out active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

  const variants = {
    primary: degenMode ? "bg-[#ecfd00] text-black shadow-hard hover:bg-white" : "bg-banger-yellow text-black shadow-hard hover:bg-white",
    secondary: degenMode ? "bg-[#00ffff] text-black shadow-hard hover:bg-white" : "bg-banger-cyan text-black shadow-hard hover:bg-white",
    danger: degenMode ? "bg-[#ff00ff] text-white shadow-hard hover:bg-black" : "bg-banger-pink text-white shadow-hard hover:bg-black",
    outline: "bg-white text-black shadow-hard hover:bg-gray-100"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px]",
    md: degenMode ? "px-7 py-4 text-base" : "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${degenMode ? 'hover:scale-105 group' : ''}`}
      {...props}
    >
      {degenMode && (
        <div className="absolute top-[-5px] right-[-5px] opacity-0 group-hover:opacity-100 group-hover:rotate-12 transition-all">
          <Sparkles size={16} fill="currentColor" />
        </div>
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
