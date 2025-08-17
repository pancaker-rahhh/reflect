import React from 'react';
import { Info } from 'lucide-react';

const Note = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">{children}</p>
        </div>
      </div>
    </div>
  );
};

export default Note;
