
import React from 'react';

interface BangrLogoProps {
  className?: string;
  onClick?: () => void;
}

export const BangrLogo: React.FC<BangrLogoProps> = ({ className = "h-12", onClick }) => {
  return (
    <img
      src="/logo.png"
      alt="BANGR Logo"
      className={`${className} object-contain ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width: 'auto' }}
      onClick={onClick}
    />
  );
};
