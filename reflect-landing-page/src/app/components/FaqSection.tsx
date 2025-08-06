"use client"; // This directive marks the component as a Client Component.

import React, { useState } from 'react';
import FaqItem from './FaqItem';
import { LifeBuoy, Timer, BadgeCheck, MessageSquare, Paintbrush, Smartphone, BarChart3 } from 'lucide-react';

const faqData = [
    {
      question: 'How long does installation take?',
      answer: 'Installation is incredibly fast and takes less than 30 seconds. It just involves copying a single line of code into your website\'s HTML.',
      icon: <Timer size={24} />,
    },
    {
      question: 'Is there really a free plan?',
      answer: 'Yes, absolutely! Our free plan is free forever and includes all the core features you need to start collecting valuable feedback from your users.',
      icon: <BadgeCheck size={24} />,
    },
    {
      question: 'What types of feedback can I collect?',
      answer: 'You can collect various types of feedback, including bug reports, feature suggestions, general comments, and reviews. Our widget is flexible to suit your needs.',
      icon: <MessageSquare size={24} />,
    },
    {
      question: 'Can I customize the widget\'s appearance?',
      answer: 'Yes, you can customize the colors, position, and text of the widget to perfectly match your brand\'s look and feel directly from your dashboard.',
      icon: <Paintbrush size={24} />,
    },
    {
      question: 'Does it work on mobile?',
      answer: 'Of course. The Reflect widget is fully responsive and designed to work flawlessly on all devices, including desktops, tablets, and smartphones.',
      icon: <Smartphone size={24} />,
    },
     {
      question: 'What kind of analytics do you provide?',
      answer: 'We provide a comprehensive analytics dashboard that shows you trends in your feedback, common themes, and user satisfaction scores over time.',
      icon: <BarChart3 size={24} />,
    },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id ="faq" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
                <p className="text-base font-semibold leading-7 text-purple-600">FAQ</p>
                <h2 className="mt-2 text-3xl font-bold leading-10 tracking-tight text-gray-900 sm:text-4xl">
                    Frequently Asked Questions
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                    All the answers to start collecting your feedback today. Can’t find the answer you’re looking for? Reach out to our customer support team.
                </p>
                <a
                    href="#"
                    className="mt-10 inline-flex items-center gap-3 rounded-md bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                >
                    <LifeBuoy className="h-5 w-5" />
                    Contact Support
                </a>
            </div>
            <div className="mt-10 lg:col-span-7 lg:mt-0">
                <dl className="space-y-4">
                    {faqData.map((faq, index) => (
                        <FaqItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                        icon={faq.icon}
                        isOpen={openIndex === index}
                        onClick={() => handleToggle(index)}
                        />
                    ))}
                </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;