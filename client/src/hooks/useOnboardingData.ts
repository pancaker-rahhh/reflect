import { useCallback } from 'react';
import { onboardingDataService } from '../services/onboardingDataService';

export const useOnboardingData = () => {
  const saveProfileData = useCallback((data: any) => {
    onboardingDataService.saveProfileData(data);
  }, []);

  const saveOrganizationData = useCallback((data: any) => {
    onboardingDataService.saveOrganizationData(data);
  }, []);

  const saveProjectData = useCallback((data: any) => {
    onboardingDataService.saveProjectData(data);
  }, []);

  const saveTeamData = useCallback((data: any) => {
    onboardingDataService.saveTeamData(data);
  }, []);

  const getAllData = useCallback(() => {
    return onboardingDataService.getAllData();
  }, []);

  const clearAllData = useCallback(() => {
    onboardingDataService.clearAllData();
  }, []);

  return {
    saveProfileData,
    saveOrganizationData,
    saveProjectData,
    saveTeamData,
    getAllData,
    clearAllData
  };
};