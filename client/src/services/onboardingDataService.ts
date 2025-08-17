interface OnboardingFormData {
  profile?: {
    name?: string;
    role?: string;
    company?: string;
    phone?: string;
    timezone?: string;
  };
  organization?: {
    name?: string;
    slug?: string;
    description?: string;
    size?: string;
    industry?: string;
  };
  project?: {
    name?: string;
    description?: string;
    type?: string;
    visibility?: string;
  };
  team?: {
    members?: Array<{ email: string; role: string }>;
    invitesSent?: number;
  };
}

class OnboardingDataService {
  private storagePrefix = 'onboarding_';

  saveStepData(step: string, data: unknown): void {
    try {
      const key = `${this.storagePrefix}${step}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${step} data:`, error);
    }
  }

  getStepData(step: string): unknown {
    try {
      const key = `${this.storagePrefix}${step}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to load ${step} data:`, error);
      return null;
    }
  }

  getAllData(): OnboardingFormData {
    return {
      profile: this.getStepData('profile'),
      organization: this.getStepData('organization'),
      project: this.getStepData('project'),
      team: this.getStepData('team')
    };
  }

  clearAllData(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.storagePrefix)
    );
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Helper methods for specific data
  saveProfileData(data: OnboardingFormData['profile']): void {
    this.saveStepData('profile', data);
  }

  saveOrganizationData(data: OnboardingFormData['organization']): void {
    this.saveStepData('organization', data);
  }

  saveProjectData(data: OnboardingFormData['project']): void {
    this.saveStepData('project', data);
  }

  saveTeamData(data: OnboardingFormData['team']): void {
    this.saveStepData('team', data);
  }

  getProfileData(): OnboardingFormData['profile'] {
    return this.getStepData('profile');
  }

  getOrganizationData(): OnboardingFormData['organization'] {
    return this.getStepData('organization');
  }

  getProjectData(): OnboardingFormData['project'] {
    return this.getStepData('project');
  }

  getTeamData(): OnboardingFormData['team'] {
    return this.getStepData('team');
  }
}

export const onboardingDataService = new OnboardingDataService();
export type { OnboardingFormData };