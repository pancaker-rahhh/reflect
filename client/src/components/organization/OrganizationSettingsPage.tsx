import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  CreditCard, 
  Shield, 
  Puzzle, 
  Database, 
  FileText,
  Save,
  Upload,
  AlertCircle,
  Check,
  X,
  Mail,
  Plus,
  Trash2,
  Edit2,
  ChevronRight
} from 'lucide-react';
import { organizationApi, type Organization, type OrganizationMember } from '../../lib/api/organization';
import { invitationService } from '../../services/invitationService';
import { AnimatedInput } from '../onboarding/shared/AnimatedInput';
import { InviteMemberModal } from './InviteMemberModal';
import { BulkInviteModal } from './BulkInviteModal';

interface OrganizationSettingsPageProps {
  organizationId: string;
}

type Tab = 'general' | 'members' | 'billing' | 'security' | 'integrations' | 'advanced';

export const OrganizationSettingsPage: React.FC<OrganizationSettingsPageProps> = ({ 
  organizationId 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    industry: '',
    size: ''
  });

  useEffect(() => {
    loadOrganizationData();
  }, [organizationId]);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      const [orgData, membersData] = await Promise.all([
        organizationApi.getById(organizationId),
        organizationApi.getMembers(organizationId)
      ]);
      
      setOrganization(orgData);
      setMembers(membersData);
      setFormData({
        name: orgData.name || '',
        description: orgData.description || '',
        logo: '',
        website: '',
        industry: '',
        size: ''
      });
    } catch (error) {
      console.error('Failed to load organization data:', error);
      setMessage({ type: 'error', text: 'Failed to load organization data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      await organizationApi.update(organizationId, {
        name: formData.name,
        description: formData.description
      });
      setMessage({ type: 'success', text: 'Organization settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save organization:', error);
      setMessage({ type: 'error', text: 'Failed to save organization settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleResendInvite = async (memberId: string) => {
    try {
      // Call invitation service to resend
      await invitationService.resendInvitation(memberId);
      setMessage({ type: 'success', text: 'Invitation resent successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      setMessage({ type: 'error', text: 'Failed to resend invitation' });
    }
  };

  const handleCancelInvite = async (memberId: string) => {
    try {
      // Call invitation service to cancel
      await invitationService.cancelInvitation(memberId);
      // Reload members to reflect changes
      const membersData = await organizationApi.getMembers(organizationId);
      setMembers(membersData);
      setMessage({ type: 'success', text: 'Invitation cancelled' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      setMessage({ type: 'error', text: 'Failed to cancel invitation' });
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ];

  const renderGeneralSettings = () => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Information</h3>
        
        <div className="space-y-4">
          <AnimatedInput
            label="Organization Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter organization name"
            icon={<Building2 className="w-4 h-4" />}
          />

          <AnimatedInput
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of your organization"
          />

          <div className="grid grid-cols-2 gap-4">
            <AnimatedInput
              label="Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              type="url"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select 
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Logo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSaveGeneral}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderMembersSettings = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBulkInviteModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Bulk Invite
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Single
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className={`flex items-center justify-between p-4 rounded-lg ${
            member.is_pending ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                member.is_pending ? 'bg-yellow-100' : 'bg-indigo-100'
              }`}>
                <span className={`font-semibold ${
                  member.is_pending ? 'text-yellow-600' : 'text-indigo-600'
                }`}>
                  {member.name?.[0] || member.email?.[0] || 'U'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{member.name || member.email}</p>
                  {member.is_pending && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {member.is_pending ? (
                <>
                  <span className="px-3 py-1 text-sm text-gray-500 italic">
                    {member.role}
                  </span>
                  <button 
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    onClick={() => handleResendInvite(member.id)}
                  >
                    Resend
                  </button>
                  <button 
                    className="p-2 text-gray-400 hover:text-red-600"
                    onClick={() => handleCancelInvite(member.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <select 
                    value={member.role}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    onChange={() => {}}
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can invite multiple members at once using the bulk invite feature.
        </p>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing & Subscription</h3>
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-90">Current Plan</p>
            <h4 className="text-2xl font-bold mt-1">Professional</h4>
            <p className="text-sm opacity-90 mt-2">$49/month • 10 team members</p>
          </div>
          <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">Payment Method</p>
              <p className="text-sm text-gray-500">Visa ending in 4242</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Update
            </button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">Next Billing Date</p>
              <p className="text-sm text-gray-500">January 15, 2025</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaceholderSection = (title: string, description: string) => (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Coming Soon
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'members':
        return renderMembersSettings();
      case 'billing':
        return renderBillingSettings();
      case 'security':
        return renderPlaceholderSection(
          'Security Settings',
          'Configure SSO, 2FA, and other security settings for your organization.'
        );
      case 'integrations':
        return renderPlaceholderSection(
          'Integrations',
          'Connect your favorite tools and services to enhance your workflow.'
        );
      case 'advanced':
        return renderPlaceholderSection(
          'Advanced Settings',
          'Export data, manage audit logs, and configure advanced options.'
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Settings</h1>
        <p className="text-gray-600">Manage your organization settings and preferences</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>

      {showInviteModal && (
        <InviteMemberModal
          organizationId={organizationId}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {showBulkInviteModal && (
        <BulkInviteModal
          organizationId={organizationId}
          isOpen={showBulkInviteModal}
          onClose={() => setShowBulkInviteModal(false)}
          onSuccess={(count) => {
            setMessage({ type: 'success', text: `Successfully sent ${count} invitation${count !== 1 ? 's' : ''}` });
            setTimeout(() => setMessage(null), 5000);
            loadOrganizationData();
          }}
        />
      )}
    </div>
  );
};