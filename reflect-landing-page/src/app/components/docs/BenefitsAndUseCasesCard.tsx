import React from 'react';
import { CheckCircle, Target } from 'lucide-react';

interface BenefitsAndUseCasesCardProps {
    benefits: string[];
    useCases: string[];
}

const BenefitsAndUseCasesCard: React.FC<BenefitsAndUseCasesCardProps> = ({ benefits, useCases }) => {
    return (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                        <CheckCircle className="mr-2 text-green-500" size={20} />
                        Benefits
                    </h4>
                    <ul className="space-y-2">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <span className="text-green-500 mr-2 mt-1">&#10003;</span>
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                        <Target className="mr-2 text-purple-500" size={20} />
                        Common Use Cases
                    </h4>
                    <ul className="space-y-2">
                        {useCases.map((useCase, index) => (
                            <li key={index} className="flex items-start text-gray-600">
                                <span className="text-purple-500 mr-2 mt-1">&#8227;</span>
                                <span>{useCase}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BenefitsAndUseCasesCard;
