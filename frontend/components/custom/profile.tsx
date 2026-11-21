"use client";

import { Coffee } from "lucide-react";
import React from "react";

type Profile = {
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
};

function sexToStr(sex?: number) {
  if (sex === 1) return "남성";
  if (sex === 2) return "여성";
  if (sex === 0) return "기타";
  return "-";
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex justify-between">
        <div className="flex items-center ju gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center text-3xl font-bold text-brown-700">
            {profile.user.name[0]}
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-bold">{profile.user.name}</div>
            <div className="text-sm text-gray-500">
              @{profile.user.nickname}
            </div>
            <div className="text-xs text-gray-400">{profile.user.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile.ref_score !== undefined && (
            <div className="flex items-center gap-1">
              <img src="/logo.png" alt="Relevance Score" className="w-5 h-5" />
              <span className="text-[15px] font-semibold text-[#c7a17a]">
                {Math.round(profile.ref_score ?? 0)}°
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
        {profile.univ && (
          <div>
            <span className="font-semibold text-brown-700">학교</span>:{" "}
            {profile.univ}
          </div>
        )}
        {profile.major && (
          <div>
            <span className="font-semibold text-brown-700">전공</span>:{" "}
            {profile.major}
          </div>
        )}
        {profile.grade && (
          <div>
            <span className="font-semibold text-brown-700">학년</span>:{" "}
            {profile.grade}
          </div>
        )}
        {profile.gpa && (
          <div>
            <span className="font-semibold text-brown-700">학점</span>:{" "}
            {profile.gpa}
          </div>
        )}
        {profile.company && (
          <div>
            <span className="font-semibold text-brown-700">회사</span>:{" "}
            {profile.company}
          </div>
        )}
        {profile.job && (
          <div>
            <span className="font-semibold text-brown-700">직무</span>:{" "}
            {profile.job}
          </div>
        )}
        {profile.career_year !== undefined && (
          <div>
            <span className="font-semibold text-brown-700">경력</span>:{" "}
            {profile.career_year}년
          </div>
        )}
        {profile.user.age && (
          <div>
            <span className="font-semibold text-brown-700">나이</span>:{" "}
            {profile.user.age}
          </div>
        )}
        {profile.user.sex !== undefined && (
          <div>
            <span className="font-semibold text-brown-700">성별</span>:{" "}
            {sexToStr(profile.user.sex)}
          </div>
        )}
      </div>
      {profile.profile_tags && profile.profile_tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {profile.profile_tags.map((tag) => (
            <span
              key={tag}
              className="bg-yellow-100 text-brown-700 px-3 py-1 rounded-full text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {profile.profile_data && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="font-semibold text-brown-700 mb-2">프로필 상세</div>
          <ul className="space-y-1">
            {Object.entries(profile.profile_data).map(([key, value]) => (
              <li key={key}>
                <span className="font-semibold">{key}</span>:{" "}
                {typeof value === "string" && value.startsWith("http") ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="break-all">{String(value)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {profile.created_at && (
        <div className="text-xs text-gray-400 mt-4 text-right">
          가입일: {profile.created_at}
        </div>
      )}
    </div>
  );
}
