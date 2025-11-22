"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from "next/navigation";
import { createProfile } from "@/lib/api/apis";

type ProfileQuestion = {
  key: string;
  question: string;
  placeholder: string;
  multiline?: boolean;
};

const profileQuestions: ProfileQuestion[] = [
  // ...existing questions...
  {
    key: "intro",
    question: "📝 자기소개를 해주세요!",
    placeholder: "자신을 한 문장으로 표현해도 좋아요.",
    multiline: true,
  },
  {
    key: "strength",
    question: "💪 나의 강점은 무엇인가요?",
    placeholder: "예: 문제 해결력, 책임감 등",
    multiline: true,
  },
  {
    key: "fail",
    question: "🌱 실패하거나 극복한 경험이 있다면?",
    placeholder: "진솔하게 적어주세요.",
    multiline: true,
  },
  {
    key: "hobby",
    question: "🎨 취미나 쉬는 시간에 하는 일은?",
    placeholder: "예: 운동, 독서, 산책 등",
    multiline: false,
  },
  {
    key: "career",
    question: "🚀 진로를 어떻게 결정했나요?",
    placeholder: "계기가 있다면 적어주세요.",
    multiline: true,
  },
  {
    key: "project",
    question: "📁 가장 애착이 가는 프로젝트는?",
    placeholder: "간단히 소개해 주세요.",
    multiline: true,
  },
  {
    key: "job",
    question: "💼 취업 과정에서 가장 힘들었던 점은?",
    placeholder: "솔직하게 적어주세요.",
    multiline: true,
  },
  {
    key: "advice",
    question: "🌟 후배에게 해주고 싶은 조언이 있다면?",
    placeholder: "짧게 한 마디!",
    multiline: false,
  },
];

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id") || ""; // 쿼리에서 user id 추출

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const current = profileQuestions[step];

  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleNext = async () => {
    if (!input.trim()) return;
    const newAnswers = { ...answers, [current.key]: input };
    setAnswers(newAnswers);
    setInput("");
    if (step === profileQuestions.length - 1) {
      // 마지막 질문이면 프로필 생성 API 호출
      setIsSubmitting(true);
      try {
        await createProfile({
          user_id: userId,
          univ: "",
          major: "",
          gpa: "",
          ref_score: 0,
          profile_tags: [],
          profile_data: newAnswers,
        });
        setSubmitResult("success");
      } catch (e) {
        setSubmitResult("fail");
      } finally {
        setIsSubmitting(false);
      }
    }
    setStep(step + 1);
  };

  useEffect(() => {
    inputRef.current?.focus();
    textAreaRef.current?.focus();
  }, [step, isSubmitting]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <Card className="w-[400px] shadow-xl animate-fade-in">
        <CardContent className="py-8 flex flex-col gap-6">
          {step < profileQuestions.length ? (
            <>
              <div className="text-lg font-semibold text-center">
                {current.question}
              </div>
              {current.multiline ? (
                <Textarea
                  ref={textAreaRef}
                  placeholder={current.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="text-base min-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.metaKey && e.key === "Enter") handleNext();
                  }}
                  disabled={isSubmitting}
                />
              ) : (
                <Input
                  ref={inputRef}
                  placeholder={current.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNext();
                  }}
                  disabled={isSubmitting}
                />
              )}
              <Button
                onClick={handleNext}
                className="w-full mt-2"
                disabled={!input.trim() || isSubmitting}
              >
                {step === profileQuestions.length - 1 ? "완료" : "다음"}
              </Button>
              <div className="text-xs text-gray-400 text-center">
                {current.multiline
                  ? "⌘+Enter로 빠르게 넘길 수 있어요!"
                  : "Enter로 빠르게 넘길 수 있어요!"}
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              {submitResult === "success" ? (
                <>
                  <div className="text-2xl font-bold">🎉 프로필 작성 완료!</div>
                  <div className="text-base">
                    멋진 이야기를 들려주셔서 감사합니다.
                    <br />
                    <span className="text-sm text-gray-500">
                      프로필은 언제든 수정할 수 있어요.
                    </span>
                  </div>
                </>
              ) : submitResult === "fail" ? (
                <div className="text-red-500 font-bold">
                  프로필 저장에 실패했습니다. 다시 시도해 주세요.
                </div>
              ) : (
                <div className="text-base">프로필 저장 중...</div>
              )}
              <pre className="bg-gray-100 rounded p-2 text-xs text-left overflow-x-auto">
                {JSON.stringify(answers, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.7s;
        }
      `}</style>
    </div>
  );
}
