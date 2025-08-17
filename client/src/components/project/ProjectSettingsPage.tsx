import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Users,
  Settings,
  Key,
  Webhook,
  Shield,
  Puzzle,
  Save,
  Trash2,
  AlertCircle,
  Check,
  Copy,
  RefreshCw,
  Link,
  Globe,
  Lock,
  Archive,
  AlertTriangle
} from 'lucide-react';
import { projectApi } from '../../lib/api/project';
import { useAppContext } from '../../context/AppContext';
import { AnimatedInput, AnimatedTextarea } from '../onboarding/shared/AnimatedInput';
import { ProjectMemberModal } from './ProjectMemberModal';
import { ApiKeyModal } from './ApiKeyModal';
import type { Project } from '@/types';

interface ProjectSettingsPageProps {
  projectId?: string;
}

type Tab = 'general' | 'team' | 'api' | 'webhooks' | 'integrations' | 'danger';

export const ProjectSettingsPage: React.FC<ProjectSettingsPageProps> = ({ projectId }) => {
  const { currentProject } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private',
    domain: '',
    timezone: 'UTC',
    language: 'en'
  });

  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production API Key', key: 'pk_live_xxxxxxxxxxx', created: '2024-01-15', lastUsed: '2024-01-20' },
    { id: '2', name: 'Development API Key', key: 'pk_test_xxxxxxxxxxx', created: '2024-01-10', lastUsed: 'Never' }
  ]);

  useEffect(() => {
    if (currentProject || projectId) {
      loadProjectData();
    }
  }, [currentProject, projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const id = projectId || currentProject?.id;
      if (!id) return;
      
      const projectData = await projectApi.getProject(id);
      setProject(projectData);
      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
        visibility: 'private',
        domain: '',
        timezone: 'UTC',
        language: 'en'
      });
    } catch (error) {
      console.error('Failed to load project:', error);
      setMessage({ type: 'error', text: 'Failed to load project data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      const id = projectId || currentProject?.id;
      if (!id) return;
      
      await projectApi.updateProject(id, {
        name: formData.name,
        description: formData.description
      });
      
      setMessage({ type: 'success', text: 'Project settings saved successfully' });
      refreshProjects();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save project:', error);
      setMessage({ type: 'error', text: 'Failed to save project settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone and will delete all associated data.'
    );
    
    if (!confirmed) return;
    
    try {
      const id = projectId || currentProject?.id;
      if (!id) return;
      
      await projectApi.deleteProject(id);
      setMessage({ type: 'success', text: 'Project deleted successfully' });
      refreshProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      setMessage({ type: 'error', text: 'Failed to delete project' });
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setMessage({ type: 'success', text: 'API key copied to clipboard' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleRegenerateApiKey = (keyId: string) => {
    const confirmed = window.confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.');
    if (confirmed) {
      setMessage({ type: 'success', text: 'API key regenerated successfully' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FolderOpen },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'danger', label: 'Danger Zone', icon: Shield },
  ];

  const renderGeneralSettings = () => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
        
        <div className="space-y-4">
          <AnimatedInput
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name"
            icon={<FolderOpen className="w-4 h-4" />}
          />

          <AnimatedTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your project"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
              <select 
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="team">Team Only</option>
              </select>
            </div>

            <AnimatedInput
              label="Custom Domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="app.yourdomain.com"
              icon={<Globe className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select 
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select 
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
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

  const renderTeamSettings = () => (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Team Members</h3>
        <p className="text-sm text-gray-600">Manage who has access to this specific project</p>
      </div>

      <div className="space-y-3">
        {[
          { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
          { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'member' }
        ].map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">{member.name[0]}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setShowMemberModal(true)}
        className="mt-4 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
      >
        Add Team Member
      </button>
    </div>
  );

  const renderApiKeysSettings = () => (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">API Keys</h3>
        <p className="text-sm text-gray-600">Manage API keys for accessing your project programmatically</p>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRegenerateApiKey(apiKey.id)}
                  className="p-2 text-gray-400 hover:text-indigo-600"
                  title="Regenerate key"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg font-mono text-sm">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-gray-600">{apiKey.key}</span>
              <button
                onClick={() => handleCopyApiKey(apiKey.key)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setShowApiKeyModal(true)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
      >
        <Key className="w-4 h-4" />
        Generate New API Key
      </button>
    </div>
  );

  const renderPlaceholderSection = (title: string, description: string, icon: React.ReactNode) => (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Coming Soon
        </button>
      </div>
    </div>
  );

  const renderDangerZone = () => (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-600">Irreversible and destructive actions</p>
      </div>

      <div className="space-y-4">
        <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Archive Project
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Archive this project. It will be hidden but can be restored later.
              </p>
            </div>
            <button className="px-4 py-2 border border-yellow-600 text-yellow-700 rounded-lg hover:bg-yellow-100">
              Archive
            </button>
          </div>
        </div>

        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Delete Project
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete this project and all of its data. This action cannot be undone.
              </p>
            </div>
            <button 
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'team':
        return renderTeamSettings();
      case 'api':
        return renderApiKeysSettings();
      case 'webhooks':
        return renderPlaceholderSection(
          'Webhooks',
          'Configure webhooks to receive real-time notifications about events in your project.',
          <Webhook className="w-8 h-8 text-gray-400" />
        );
      case 'integrations':
        return renderPlaceholderSection(
          'Integrations',
          'Connect your project with third-party services and tools.',
          <Puzzle className="w-8 h-8 text-gray-400" />
        );
      case 'danger':
        return renderDangerZone();
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Settings</h1>
        <p className="text-gray-600">Manage your project configuration and preferences</p>
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

      {showMemberModal && (
        <ProjectMemberModal
          projectId={projectId || currentProject?.id || ''}
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          onAdd={(memberId, role) => {
            setMessage({ type: 'success', text: 'Member added successfully' });
            setTimeout(() => setMessage(null), 3000);
          }}
          organizationMembers={[
            { id: '4', name: 'Alice Johnson', email: 'alice@example.com' },
            { id: '5', name: 'Charlie Brown', email: 'charlie@example.com' },
            { id: '6', name: 'Diana Prince', email: 'diana@example.com' }
          ]}
          existingMembers={['1', '2', '3']}
        />
      )}

      {showApiKeyModal && (
        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onGenerate={(name, permissions) => {
            setApiKeys(prev => [...prev, {
              id: Date.now().toString(),
              name,
              key: `pk_${Math.random().toString(36).substring(2, 15)}`,
              created: new Date().toISOString().split('T')[0],
              lastUsed: 'Never'
            }]);
            setMessage({ type: 'success', text: 'API key generated successfully' });
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}
    </div>
  );
};