import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationSettingsPage } from '../../components/organization/OrganizationSettingsPage';

export const OrganizationSettings: React.FC = () => {
  const { user } = useAuth();

  // For now, we'll use the first organization ID
  // In a real app, this would come from route params or context
  const organizationId = user?.user_metadata?.primary_organization_id || '1';

  return <OrganizationSettingsPage organizationId={organizationId} />;
};