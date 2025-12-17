import React from 'react';

interface TreeControlsProps {
  isFormed: boolean;
  toggleTree: () => void;
}

const TreeControls: React.FC<TreeControlsProps> = ({ isFormed, toggleTree }) => {
  return (
    <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center justify-center z-10 pointer-events-none">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center luxury-text tracking-widest uppercase gold-gradient">
        The Grand Tree
      </h1>
      
      <button
        onClick={toggleTree}
        className="pointer-events-auto group relative px-12 py-4 bg-black/80 backdrop-blur-md overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 border border-yellow-600/50"
      >
        {/* Animated Gold Border */}
        <div className="absolute inset-0 w-full h-full border-2 border-transparent border-t-[#FFD700] border-b-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
        <div className="absolute inset-0 w-full h-full border-2 border-transparent border-l-[#FFD700] border-r-[#FFD700] scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-center delay-100" />
        
        <span className="relative z-10 font-serif text-xl tracking-[0.2em] text-[#FFD700] group-hover:text-white transition-colors duration-300">
          {isFormed ? 'INITIATE CHAOS' : 'ASSEMBLE MAJESTY'}
        </span>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#FFD700] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      </button>

      <div className="mt-4 text-xs tracking-widest text-[#cfc09f] opacity-60 font-sans">
        TRUMP LUXURY COLLECTION • MMXXIV
      </div>
    </div>
  );
};

export default TreeControls;
