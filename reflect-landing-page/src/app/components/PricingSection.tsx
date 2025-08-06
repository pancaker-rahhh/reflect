"use client";

import { useState } from 'react';
import { Check, Zap } from 'lucide-react';

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: '$0', annually: '$0' },
      description: 'Perfect for hobby projects & early-stage startups.',
      features: [
        'Manage 1 project',
        'Enable 1 active widget',
        '20 responses/month',
        '20 bug reports/month',
        '20 feature requests/month',
        'Public roadmap page',
      ],
      buttonText: 'Start for Free',
      primary: false,
    },
    pro: {
      name: 'Pro',
      price: { monthly: '$49', annually: '$490' },
      description: 'The ultimate toolkit for growing businesses.',
      features: [
        'Manage 2 projects',
        'Unlimited active widgets',
        'Unlimited responses',
        'Unlimited bug reports',
        'Unlimited feature requests',
        'Get a dofollow backlink',
        'Public roadmap page',
        'Priority email support',
        'Option to remove branding',
        'Advanced user targeting',
      ],
      buttonText: 'Start Your Free Trial',
      primary: true,
    },
  };

  return (
    <div id="pricing" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-base font-semibold leading-7 text-purple-600">Pricing</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            The Right Plan for Your Needs
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Start for free, and unlock more power as you grow. No hidden fees, ever.
          </p>
        </div>

          <div className="mt-16 flex justify-center items-center gap-4">
            <span
              className={`font-semibold transition-colors ${
                billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              Monthly
            </span>
            <div
              className="relative rounded-full p-1 bg-gray-800 flex cursor-pointer w-14"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
            >
              <div
                className="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300"
                style={{ transform: `translateX(${billingCycle === 'monthly' ? '0px' : '28px'})` }}
              ></div>
            </div>
            <span
              className={`font-semibold transition-colors ${
                billingCycle === 'annually' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              Annually
            </span>
            <span
              className={`inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 transition-opacity duration-300 ${
                billingCycle === 'annually' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Get 2 months free!
            </span>
          </div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {Object.values(plans).map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 transition-all duration-300 xl:p-10 ${
                plan.primary ? 'bg-white ring-2 ring-purple-600 shadow-2xl' : 'bg-gray-50 ring-1 ring-gray-200'
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 className={`text-xl font-semibold leading-8 ${plan.primary ? 'text-purple-600' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                {plan.primary && (
                  <p className="rounded-full bg-purple-600/10 px-3 py-1 text-sm font-semibold leading-5 text-purple-600 flex items-center gap-1">
                    <Zap size={16} /> Most Popular
                  </p>
                )}
              </div>
              <p className="mt-4 text-base leading-7 text-gray-600">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-5xl font-bold tracking-tight text-gray-900">{plan.price[billingCycle]}</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  {billingCycle === 'monthly' ? '/month' : '/year'}
                </span>
              </p>
              <a
                href="#"
                className={`mt-8 block rounded-md px-3 py-3 text-center text-base font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                  plan.primary
                    ? 'bg-purple-600 text-white shadow-sm hover:bg-purple-500 focus-visible:outline-purple-600'
                    : 'bg-white text-purple-600 ring-1 ring-inset ring-purple-200 hover:bg-purple-50'
                }`}
              >
                {plan.buttonText}
              </a>
              <ul role="list" className="mt-8 space-y-4 text-base leading-6 text-gray-700 xl:mt-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-purple-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;