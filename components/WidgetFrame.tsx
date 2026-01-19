
import React from 'react';

interface WidgetFrameProps {
  children: React.ReactNode;
}

export const WidgetFrame: React.FC<WidgetFrameProps> = ({ children }) => {
  return (
    <div className="glass w-full max-w-[420px] h-[600px] rounded-[40px] p-8 shadow-2xl relative overflow-hidden transition-all duration-500 ease-out hover:scale-[1.01] flex flex-col">
      {/* Decorative Blur Background Circles */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
