import React from 'react';

interface PlanCardProps {
    title: string;
    description: string;
    price: string;
}

const PlanCard = ({ title, description, price }: PlanCardProps) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{price}</p>
            <p className="text-xs text-gray-500 mt-2">{description}</p>
        </div>
    );
};

export default PlanCard;
