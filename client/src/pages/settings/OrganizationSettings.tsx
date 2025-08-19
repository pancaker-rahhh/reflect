import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { OrganizationSettingsPage } from '../../components/organization/OrganizationSettingsPage';

export const OrganizationSettings: React.FC = () => {
  const { organization } = useAppContext();

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">No organization found</p>
        </div>
      </div>
    );
  }

  return <OrganizationSettingsPage organizationId={organization.id} />;
};