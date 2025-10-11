import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { getNames, getCodes } from 'country-list'
import { useOnboarding } from '../../../context/OnboardingContext'
import { useAuth } from '../../../contexts/AuthContext'
import { userApi } from '../../../lib/api'
import { onboardingDataService } from '../../../services/onboardingDataService'
import { supabase } from '../../../lib/supabase'

export const ProfileStep: React.FC = () => {
  const { nextStep, markStepCompleted } = useOnboarding()
  const { user, refreshUser } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    country: '',
  })

  // Create country options for the select
  const countryOptions = getNames().map((name: string, index: number) => ({
    value: getCodes()[index] || '',
    label: name,
  }))

  useEffect(() => {
    // Load existing profile data or set defaults
    const existingData = onboardingDataService.getProfileData()
    setFormData({
      name:
        existingData?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      company: existingData?.company || '',
      country: existingData?.country || '',
    })
  }, [user])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update profile in backend
      await userApi.updateProfile({
        name: formData.name,
        company_name: formData.company,
        country: formData.country,
      })

      // Update Supabase user metadata so the navbar shows the updated name
      await supabase.auth.updateUser({
        data: {
          name: formData.name,
          full_name: formData.name,
          company: formData.company,
          country: formData.country,
        },
      })

      // Refresh user data in AuthContext to reflect the changes
      await refreshUser()

      // Save to localStorage for review step
      onboardingDataService.saveProfileData({
        name: formData.name,
        company: formData.company,
        country: formData.country,
      })

      markStepCompleted('profile')
      nextStep()
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
      <p className="mb-6">Help us personalize your experience</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-background"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-2">
            Company Name
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-background"
            placeholder="Acme Inc."
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-2">
            Country
          </label>
          <Select
            id="country"
            value={countryOptions.find((option) => option.value === formData.country)}
            onChange={(selectedOption: { value: string; label: string } | null) =>
              setFormData({ ...formData, country: selectedOption?.value || '' })
            }
            options={countryOptions}
            placeholder="Select your country..."
            isSearchable
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (provided, state) => ({
                ...provided,
                borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
                boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
                '&:hover': {
                  borderColor: '#6366f1',
                },
                padding: '2px 8px',
                fontSize: '16px',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? '#6366f1'
                  : state.isFocused
                    ? '#e0e7ff'
                    : 'white',
                color: state.isSelected ? 'white' : '#374151',
              }),
            }}
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
  )
}
