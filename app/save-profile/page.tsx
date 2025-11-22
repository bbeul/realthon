import ProfilePage from "@/components/custom/profile-page";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ProfilePage />
    </Suspense>
  );
}
