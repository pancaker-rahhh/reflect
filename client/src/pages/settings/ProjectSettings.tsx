import React from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { ProjectSettingsPage } from '../../components/project/ProjectSettingsPage';

export function ProjectSettings() {
  const { currentProject } = useOrganization();

  return <ProjectSettingsPage projectId={currentProject?.id} />;
}