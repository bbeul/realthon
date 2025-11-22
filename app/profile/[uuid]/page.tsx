"use client";

import ProfileCard from "@/components/custom/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile, ProfileResponse } from "@/lib/api/apis";
import React, { useEffect, useState } from "react";

type Props = {
  params: Promise<{ uuid: string }>;
};

export default function Page({ params }: Props) {
  const { uuid } = React.use(params);

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // const data = await getProfile(uuid);
        const data = {
          id: uuid,
          user: {
            name: "홍길동",
            nickname: "coffee_mentor",
            email: "mentor@example.com",
            age: 28,
            sex: 1,
          },
          univ: "서울대학교",
          major: "컴퓨터공학",
          grade: "4",
          gpa: "4.1/4.5",
          company: "카카오",
          job: "데이터 엔지니어",
          ref_score: 0.92,
          career_year: 3,
          profile_data: {
            취업과정: "카카오 인턴 후 정규직 전환",
            포트폴리오: "https://github.com/mentor/portfolio",
            자기소개: "데이터 분석과 AI에 관심이 많아요.",
            진로계획: "AI 엔지니어로 성장",
            취미: "커피 내리기, 러닝",
          },
          profile_tags: ["AI", "데이터", "멘토링", "커피"],
          created_at: "2024-01-01",
        };
        setProfile(data);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [uuid]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br  from-[#f9f6f2] to-[#f7efe2]"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      {loading ? (
        <div className="w-full max-w-xl">
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-8 w-1/3" />
        </div>
      ) : profile ? (
        <ProfileCard profile={profile} />
      ) : (
        <div className="text-gray-500">프로필을 찾을 수 없습니다.</div>
      )}
    </div>
  );
}
