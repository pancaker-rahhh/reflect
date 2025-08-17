import { apiClient } from '@/lib/api-client';

export interface InvitationValidateResponse {
  invitation_id: string;
  email: string;
  organization_name?: string;
  project_name?: string;
  role: string;
  inviter_name: string;
  expires_at: string;
  is_expired: boolean;
  user_exists: boolean;
}

export interface NewUserData {
  name: string;
  password: string;
  phone?: string;
  avatar_url?: string;
}

export interface InvitationAcceptRequest {
  token: string;
  user_data?: NewUserData;
}

export interface InvitationAcceptResponse {
  success: boolean;
  message: string;
  user_id: string;
  organization_id?: string;
  project_id?: string;
  role: string;
  access_token?: string;
  redirect_url: string;
}

export interface BulkInvitationRequest {
  organization_id?: string;
  project_id?: string;
  invitations: Array<{
    email: string;
    role: 'admin' | 'member' | 'viewer';
    name?: string;
  }>;
  send_email?: boolean;
}

export interface BulkInvitationResponse {
  task_id: string;
  total_count: number;
  status: 'processing' | 'completed' | 'failed';
  message: string;
}

export interface InvitationStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_count: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  results: Array<{
    email: string;
    status: 'sent' | 'failed' | 'duplicate' | 'invalid';
    error?: string;
    invitation_id?: string;
  }>;
  created_at: string;
  completed_at?: string;
  error?: string;
}

class InvitationService {
  async validateInvitation(token: string): Promise<InvitationValidateResponse> {
    const response = await apiClient.get(`/invitations/validate/${token}`);
    return response.data;
  }

  async acceptInvitation(
    token: string,
    userData?: NewUserData
  ): Promise<InvitationAcceptResponse> {
    const response = await apiClient.post('/invitations/accept', {
      token,
      user_data: userData
    });
    return response.data;
  }

  async sendBulkInvitations(
    request: BulkInvitationRequest
  ): Promise<BulkInvitationResponse> {
    const response = await apiClient.post('/invitations/bulk', request);
    return response.data;
  }

  async getBulkInvitationStatus(taskId: string): Promise<InvitationStatusResponse> {
    const response = await apiClient.get(`/invitations/bulk/${taskId}/status`);
    return response.data;
  }

  async resendInvitation(invitationId: string): Promise<void> {
    await apiClient.post(`/invitations/resend/${invitationId}`);
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    await apiClient.delete(`/invitations/${invitationId}`);
  }
}

export const invitationService = new InvitationService();