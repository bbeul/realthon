import apiClient from "./apiClient";

// 회원가입 인터페이스
export interface SignupRequest {
  name: string;
  nickname: string; // 2~15자
  email: string;
  password: string; // 8자 이상
  age?: number;
  sex?: number;
}

export const signup = async (data: SignupRequest) => {
  const res = await apiClient.post("/users/signup", data);
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
  const res = await apiClient.post("/api/profile", data);
  return res.data;
};

export interface UserData {
  id: string;
  name: string;
  nickname: string;
  email: string;
  age?: number;
  sex?: number;
}

export interface ChatSource {
  profile_id: string;
  user_data: UserData;
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
  user_id: string;
  text: string;
}

// 채팅 POST API
export const postChat = async (data: ChatRequest): Promise<ChatResponse> => {
  const res = await apiClient.post("/chat/questions", data);
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
  const res = await apiClient.get(`/api/profile/${userId}`);
  return res.data;
};

// 질문(메일) 생성 요청 타입
export interface QuestionCreateRequest {
  created_by: string; // user uuid
  title: string;
  content: string;
}

// 질문(메일) 응답 타입
export interface QuestionResponse {
  id: string;
  created_by: string;
  title: string;
  content: string;
  created_at: string;
  answer?: AnswerResponse | null;
}

// 답변 생성 요청 타입
export interface AnswerCreateRequest {
  question_id: string;
  created_by?: string; // optional
  content: string;
}

// 답변 응답 타입
export interface AnswerResponse {
  id: string;
  question_id: string;
  created_by?: string | null;
  content: string;
  is_ai_generated?: boolean;
  created_at: string;
}

// 질문 생성 API
export const createQuestion = async (
  data: QuestionCreateRequest
): Promise<QuestionResponse> => {
  const res = await apiClient.post("/api/questions/", data);
  return res.data;
};

// 질문 단건 조회 API
export const getQuestion = async (
  questionId: string
): Promise<QuestionResponse> => {
  const res = await apiClient.get(`/api/questions/${questionId}`);
  return res.data;
};

// 답변 생성 API
export const createAnswer = async (
  data: AnswerCreateRequest
): Promise<AnswerResponse> => {
  const res = await apiClient.post("/api/answers/", data);
  return res.data;
};

// 답변 단건 조회 API
export const getAnswer = async (answerId: string): Promise<AnswerResponse> => {
  const res = await apiClient.get(`/api/answers/${answerId}`);
  return res.data;
};

export interface RecommendationRequest {
  query: string;
}

// 멘토 추천(시니어 추천) 응답 타입
export interface SeniorSummary {
  id: string;
  name: string;
  nickname: string;
  email: string;
  age?: number;
  sex?: number;
}

export interface RecommendationResponse {
  seniors: SeniorSummary[];
}

// 멘토 추천(시니어 추천) API
export const recommendSeniors = async (
  data: RecommendationRequest
): Promise<RecommendationResponse> => {
  const res = await apiClient.post("/api/recommendations", data);
  return res.data;
};
