
import React from 'react';

export const BangrLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  return (
    <svg 
      viewBox="0 0 360 200" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left Floating Fist - The 'Punch' */}
      <path d="M 45 100 C 35 90 35 60 55 50 C 65 45 85 45 95 50 C 115 60 115 90 105 100 C 90 115 60 115 45 100 Z" />
      {/* Knuckles */}
      <path d="M 55 50 Q 65 35 75 50" strokeWidth="12" />
      <path d="M 75 50 Q 85 35 95 50" strokeWidth="12" />

      {/* Main Character (Center) */}
      {/* Body Outline */}
      <path d="M 135 175 C 125 160 125 55 185 45 C 245 35 245 160 235 175" />
      {/* Legs/Crotch Gap - Messy Arch */}
      <path d="M 135 175 C 145 185 155 145 185 145 C 215 145 225 185 235 175" />
      
      {/* 'II' Eyes - Thick and uneven */}
      <path d="M 160 80 L 158 115" strokeWidth="18" />
      <path d="M 205 75 L 208 110" strokeWidth="18" />

      {/* Right Blob / Backpack / Rock Thing */}
      <path d="M 270 140 C 260 110 290 90 310 100 C 330 110 325 150 315 160 C 300 175 275 160 270 140 Z" />
    </svg>
  );
};
