import React, { useState } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { Building, Sparkles } from 'lucide-react';
import { organizationApi, onboardingApi } from '../../../lib/api';

export const OrganizationStep: React.FC = () => {
  const { nextStep, markStepCompleted, setOrganizationId, userType } = useOnboarding();
  
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleAutoCreate = async () => {
    setIsAutoCreating(true);
    
    try {
      const organization = await onboardingApi.autoCreateOrganization();
      setOrganizationId(organization.id);
      markStepCompleted('organization');
      nextStep();
    } catch (error) {
      console.error('Failed to auto-create organization:', error);
    } finally {
      setIsAutoCreating(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAutoCreating(true);

    try {
      const organization = await organizationApi.create({
        name: formData.name,
        description: formData.description,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      });

      setOrganizationId(organization.id);
      markStepCompleted('organization');
      nextStep();
    } catch (error) {
      console.error('Failed to create organization:', error);
    } finally {
      setIsAutoCreating(false);
    }
  };

  if (userType === 'solo') {
    return (
      <div className="py-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
          <Building className="w-8 h-8 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Create Your Workspace
        </h2>
        <p className="text-gray-600 mb-8">
          We'll create a personal workspace for you automatically
        </p>

        <button
          onClick={handleAutoCreate}
          disabled={isAutoCreating}
          className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAutoCreating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating Workspace...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Create My Workspace
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Create Your Organization
      </h2>
      <p className="text-gray-600 mb-6">
        This will be the main workspace for your team
      </p>

      <form onSubmit={handleManualCreate} className="space-y-6">
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name *
          </label>
          <input
            type="text"
            id="orgName"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Acme Corporation"
          />
          {formData.name && (
            <p className="mt-1 text-xs text-gray-500">
              URL: reflect.app/{formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="orgDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="orgDescription"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="A brief description of your organization"
          />
        </div>

        <button
          type="submit"
          disabled={isAutoCreating || !formData.name}
          className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAutoCreating ? 'Creating Organization...' : 'Create Organization'}
        </button>
      </form>
    </div>
  );
};