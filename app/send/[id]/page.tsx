"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

type Props = {
  params: Promise<{ uuid: string }>;
};

export default function Page({ params }: Props) {
  const { uuid } = React.use(params);
  const [mail, setMail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMail() {
      setLoading(true);
      setError("");
      try {
        // TODO: 실제 API 연동
        // 임시 mock 데이터
        const data = {
          uuid,
          to: {
            name: "홍길동",
            nickname: "coffee_mentor",
            email: "mentor@example.com",
          },
          title: "AI 진로에 대해 궁금한 점이 있습니다.",
          content:
            "멘토님, AI 엔지니어가 되기 위해 어떤 준비를 하셨나요? 조언 부탁드립니다!",
          created_at: "2025-11-23 10:00",
          answer: {
            content:
              "안녕하세요! AI 엔지니어가 되기 위해선 수학, 프로그래밍, 프로젝트 경험이 중요합니다. 궁금한 점 있으면 언제든 질문 주세요!",
            created_at: "2025-11-23 15:00",
          },
        };
        setMail(data);
      } catch (e) {
        setError("질문 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchMail();
  }, [uuid]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f9f6f2] to-[#f7efe2]"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <div className="w-full max-w-xl">
        {loading ? (
          <div>
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        ) : error ? (
          <div className="text-center text-gray-500 py-12">{error}</div>
        ) : mail ? (
          <Card className="p-6 space-y-6">
            <div>
              <div className="text-lg font-semibold mb-1">
                To: {mail.to.name}{" "}
                <span className="text-sm text-gray-500">
                  (@{mail.to.nickname})
                </span>
              </div>
              <div className="text-xs text-gray-400">{mail.to.email}</div>
            </div>
            <div>
              <div className="text-base font-bold mb-2">{mail.title}</div>
              <div className="text-gray-700 whitespace-pre-line mb-2">
                {mail.content}
              </div>
              <div className="text-xs text-gray-400">
                보낸 시각: {mail.created_at}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="text-base font-semibold mb-2">멘토 답변</div>
              {mail.answer ? (
                <div>
                  <div className="text-gray-800 whitespace-pre-line mb-2">
                    {mail.answer.content}
                  </div>
                  <div className="text-xs text-gray-400">
                    답변 시각: {mail.answer.created_at}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">
                  아직 답변이 등록되지 않았습니다.
                </div>
              )}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
