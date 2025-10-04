import React from 'react';
import { Building, Users, Settings, Shield } from 'lucide-react';
import { OrganizationMembers } from './OrganizationMembers';
import { OrganizationDetails } from './OrganizationDetails';
import { isFeatureEnabled } from '../../lib/featureFlags';

interface OrganizationSettingsProps {
  organizationId: string;
}

type Tab = 'details' | 'members' | 'settings' | 'billing';

export const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('details');
  const teamFeaturesEnabled = isFeatureEnabled('ENABLE_TEAM_FEATURES');

  const tabs = [
    { id: 'details', label: 'Organization', icon: Building },
    ...(teamFeaturesEnabled ? [{ id: 'members', label: 'Members & Roles', icon: Users }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'billing', label: 'Billing', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <OrganizationDetails organizationId={organizationId} />;
      case 'members':
        return <OrganizationMembers organizationId={organizationId} />;
      case 'settings':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Organization Settings</h3>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        );
      case 'billing':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Billing</h3>
            <p className="text-muted-foreground">Billing management coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization details, members, and settings</p>
      </div>

      <div className="bg-tertiary rounded-lg shadow">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};