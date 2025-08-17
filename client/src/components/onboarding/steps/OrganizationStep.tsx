import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Building, Sparkles } from 'lucide-react';
import { organizationApi, onboardingApi } from '../../../lib/api';
import { onboardingDataService } from '../../../services/onboardingDataService';

export const OrganizationStep: React.FC = () => {
  const { nextStep, markStepCompleted, setOrganizationId, userType, organizationId } = useOnboarding();
  const { user } = useAuth();
  
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    // Load existing data or set default name
    const existingData = onboardingDataService.getOrganizationData();
    const profileData = onboardingDataService.getProfileData();
    
    if (existingData?.name) {
      setFormData({
        name: existingData.name,
        description: existingData.description || ''
      });
    } else {
      // Set default organization name based on user's name
      const userName = profileData?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
      const defaultOrgName = `${userName}'s org`;
      setFormData({
        name: defaultOrgName,
        description: ''
      });
    }
  }, [user]);

  const handleAutoCreate = async () => {
    setIsAutoCreating(true);
    
    try {
      const organization = await onboardingApi.autoCreateOrganization();
      
      // Save organization data for review step
      onboardingDataService.saveOrganizationData({
        name: organization.name,
        description: organization.description || '',
        slug: organization.slug
      });
      
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
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      let organization;
      if (organizationId) {
        // Update existing organization
        organization = await organizationApi.update(organizationId, {
          name: formData.name,
          description: formData.description,
        });
      } else {
        // Create new organization
        organization = await organizationApi.create({
          name: formData.name,
          description: formData.description,
          slug,
        });
        setOrganizationId(organization.id);
      }

      // Save organization data for review step
      onboardingDataService.saveOrganizationData({
        name: formData.name,
        description: formData.description,
        slug: organization.slug || slug
      });

      markStepCompleted('organization');
      nextStep();
    } catch (error) {
      console.error('Failed to create/update organization:', error);
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

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-bold">β</span>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Beta Limitation</h4>
            <p className="text-sm text-blue-700">
              During our beta period, we've limited users to one organization to ensure optimal performance and gather focused feedback. Thank you for your understanding!
            </p>
          </div>
        </div>
      </div>

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
          {isAutoCreating 
            ? (organizationId ? 'Updating Organization...' : 'Creating Organization...') 
            : (organizationId ? 'Update Organization' : 'Create Organization')
          }
        </button>
      </form>
    </div>
  );
};