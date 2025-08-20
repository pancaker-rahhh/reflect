'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
    question: string;
    children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full py-4 text-left font-semibold"
            >
                <span>{question}</span>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {isOpen && <div className="pb-4">{children}</div>}
        </div>
    );
};

interface FAQProps {
    items: { question: string, answer: React.ReactNode }[];
}

const FAQ: React.FC<FAQProps> = ({ items }) => {
    return (
        <div>
            {items.map((item, index) => (
                <FAQItem key={index} question={item.question}>
                    {item.answer}
                </FAQItem>
            ))}
        </div>
    );
};

export default FAQ;
