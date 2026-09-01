import React from 'react';
import { NavigationTab } from '../types';

interface FooterProps {
  onTabChange: (tab: NavigationTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  return (
    <footer className="w-full bg-[#05070B] border-t border-[rgba(148,163,184,0.12)] text-slate-400 text-xs py-6 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="text-slate-400 font-mono text-xs">
          <strong className="text-slate-300">VeriVox</strong> • Voice security platform
        </div>
        <div className="flex items-center gap-6 text-xs">
          <button onClick={() => onTabChange('how-it-works')} className="hover:text-[#22D3EE] transition-colors cursor-pointer">
            How it works
          </button>
          <button onClick={() => onTabChange('privacy')} className="hover:text-[#22D3EE] transition-colors cursor-pointer">
            Privacy
          </button>
          <button onClick={() => onTabChange('api')} className="hover:text-[#22D3EE] transition-colors cursor-pointer">
            API
          </button>
        </div>
      </div>
    </footer>
  );
};
