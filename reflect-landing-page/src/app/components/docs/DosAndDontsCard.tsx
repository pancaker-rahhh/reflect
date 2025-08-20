import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface DosAndDontsCardProps {
    title: string;
    items: { text: string, isDo: boolean }[];
}

const DosAndDontsCard: React.FC<DosAndDontsCardProps> = ({ title, items }) => {
    return (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="flex items-center text-lg font-semibold text-green-600 mb-3">
                        <CheckCircle className="mr-2" size={20} />
                        Do's
                    </h4>
                    <ul className="space-y-2">
                        {items.filter(item => item.isDo).map((item, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                                <span>{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="flex items-center text-lg font-semibold text-red-600 mb-3">
                        <XCircle className="mr-2" size={20} />
                        Don'ts
                    </h4>
                    <ul className="space-y-2">
                        {items.filter(item => !item.isDo).map((item, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <XCircle className="text-red-500 mr-2 mt-1 flex-shrink-0" size={16} />
                                <span>{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DosAndDontsCard;
