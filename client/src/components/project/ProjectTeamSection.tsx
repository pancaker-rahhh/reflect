import React from 'react';
import type { ProjectMember } from '../../lib/api/project';
import { ProjectTeamHeader } from './ProjectTeamHeader';
import { ProjectTeamMembersList } from './ProjectTeamMembersList';

interface ProjectTeamSectionProps {
  members: ProjectMember[];
  currentUserId?: string;
  onAddMember: () => void;
  onRemoveMember: (member: ProjectMember) => void;
  onRoleChange?: (member: ProjectMember, newRole: 'admin' | 'editor' | 'viewer') => void;
}

export const ProjectTeamSection: React.FC<ProjectTeamSectionProps> = ({
  members,
  currentUserId,
  onAddMember,
  onRemoveMember,
  onRoleChange
}) => {
  return (
    <div className="p-6">
      <ProjectTeamHeader onAddMember={onAddMember} />
      <ProjectTeamMembersList
        members={members}
        currentUserId={currentUserId}
        onRemoveMember={onRemoveMember}
        onRoleChange={onRoleChange}
      />
    </div>
  );
};