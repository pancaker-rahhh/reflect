// Export base classes and types
export { BaseApiService, ApiException } from './base';
export type { ApiError } from './base';

// Export service instances
export { userApi } from './user';
export { workspaceApi } from './workspace';
export type { 
  UserProfileUpdateRequest, 
  UserDeleteResponse 
} from './user';
export type { 
  WorkspaceCreateRequest, 
  WorkspaceUpdateRequest 
} from './workspace';

// Import for internal use
import { userApi } from './user';
import { workspaceApi } from './workspace';

// Main API object for backward compatibility and convenience
export const api = {
  users: userApi,
  workspaces: workspaceApi,
  
  // Convenience methods for common operations
  getCurrentUser: () => userApi.getCurrentUser(),
  syncUser: () => userApi.syncUser(),
  updateUserProfile: (data: any) => userApi.updateProfile(data),
  getWorkspaces: () => workspaceApi.getWorkspaces(),
  getWorkspace: (id: string) => workspaceApi.getWorkspace(id),
};