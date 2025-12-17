import React, { useState } from 'react';
import Scene from './components/Scene';
import TreeControls from './components/TreeControls';

const App: React.FC = () => {
  const [isFormed, setIsFormed] = useState(false);

  const toggleTree = () => {
    setIsFormed((prev) => !prev);
  };

  return (
    <div className="relative w-full h-full">
      <Scene isFormed={isFormed} />
      <TreeControls isFormed={isFormed} toggleTree={toggleTree} />
      
      {/* Decorative Gold Frame Overlay (CSS only) */}
      <div className="absolute top-4 left-4 w-32 h-32 border-t-2 border-l-2 border-[#FFD700]/30 pointer-events-none rounded-tl-3xl" />
      <div className="absolute top-4 right-4 w-32 h-32 border-t-2 border-r-2 border-[#FFD700]/30 pointer-events-none rounded-tr-3xl" />
      <div className="absolute bottom-4 left-4 w-32 h-32 border-b-2 border-l-2 border-[#FFD700]/30 pointer-events-none rounded-bl-3xl" />
      <div className="absolute bottom-4 right-4 w-32 h-32 border-b-2 border-r-2 border-[#FFD700]/30 pointer-events-none rounded-br-3xl" />
    </div>
  );
};

export default App;
