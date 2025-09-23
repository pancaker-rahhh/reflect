import { useCallback } from 'react';
import { onboardingDataService, type OnboardingFormData } from '../services/onboardingDataService';

export const useOnboardingData = () => {
  const saveProfileData = useCallback((data: OnboardingFormData['profile']) => {
    onboardingDataService.saveProfileData(data);
  }, []);

  const saveOrganizationData = useCallback((data: OnboardingFormData['organization']) => {
    onboardingDataService.saveOrganizationData(data);
  }, []);

  const saveProjectData = useCallback((data: OnboardingFormData['project']) => {
    onboardingDataService.saveProjectData(data);
  }, []);

  const saveTeamData = useCallback((data: OnboardingFormData['team']) => {
    onboardingDataService.saveTeamData(data);
  }, []);

  const getAllData = useCallback((): OnboardingFormData => {
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