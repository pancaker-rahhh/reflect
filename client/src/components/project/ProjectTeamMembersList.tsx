import React from 'react';
import { Users } from 'lucide-react';
import type { ProjectMember } from '../../lib/api/project';
import { ProjectTeamMemberRow } from './ProjectTeamMemberRow';

interface ProjectTeamMembersListProps {
  members: ProjectMember[];
  currentUserId?: string;
  onRemoveMember: (member: ProjectMember) => void;
  onRoleChange?: (member: ProjectMember, newRole: 'admin' | 'editor' | 'viewer') => void;
}

export const ProjectTeamMembersList: React.FC<ProjectTeamMembersListProps> = ({
  members,
  currentUserId,
  onRemoveMember,
  onRoleChange
}) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h4 className="text-gray-900 font-medium mb-2">No team members yet</h4>
        <p className="text-gray-500 text-sm mb-4">Add team members to collaborate on this project</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Member</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-4">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {members.map((member) => (
          <ProjectTeamMemberRow
            key={member.id}
            member={member}
            isCurrentUser={currentUserId === member.user_id}
            onRemove={onRemoveMember}
            onRoleChange={onRoleChange}
          />
        ))}
      </div>
    </div>
  );
};