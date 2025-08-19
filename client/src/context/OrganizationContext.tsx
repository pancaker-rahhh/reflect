import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { organizationApi, type Organization } from '../lib/api/organization';
import { projectApi } from '../lib/api/project';
import type { Project } from '@/types';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentProject: Project | null;
  organizations: Organization[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  setCurrentOrganization: (org: Organization) => void;
  setCurrentProject: (project: Project) => void;
  refreshOrganizations: () => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (currentOrganization) {
      loadProjects(currentOrganization.id);
      localStorage.setItem('currentOrganizationId', currentOrganization.id);
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('currentProjectId', currentProject.id);
    }
  }, [currentProject]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const orgs = await organizationApi.getMy();
      setOrganizations(orgs);
      
      // Set default organization
      if (orgs.length > 0) {
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        const savedOrg = orgs.find(org => org.id === savedOrgId);
        setCurrentOrganization(savedOrg || orgs[0]);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (orgId: string) => {
    try {
      const response = await projectApi.getByOrganization(orgId);
      setProjects(response.items);
      
      // Set default project
      if (response.items.length > 0) {
        const savedProjectId = localStorage.getItem('currentProjectId');
        const savedProject = response.items.find(proj => proj.id === savedProjectId);
        setCurrentProject(savedProject || response.items[0]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects');
    }
  };

  const refreshOrganizations = async () => {
    await loadOrganizations();
  };

  const refreshProjects = async () => {
    if (currentOrganization) {
      await loadProjects(currentOrganization.id);
    }
  };

  const handleSetCurrentOrganization = (org: Organization) => {
    setCurrentOrganization(org);
    setCurrentProject(null); // Reset project when org changes
  };

  const handleSetCurrentProject = (project: Project) => {
    setCurrentProject(project);
  };

  return (
    <OrganizationContext.Provider 
      value={{
        currentOrganization,
        currentProject,
        organizations,
        projects,
        loading,
        error,
        setCurrentOrganization: handleSetCurrentOrganization,
        setCurrentProject: handleSetCurrentProject,
        refreshOrganizations,
        refreshProjects
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};