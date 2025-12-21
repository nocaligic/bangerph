
import React from 'react';

export const BangrLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  return (
    <img
      src="/logo.png"
      alt="BANGR Logo"
      className={className}
    />
  );
};
