import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ProjectMember } from '../../lib/api/project';

interface ProjectTeamMemberRowProps {
  member: ProjectMember;
  isCurrentUser: boolean;
  onRemove: (member: ProjectMember) => void;
  onRoleChange?: (member: ProjectMember, newRole: 'admin' | 'editor' | 'viewer') => void;
}

export const ProjectTeamMemberRow: React.FC<ProjectTeamMemberRowProps> = ({
  member,
  isCurrentUser,
  onRemove,
  onRoleChange
}) => {
  const canDelete = !isCurrentUser && !(member as any).is_organization_owner;

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Member Info */}
        <div className="col-span-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-900">
              {member.user_name || member.user_email || 'Unknown Member'}
              {isCurrentUser && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  You
                </span>
              )}
              {(member as any).is_organization_owner && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                  Org Owner
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500">{member.user_email || 'No email'}</p>
          </div>
        </div>

        {/* Status */}
        <div className="col-span-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
            Active
          </span>
        </div>

        {/* Role */}
        <div className="col-span-2">
          {(member as any).is_organization_owner ? (
            <span className="text-sm text-gray-900 font-medium">Admin (Org Owner)</span>
          ) : (
            <select 
              value={member.role}
              className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) => onRoleChange?.(member, e.target.value as 'admin' | 'editor' | 'viewer')}
              disabled={!onRoleChange}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="col-span-4">
          <div className="flex items-center gap-2">
            <div className="flex justify-end w-full">
              {canDelete && (
                <button 
                  onClick={() => onRemove(member)}
                  className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove from project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};