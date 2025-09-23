import React, { useState, useCallback, useEffect } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { useOnboardingKeyboard } from '../../../hooks/useOnboardingKeyboard';
import { useOnboardingData } from '../../../hooks/useOnboardingData';
import { UserPlus, Mail, X, Users } from 'lucide-react';
import { invitationApi } from '../../../lib/api';
import { BulkInviteModal } from '../../organization/BulkInviteModal';
import { onboardingDataService } from '../../../services/onboardingDataService';
import { isFeatureEnabled } from '../../../lib/featureFlags';

interface TeamMember {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export const TeamSetupStep: React.FC = () => {
  const { nextStep, organizationId } = useOnboarding();
  const { saveTeamData } = useOnboardingData();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [showBulkInvite, setShowBulkInvite] = useState(false);

  // Load existing team data when component mounts
  useEffect(() => {
    const existingTeamData = onboardingDataService.getTeamData();
    if (existingTeamData?.members && existingTeamData.members.length > 0) {
      setTeamMembers(existingTeamData.members as TeamMember[]);
    }
  }, []);

  const addTeamMember = () => {
    if (newMemberEmail && !teamMembers.find(m => m.email === newMemberEmail)) {
      const updatedMembers = [...teamMembers, { email: newMemberEmail, role: newMemberRole }];
      setTeamMembers(updatedMembers);
      setNewMemberEmail('');
      
      // Save to localStorage immediately
      onboardingDataService.saveTeamData({
        members: updatedMembers,
        invitesSent: 0
      });
    }
  };

  const removeMember = (email: string) => {
    const updatedMembers = teamMembers.filter(m => m.email !== email);
    setTeamMembers(updatedMembers);
    
    // Save to localStorage immediately
    onboardingDataService.saveTeamData({
      members: updatedMembers,
      invitesSent: 0
    });
  };

  const handleSkip = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handleSendInvites = useCallback(async () => {
    setIsInviting(true);
    
    try {
      await invitationApi.sendBulk({
        invitations: teamMembers,
      });

      saveTeamData({
        members: teamMembers,
        invitesSent: teamMembers.length
      });

      nextStep();
    } catch (error) {
      console.error('Failed to send invitations:', error);
      // For now, just proceed to next step even if invitations fail
      saveTeamData({
        members: teamMembers,
        invitesSent: 0
      });
      nextStep();
    } finally {
      setIsInviting(false);
    }
  }, [teamMembers, saveTeamData, nextStep]);

  const handleBulkInviteSuccess = (count: number) => {
    const existingTeamData = onboardingDataService.getTeamData();
    saveTeamData({
      members: existingTeamData?.members || teamMembers,
      invitesSent: count
    });
    nextStep();
  };

  // Memoize keyboard shortcut handlers to prevent infinite re-renders
  const handleAddMember = useCallback(() => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  const handleNextAction = useCallback(() => {
    if (teamMembers.length > 0) {
      handleSendInvites();
    } else {
      handleSkip();
    }
  }, [teamMembers.length, handleSendInvites, handleSkip]);

  useOnboardingKeyboard({
    onAddMember: handleAddMember,
    onNext: handleNextAction,
    enabled: !isInviting
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <UserPlus className="w-8 h-8 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Invite Your Team
        </h2>
        <p className="text-gray-600">
          Add team members to start collaborating (you can always do this later)
        </p>
      </div>

      <div className="space-y-6">
        {isFeatureEnabled('ENABLE_BULK_TEXT_INVITES') || isFeatureEnabled('ENABLE_CSV_UPLOAD_INVITES') ? (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setShowBulkInvite(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
            >
              <Users className="w-5 h-5" />
              Bulk Invite (Recommended)
            </button>
            <div className="flex items-center gap-2 text-gray-500">
              <span>or</span>
            </div>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add One by One
            </button>
          </div>
        ) : (
          <div className="text-center mb-4">
            <button
              onClick={() => setShowBulkInvite(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Users className="w-5 h-5" />
              Add Team Members
            </button>
            <p className="mt-2 text-sm text-gray-500">
              You can also add individual members below
            </p>
          </div>
        )}

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-3">Add Team Member</h3>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && addTeamMember()}
              />
            </div>
            
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'member' | 'viewer')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            
            <button
              onClick={addTeamMember}
              disabled={!newMemberEmail}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Press Enter to add"
            >
              Add
            </button>
          </div>

          <div className="mt-3 text-sm text-gray-500">
            <p><strong>Viewer:</strong> Can view projects and feedback</p>
            <p><strong>Member:</strong> Can create and edit content</p>
            <p><strong>Admin:</strong> Full access including settings</p>
            <p className="mt-2 text-xs"><kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600">Ctrl + A</kbd> to focus email field</p>
          </div>
        </div>

        {teamMembers.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Team Members ({teamMembers.length})</h3>
            
            <div className="space-y-2">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800">{member.email}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                  <button
                    onClick={() => removeMember(member.email)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {teamMembers.length > 0 ? (
            <button
              onClick={handleSendInvites}
              disabled={isInviting}
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInviting ? 'Sending Invites...' : `Send ${teamMembers.length} Invite${teamMembers.length !== 1 ? 's' : ''}`}
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Continue Without Team Setup
            </button>
          )}
        </div>
      </div>

      {showBulkInvite && (
        <BulkInviteModal
          organizationId={organizationId || ''}
          isOpen={showBulkInvite}
          onClose={() => setShowBulkInvite(false)}
          onSuccess={handleBulkInviteSuccess}
        />
      )}
    </div>
  );
};