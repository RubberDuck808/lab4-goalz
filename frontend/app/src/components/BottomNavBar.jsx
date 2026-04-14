import React from 'react';
import awardIcon from '../assets/button/Award.svg';
import navigationIcon from '../assets/button/Navigation.svg';
import userIcon from '../assets/button/User.svg';

export default function BottomNavBar({ onNavigateHome, onNavigateToProfile, className = '' }) {
  const NAV_ITEMS = [
    { icon: awardIcon, alt: 'Goals', width: 22, height: 22, onClick: null },
    { icon: navigationIcon, alt: 'Explore', width: 22, height: 22, onClick: onNavigateHome },
    { icon: userIcon, alt: 'Profile', width: 22, height: 24.75, onClick: onNavigateToProfile },
  ];

  return (
    <div className={`w-full flex items-center justify-around px-8 py-4 bg-white border-t border-zinc-200 ${className}`}>
      {NAV_ITEMS.map(({ icon, alt, width, height, onClick }) => (
        <button
          key={alt}
          onClick={onClick}
          className="flex items-center justify-center w-[44px] h-[44px] bg-[#DDF4FF] rounded-[9px] border-[2px] border-[#63C9F9] border-b-[5px] border-b-[#3aaedc] transition-all active:border-b-[2px] active:translate-y-[3px]"
        >
          <img src={icon} alt={alt} style={{ width, height }} />
        </button>
      ))}
    </div>
  );
}
