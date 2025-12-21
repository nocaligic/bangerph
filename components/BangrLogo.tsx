
import React from 'react';

export const BangrLogo: React.FC<{ className?: string }> = ({ className = "h-12" }) => {
  return (
    <img
      src="/logo.png"
      alt="BANGR Logo"
      className={`${className} object-contain`}
      style={{ width: 'auto' }}
    />
  );
};
