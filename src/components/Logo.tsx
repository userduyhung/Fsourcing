import React from 'react';
import logoImage from '../assets/images/logo.png';

interface LogoProps {
  className?: string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-8", alt = "Fsourcing Logo" }) => {
  return (
    <img 
      src={logoImage} 
      alt={alt}
      className={className}
    />
  );
};

export default Logo;