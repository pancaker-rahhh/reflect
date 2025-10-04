import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  Users,
  Upload,
  FileText,
  AlertCircle,
  Trash2,
  Plus,
  Download,
  Edit2
} from 'lucide-react';
import { organizationApi } from '../../lib/api/organization';
import { AnimatedInput, AnimatedTextarea } from '../onboarding/shared/AnimatedInput';
import { isFeatureEnabled } from '../../lib/featureFlags';

interface BulkInviteModalProps {
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface InviteEntry {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'member' | 'viewer';
  status?: 'valid' | 'invalid' | 'duplicate';
  error?: string;
}

type InputMode = 'manual' | 'bulk' | 'csv';

export const BulkInviteModal: React.FC<BulkInviteModalProps> = ({
  organizationId: _organizationId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [invites, setInvites] = useState<InviteEntry[]>([
    { id: '1', email: '', role: 'member' }
  ]);
  const [bulkText, setBulkText] = useState('');
  const [defaultRole, setDefaultRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInvites = (): boolean => {
    const errors: string[] = [];
    const emails = new Set<string>();
    let hasValidInvite = false;

    const entriesToValidate = inputMode === 'manual' ? invites : parseBulkText();

    entriesToValidate.forEach((invite, index) => {
      if (!invite.email) return;

      if (!validateEmail(invite.email)) {
        errors.push(`Invalid email at line ${index + 1}: ${invite.email}`);
      } else if (emails.has(invite.email.toLowerCase())) {
        errors.push(`Duplicate email: ${invite.email}`);
      } else {
        emails.add(invite.email.toLowerCase());
        hasValidInvite = true;
      }
    });

    setValidationErrors(errors);
    return hasValidInvite && errors.length === 0;
  };

  const parseBulkText = (): InviteEntry[] => {
    const lines = bulkText.split(/[\n,;]+/).map(line => line.trim()).filter(Boolean);
    return lines.map((line, index) => {
      const parts = line.split(/\s+/);
      const email = parts.find(part => part.includes('@')) || line;
      const name = parts.filter(part => part !== email).join(' ');
      
      return {
        id: `bulk-${index}`,
        email: email.trim(),
        name: name || undefined,
        role: defaultRole,
        status: validateEmail(email.trim()) ? 'valid' : 'invalid'
      };
    });
  };

  const handleAddManualInvite = () => {
    setInvites([...invites, {
      id: Date.now().toString(),
      email: '',
      role: 'member'
    }]);
  };

  const handleRemoveInvite = (id: string) => {
    setInvites(invites.filter(invite => invite.id !== id));
  };

  const handleUpdateInvite = (id: string, field: keyof InviteEntry, value: any) => {
    setInvites(invites.map(invite =>
      invite.id === id ? { ...invite, [field]: value } : invite
    ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setBulkText(text);
      setInputMode('bulk');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!validateInvites()) {
      setError('Please fix validation errors before sending invitations');
      return;
    }

    try {
      setSending(true);
      setError(null);

      const invitesToSend = inputMode === 'manual' 
        ? invites.filter(i => i.email)
        : parseBulkText();

      const validInvites = invitesToSend.filter(i => validateEmail(i.email));

      await organizationApi.sendBulk({
        invitations: validInvites.map(({ email, role }) => ({ email, role }))
      });

      onSuccess(validInvites.length);
      onClose();
    } catch (err) {
      console.error('Failed to send invitations:', err);
      setError('Failed to send invitations. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const downloadTemplate = () => {
    const template = `email,name,role
john.doe@example.com,John Doe,member
jane.smith@example.com,Jane Smith,admin
bob.wilson@example.com,Bob Wilson,viewer`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invite-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getValidInviteCount = () => {
    if (inputMode === 'manual') {
      return invites.filter(i => i.email && validateEmail(i.email)).length;
    }
    return parseBulkText().filter(i => validateEmail(i.email)).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-tertiary rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bulk Invite Team Members</h2>
              <p className="text-sm text-gray-600">Invite multiple people to your organization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Input Mode Selector */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'manual', label: 'Manual Entry', icon: Edit2, enabled: true },
              { id: 'bulk', label: 'Bulk Text', icon: FileText, enabled: isFeatureEnabled('ENABLE_BULK_TEXT_INVITES') },
              { id: 'csv', label: 'Upload CSV', icon: Upload, enabled: isFeatureEnabled('ENABLE_CSV_UPLOAD_INVITES') }
            ].filter(mode => mode.enabled).map(mode => (
              <button
                key={mode.id}
                onClick={() => setInputMode(mode.id as InputMode)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  inputMode === mode.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                <span className="font-medium">{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Manual Entry Mode */}
          {inputMode === 'manual' && (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <AnimatedInput
                      type="email"
                      value={invite.email}
                      onChange={(e) => handleUpdateInvite(invite.id, 'email', e.target.value)}
                      placeholder="email@example.com"
                      error={invite.status === 'invalid' ? 'Invalid email' : undefined}
                    />
                  </div>
                  <select
                    value={invite.role}
                    onChange={(e) => handleUpdateInvite(invite.id, 'role', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleRemoveInvite(invite.id)}
                    disabled={invites.length === 1}
                    className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleAddManualInvite}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Another
              </button>
            </div>
          )}

          {/* Bulk Text Mode */}
          {inputMode === 'bulk' && isFeatureEnabled('ENABLE_BULK_TEXT_INVITES') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Role for All Invites
                </label>
                <select
                  value={defaultRole}
                  onChange={(e) => setDefaultRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <AnimatedTextarea
                label="Enter emails (one per line or comma-separated)"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="john@example.com, jane@example.com&#10;bob@example.com&#10;alice@example.com"
                rows={8}
                helperText={`Detected ${parseBulkText().length} email addresses`}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBulkText(`john.doe@example.com
jane.smith@example.com
bob.wilson@example.com
alice.johnson@example.com`);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Load Example
                </button>
                <button
                  onClick={() => setBulkText('')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* CSV Upload Mode */}
          {inputMode === 'csv' && isFeatureEnabled('ENABLE_CSV_UPLOAD_INVITES') && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drop your CSV file here or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Choose File
                </button>
              </div>

              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Validation Errors</p>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Role Permissions Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Role Permissions</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Viewer:</strong> Can view projects and data</p>
              <p><strong>Member:</strong> Can create and edit content</p>
              <p><strong>Admin:</strong> Full access including settings</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {getValidInviteCount() > 0 && (
                <span className="font-medium text-indigo-600">
                  {getValidInviteCount()} valid invitation{getValidInviteCount() !== 1 ? 's' : ''} ready
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={sending || getValidInviteCount() === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send {getValidInviteCount()} Invitation{getValidInviteCount() !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};