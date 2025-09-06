import { apiClient } from '../client'

export interface UpgradeResponse {
  message: string
  plan: string
  status: string
}

export const upgradeApi = {
  upgradeToPro: async (): Promise<UpgradeResponse> => {
    return apiClient.post<UpgradeResponse>('/upgrade/to-pro')
  },
}
