import React from 'react';


interface ProjectTeamHeaderProps {
  onAddMember: () => void;
}

export const ProjectTeamHeader: React.FC<ProjectTeamHeaderProps> = ({ onAddMember }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Team Members</h3>
          <p className="text-sm text-gray-600">Manage who has access to this specific project</p>
        </div>
        <button 
          onClick={onAddMember}
          className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Add Team Member
        </button>
      </div>
    </div>
  );
};