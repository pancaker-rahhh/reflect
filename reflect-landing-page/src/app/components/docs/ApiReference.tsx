import React from 'react';

interface ApiMethod {
    name: string;
    description: string;
}

interface ApiReferenceProps {
    basicControl: ApiMethod[];
    sectionNavigation: ApiMethod[];
}

const ApiReference = ({ basicControl, sectionNavigation }: ApiReferenceProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
            <div>
                <h4 className="font-semibold text-gray-800 mb-3">Basic Control</h4>
                <ul className="space-y-2">
                    {basicControl.map(method => (
                        <li key={method.name} className="text-sm">
                            <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded">{method.name}</code>
                            <span className="text-gray-600 ml-2">{method.description}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Section Navigation</h4>
                <ul className="space-y-2">
                    {sectionNavigation.map(method => (
                        <li key={method.name} className="text-sm">
                            <code className="bg-green-200 text-green-900 px-1.5 py-0.5 rounded">{method.name}</code>
                            <span className="text-green-700 ml-2">{method.description}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ApiReference;
