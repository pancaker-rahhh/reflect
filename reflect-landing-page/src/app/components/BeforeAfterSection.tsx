"use client";

import React from 'react';
import { XCircle, CheckCircle } from 'lucide-react';

const beforeItems = [
  'Hard to identify friction points',
  '$189/months and 4 tools to handle all kind of feedback',
  'Blind decisions based on assumptions',
  'Annoying email surveys that disrupt users',
  'Back and forth emails exchange to understand the client context (OS, broken urls, etc.)',
  'Missed opportunities to improve customer experience',
];

const afterItems = [
  'User context provided in all bug reports (browser, device, screen size, etc.)',
  'Engage visitors with targeted, non-intrusive feedback widgets',
  'Centralized dashboard for all feedback',
  '3-minute setup with no-code installation',
  'Shareable public roadmap',
];

const BeforeAfterSection = () => {
  return (
    <div id="features" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Stop guessing, start <span className="text-purple-600">listening</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Move from scattered feedback and blind decisions to a clear, centralized hub of user insights. See the difference Reflect makes.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 rounded-2xl lg:grid-cols-2 lg:gap-8 bg-slate-50 p-8">
          {/* Before Column */}
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Before...</h3>
            <div className="space-y-4">
              {beforeItems.map((item, index) => (
                <div key={index} className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center gap-3 transition-transform duration-300 ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}>
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                  <p className="text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* After Column */}
          <div className="relative rounded-2xl p-8 bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-2xl">
             <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-white text-purple-600 font-bold py-1 px-3 rounded-full text-sm shadow-lg">
              RECOMMENDED
            </div>
            <h3 className="text-2xl font-bold mb-6">With Reflect</h3>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <ul className="space-y-4">
                {afterItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-1" />
                    <p className="text-lg">{item}</p>
                    </li>
                ))}
                </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-16">
            <a href="#" className="rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-transform hover:scale-105">
                Ready to improve your customer experience?
            </a>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSection;