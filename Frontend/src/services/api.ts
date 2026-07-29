import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/email-agent';

export interface EmailProcessRequest {
  thread_id: string;
  email_id: string;
  sender: string;
  subject: string;
  email_body: string;
}

export interface HITLActionRequest {
  thread_id: string;
  action: 'approve' | 'revise' | 'reject';
  feedback?: string;
}

export interface AgentStateResponse {
  topic: string;
  is_outbound: boolean;
  thread_id: string;
  sender: string;
  subject: string;
  email_body: string;
  draft_response?: string;
  revised_draft?: string;
  retrieved_docs: string[];
  status: string;
  iteration_count: number;
  is_sent: boolean;
}

export const processInboundEmail = async (data: EmailProcessRequest): Promise<AgentStateResponse> => {
  const response = await axios.post(`${API_BASE_URL}/process-email`, data);
  return response.data;
};

export const submitHITLAction = async (data: HITLActionRequest): Promise<AgentStateResponse> => {
  const response = await axios.post(`${API_BASE_URL}/hitl-action`, data);
  return response.data;
};

export const fetchUnreadInbox = async () => {
  const response = await axios.get(`${API_BASE_URL}/fetch-inbox`);
  return response.data;
};

export const createOutboundDraft = async (data: { recipient_email: string; subject: string; topic: string }) => {
  const response = await axios.post(`${API_BASE_URL}/generate-outbound-draft`, data);
  return response.data;
};

export const fetchEmailHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/email-history`);
  return response.data;
};