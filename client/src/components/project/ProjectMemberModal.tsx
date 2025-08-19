import React, { useState } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
import { AnimatedInput } from '../onboarding/shared/AnimatedInput';

interface ProjectMemberModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memberId: string, role: string) => void;
  organizationMembers: Array<{ id: string; name: string; email: string; avatar?: string }>;
  existingMembers: string[];
}

export const ProjectMemberModal: React.FC<ProjectMemberModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onAdd,
  organizationMembers,
  existingMembers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingNewMember, setIsAddingNewMember] = useState(false);

  if (!isOpen) return null;

  const availableMembers = organizationMembers.filter(
    member => !existingMembers.includes(member.id)
  );

  const filteredMembers = availableMembers.filter(member =>
    (member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = () => {
    if (isAddingNewMember && newMemberEmail) {
      // For new members, we'll use a special identifier that the parent can handle
      onAdd(`new:${newMemberEmail}`, selectedRole);
      setNewMemberEmail('');
      setIsAddingNewMember(false);
      onClose();
    } else if (selectedMember) {
      onAdd(selectedMember, selectedRole);
      setSelectedMember(null);
      setSearchQuery('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add Project Member</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsAddingNewMember(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                !isAddingNewMember 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              From Organization
            </button>
            <button
              onClick={() => setIsAddingNewMember(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isAddingNewMember 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Invite New User
            </button>
          </div>

          {!isAddingNewMember ? (
            <AnimatedInput
              placeholder="Search organization members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          ) : (
            <div className="space-y-3">
              <AnimatedInput
                placeholder="Enter email address..."
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                icon={<UserPlus className="w-4 h-4" />}
                type="email"
              />
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> This user will be invited to both the organization and this project. 
                  They'll receive an email invitation to join.
                </p>
              </div>
            </div>
          )}

          {!isAddingNewMember && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  {searchQuery ? 'No members found' : 'All organization members are already in this project'}
                </p>
              ) : (
                filteredMembers.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMember === member.id
                      ? 'bg-indigo-50 border-2 border-indigo-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="member"
                    value={member.id}
                    checked={selectedMember === member.id}
                    onChange={() => setSelectedMember(member.id)}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name?.[0] || member.email[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name || member.email}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </label>
                ))
              )}
            </div>
          )}

          {(selectedMember || (isAddingNewMember && newMemberEmail)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['viewer', 'editor', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium capitalize transition-all ${
                      selectedRole === role
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!selectedMember && (!isAddingNewMember || !newMemberEmail)}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isAddingNewMember ? 'Invite & Add' : 'Add Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};