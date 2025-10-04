import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/client';
import { FloppyDisk, WarningCircle } from 'phosphor-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  settings: Record<string, any>;
}

interface OrganizationDetailsProps {
  organizationId: string;
}

export const OrganizationDetails: React.FC<OrganizationDetailsProps> = ({ organizationId }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => apiClient.get<Organization>(`/organizations/${organizationId}`),
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        description: (organization as any).description || '',
      });
    }
  }, [organization]);

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiClient.put(`/organizations/${organizationId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
      setHasChanges(false);
    },
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Organization Information</h3>

        <div className="space-y-6">
          <div>
            <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              id="org-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label htmlFor="org-slug" className="block text-sm font-medium text-gray-700 mb-2">
              Organization URL
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm">reflect.app/</span>
              <span className="ml-1 font-mono text-sm text-gray-900">{(organization as any)?.slug}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Contact support to change your organization URL
            </p>
          </div>

          <div>
            <label htmlFor="org-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="org-description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe your organization"
            />
          </div>

          <div className="bg-secondary rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <WarningCircle className="w-4 h-4" />
              <span>Created on {new Date((organization as any)?.created_at || '').toLocaleDateString()}</span>
            </div>
          </div>

          {hasChanges && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">You have unsaved changes</p>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FloppyDisk className="w-4 h-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {updateMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                Failed to save changes. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};