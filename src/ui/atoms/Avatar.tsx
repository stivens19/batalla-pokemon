import React from 'react';

interface AvatarProps {
  imageUrl: string;
  altText: string;
  isDead?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ imageUrl, altText, isDead = false }) => {
  return (
    <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
      {/* Sombra base en el suelo */}
      <div className="absolute bottom-0 w-3/4 h-4 bg-black/40 rounded-full blur-md"></div>
      
      <img
        src={imageUrl}
        alt={altText}
        className={`relative z-10 w-full h-full object-contain drop-shadow-2xl transition-all duration-500 
          ${isDead ? 'grayscale opacity-40 scale-95' : 'hover:scale-105 animate-pulse-slow'}`}
      />
    </div>
  );
};