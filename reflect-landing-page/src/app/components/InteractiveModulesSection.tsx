"use client";

import { useState } from 'react';
import { Star, FileText, Bug, Lightbulb, ChevronRight, MessageCircle, Zap } from 'lucide-react';

// Define the structure for a module
interface Module {
  id: 'reviews' | 'surveys' | 'bugs' | 'features';
  name: string;
  description: string;
  icon: React.ReactNode;
}

// Module data with specific icon colors
const modules: Module[] = [
  { id: 'reviews', name: 'Reviews & Surveys', description: 'Customer feedback & ratings', icon: <Star className="text-green-500" /> },
  { id: 'surveys', name: 'Custom Surveys', description: 'NPS, CSAT & custom forms', icon: <FileText className="text-blue-500" /> },
  { id: 'bugs', name: 'Bug Reports', description: 'Issue reporting with screenshots', icon: <Bug className="text-red-500" /> },
  { id: 'features', name: 'Feature Requests', description: 'Ideas with voting system', icon: <Lightbulb className="text-purple-500" /> },
];

const InteractiveModulesSection = () => {
  const [activeModules, setActiveModules] = useState({
    reviews: true,
    surveys: true,
    bugs: true,
    features: true,
  });

  const handleToggle = (id: Module['id']) => {
    setActiveModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(activeModules).filter(Boolean).length;

  return (
    <div id = "interactive-modules" className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            4 powerful modules in one widget
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            <span className="font-semibold text-purple-600">Save $200/month</span> by replacing separate tools.
            Toggle modules on/off to see how your widget adapts in real-time.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-6xl rounded-2xl bg-white p-4 sm:p-8 shadow-2xl ring-1 ring-gray-200/50">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              {/* Module Controls */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 px-4 mb-2">Module Controls</h3>
                {modules.map((module, index) => (
                  <div key={module.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`bg-gray-100 p-3 rounded-lg`}>{module.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{module.name}</h4>
                        <p className="text-sm text-gray-500">{module.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(module.id)}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                        activeModules[module.id] ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          activeModules[module.id] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
                <div className="pt-4 px-4">
                    <div className="bg-purple-50 text-purple-700 font-semibold p-4 rounded-xl text-center flex items-center justify-center gap-2">
                        <Zap size={16} /> {activeCount} {activeCount === 1 ? 'module' : 'modules'} active
                    </div>
                </div>
              </div>

              {/* Live Widget Preview */}
              <div className="sticky top-28 h-[500px] bg-slate-100 rounded-2xl p-4">
                <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-500 p-5 text-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <MessageCircle />
                        <h4 className="text-lg font-bold">How can we help you today?</h4>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 flex-grow overflow-hidden">
                    {modules.map((module) => (
                       <div
                        key={`preview-${module.id}`}
                        className={`transition-all duration-300 ease-in-out ${activeModules[module.id] ? 'transform-none opacity-100' : 'transform -translate-x-4 opacity-0'}`}
                        style={{ height: activeModules[module.id] ? 'auto' : '0' }}
                      >
                        {
                            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer mb-2">
                                <div className="flex items-center gap-4">
                                    {module.icon}
                                    <span className="font-medium text-gray-700">{module.name.split(' & ')[0]}</span>
                                </div>
                                <ChevronRight className="text-gray-400" />
                            </div>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        </div>
        <div className="text-center mt-16">
            <a href="#" className="rounded-full bg-purple-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-transform hover:scale-105">
                Try it Free - Setup in 3 minutes
            </a>
        </div>
      </div>
    </div>
  );
};

export default InteractiveModulesSection;