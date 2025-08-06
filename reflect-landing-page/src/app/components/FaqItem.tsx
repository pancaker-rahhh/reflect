import React from 'react';
import { ChevronDown } from 'lucide-react';

// Define the props for the FaqItem component
interface FaqItemProps {
  question: string;
  answer: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, icon, isOpen, onClick }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm transition-all hover:shadow-md">
      <dt>
        <button
          onClick={onClick}
          className="flex w-full items-center justify-between text-left text-gray-900 p-6"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-4">
            <span className={`transition-colors ${isOpen ? 'text-purple-600' : 'text-gray-500'}`}>
              {icon}
            </span>
            <span className={`text-md font-semibold leading-7 transition-colors ${isOpen ? 'text-purple-600' : 'text-gray-900'}`}>{question}</span>
          </div>
          <span className="ml-6 flex h-7 items-center">
            <ChevronDown
              className={`h-6 w-6 transform text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-600' : 'rotate-0'}`}
              aria-hidden="true"
            />
          </span>
        </button>
      </dt>
      <dd
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-6 pb-6">
            <p className="text-base leading-7 text-gray-700 border-t border-gray-200 pt-6 ml-10">{answer}</p>
        </div>
      </dd>
    </div>
  );
};

export default FaqItem;