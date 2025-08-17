import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useAuth } from '../../../contexts/AuthContext';
import { userApi } from '../../../lib/api';
import { onboardingDataService } from '../../../services/onboardingDataService';
import { supabase } from '../../../lib/supabase';

export const ProfileStep: React.FC = () => {
  const { nextStep, markStepCompleted } = useOnboarding();
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    phone: '',
  });

  useEffect(() => {
    // Load existing profile data or set defaults
    const existingData = onboardingDataService.getProfileData();
    setFormData({
      name: existingData?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      company: existingData?.company || '',
      timezone: existingData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      phone: existingData?.phone || ''
    });
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update profile in backend
      await userApi.updateProfile({
        name: formData.name,
        company_name: formData.company,
        timezone: formData.timezone,
        phone: formData.phone,
      });

      // Update Supabase user metadata so the navbar shows the updated name
      await supabase.auth.updateUser({
        data: {
          name: formData.name,
          full_name: formData.name,
          company: formData.company,
          timezone: formData.timezone,
          phone: formData.phone,
        }
      });

      // Refresh user data in AuthContext to reflect the changes
      await refreshUser();

      // Save to localStorage for review step
      onboardingDataService.saveProfileData({
        name: formData.name,
        company: formData.company,
        timezone: formData.timezone,
        phone: formData.phone,
      });

      markStepCompleted('profile');
      nextStep();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Complete Your Profile
      </h2>
      <p className="text-gray-600 mb-6">
        Help us personalize your experience
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Acme Inc."
          />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            id="timezone"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
            <option value="Australia/Sydney">Sydney (AEDT)</option>
          </select>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.name}
          className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};