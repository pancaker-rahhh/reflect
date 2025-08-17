import React from 'react';
import { Info } from 'lucide-react';

const InfoBox = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg my-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default InfoBox;
