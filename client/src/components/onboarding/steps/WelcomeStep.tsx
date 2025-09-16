import React from 'react'
import { useOnboarding } from '../../../context/OnboardingContext'
import { useOnboardingKeyboard } from '../../../hooks/useOnboardingKeyboard'
import { ArrowRight, Sparkles, Users, ChartBar } from 'lucide-react'

export const WelcomeStep: React.FC = () => {
  const { nextStep } = useOnboarding()

  useOnboardingKeyboard({
    onNext: nextStep,
  })

  return (
    <div className="text-center py-8">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mb-6 shadow-2xl animate-pulse-once">
          <Sparkles className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Reflect!
        </h2>

        <p className="text-xl text-gray-600 mb-8">
          Let&rsquo;s get you set up in just a few minutes
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300 card-hover-grow">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Collaborate</h3>
          <p className="text-sm text-gray-600">
            Work together with your team to build better products
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300 card-hover-grow">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <ChartBar className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Analyze</h3>
          <p className="text-sm text-gray-600">Get insights from user feedback and data</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100 hover:shadow-lg transition-all duration-300 card-hover-grow">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Improve</h3>
          <p className="text-sm text-gray-600">
            Make data-driven decisions to enhance your product
          </p>
        </div>
      </div>

      <div>
        <button
          onClick={nextStep}
          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 button-hover-lift shadow-lg"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
