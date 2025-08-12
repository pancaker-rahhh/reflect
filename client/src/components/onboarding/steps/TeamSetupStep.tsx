import React, { useState } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext';
import { UserPlus, Mail, X } from 'lucide-react';
import { invitationApi } from '../../../lib/api';

interface TeamMember {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export const TeamSetupStep: React.FC = () => {
  const { nextStep, markStepCompleted } = useOnboarding();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isInviting, setIsInviting] = useState(false);

  const addTeamMember = () => {
    if (newMemberEmail && !teamMembers.find(m => m.email === newMemberEmail)) {
      setTeamMembers([...teamMembers, { email: newMemberEmail, role: newMemberRole }]);
      setNewMemberEmail('');
    }
  };

  const removeMember = (email: string) => {
    setTeamMembers(teamMembers.filter(m => m.email !== email));
  };

  const handleSkip = () => {
    markStepCompleted('team-setup');
    nextStep();
  };

  const handleSendInvites = async () => {
    setIsInviting(true);
    
    try {
      await invitationApi.sendBulk({
        invitations: teamMembers,
      });

      markStepCompleted('team-setup');
      nextStep();
    } catch (error) {
      console.error('Failed to send invitations:', error);
      // For now, just proceed to next step even if invitations fail
      markStepCompleted('team-setup');
      nextStep();
    } finally {
      setIsInviting(false);
    }
  };

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
              onChange={(e) => setNewMemberRole(e.target.value as any)}
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
            >
              Add
            </button>
          </div>

          <div className="mt-3 text-sm text-gray-500">
            <p><strong>Viewer:</strong> Can view projects and feedback</p>
            <p><strong>Member:</strong> Can create and edit content</p>
            <p><strong>Admin:</strong> Full access including settings</p>
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
          {teamMembers.length > 0 && (
            <button
              onClick={handleSendInvites}
              disabled={isInviting}
              className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInviting ? 'Sending Invites...' : `Send ${teamMembers.length} Invite${teamMembers.length !== 1 ? 's' : ''}`}
            </button>
          )}
          
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};