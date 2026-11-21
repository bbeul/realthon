"use client";

import ProfileCard from "@/components/custom/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile, ProfileResponse } from "@/lib/api/apis";
import React, { useEffect, useState } from "react";

type Props = {
  params: Promise<{ uuid: string }>;
};

export default function ProfileIDPage({ params }: Props) {
  const { uuid } = React.use(params);

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // const data = await getProfile(uuid);
        const data = await getProfile(uuid); // TODO: 실제 API 연동
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
