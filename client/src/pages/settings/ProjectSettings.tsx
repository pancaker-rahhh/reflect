
import { useAppContext } from '../../context/AppContext';
import { ProjectSettingsPage } from '../../components/project/ProjectSettingsPage';

export function ProjectSettings() {
  const { currentProject } = useAppContext();

  return <ProjectSettingsPage projectId={currentProject?.id} />;
}