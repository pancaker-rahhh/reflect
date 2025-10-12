import React, { useState } from 'react';
import { X, Key, Copy, Check, Shield } from 'lucide-react';
import { AnimatedInput } from '../onboarding/shared/AnimatedInput';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name: string, permissions: string[]) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onGenerate
}) => {
  const [keyName, setKeyName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['read']);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (keyName.trim()) {
      // Simulate key generation
      const newKey = `pk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
      setGeneratedKey(newKey);
      onGenerate(keyName, permissions);
    }
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setKeyName('');
    setPermissions(['read']);
    setGeneratedKey(null);
    setCopied(false);
    onClose();
  };

  const togglePermission = (permission: string) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative bg-background border border-border rounded-xl shadow-2xl max-w-lg w-full mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {generatedKey ? 'API Key Generated' : 'Generate API Key'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!generatedKey ? (
            <>
              <AnimatedInput
                label="Key Name"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
                helperText="A descriptive name to identify this key"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'read', label: 'Read', desc: 'Read project data and analytics' },
                    { id: 'write', label: 'Write', desc: 'Create and update resources' },
                    { id: 'delete', label: 'Delete', desc: 'Delete resources' },
                    { id: 'admin', label: 'Admin', desc: 'Full administrative access' }
                  ].map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{perm.label}</p>
                        <p className="text-sm text-gray-500">{perm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!keyName.trim() || permissions.length === 0}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Generate Key
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">API Key Generated Successfully</p>
                    <p className="text-sm text-green-700 mt-1">
                      Make sure to copy your API key now. You won't be able to see it again!
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your API Key
                </label>
                <div className="relative">
                  <div className="p-3 bg-gray-100 rounded-lg font-mono text-sm text-gray-700 pr-12">
                    {generatedKey}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Security Notice:</strong> Treat this key like a password. Don't share it or commit it to version control.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};