import apiClient from "./apiClient";

// 회원가입 인터페이스
export interface SignupRequest {
  username: string;
  nickname: string;
  email: string;
  password: string;
}

export const signup = async (data: SignupRequest) => {
  const res = await apiClient.post("/signup", data);
  return res.data;
};

export interface ProfileCreateRequest {
  id?: string; // UUID, 선택적
  user_id: string; // UUID
  univ: string;
  major: string;
  grade?: string;
  gpa: string;
  company?: string;
  job?: string;
  ref_score: number;
  career_year?: number;
  profile_data?: Record<string, any>;
  profile_tags: string[];
}

export const createProfile = async (data: ProfileCreateRequest) => {
  const res = await apiClient.post("/profile", data);
  return res.data;
};

export interface ChatSource {
  profile_id: string;
  user_id: string;
  relevance_score: number;
  temperature: number;
}

// 채팅 응답 타입
export interface ChatResponse {
  id: string;
  query_id: string;
  text: string;
  sources: ChatSource[];
  created_at: string;
}

// 채팅 요청 타입
export interface ChatRequest {
  query: string;
}

// 채팅 POST API
export const postChat = async (data: ChatRequest): Promise<ChatResponse> => {
  const res = await apiClient.post("/chat", data);
  return res.data;
};

export interface ProfileResponse {
  id: string;
  user: {
    name: string;
    nickname: string;
    email: string;
    age?: number;
    sex?: number;
  };
  univ?: string;
  major?: string;
  grade?: string;
  gpa?: string;
  company?: string;
  job?: string;
  ref_score?: number;
  career_year?: number;
  profile_data?: Record<string, any>;
  profile_tags?: string[];
  created_at?: string;
}

// user-id로 프로필 조회 API
export const getProfile = async (userId: string): Promise<ProfileResponse> => {
  const res = await apiClient.get(`/profile/${userId}`);
  return res.data;
};
