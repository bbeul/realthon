"use client";

import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from "next/navigation";
import { createProfile } from "@/lib/api/apis";
import { useEffect } from "react";
import { toast } from "sonner";

type ProfileEssayQuestion = {
  key: string;
  question: string;
  placeholder: string;
  multiline?: boolean;
};

const essayQuestions: ProfileEssayQuestion[] = [
  {
    key: "intro",
    question: "자기소개를 해주세요!",
    placeholder: "자신을 한 문장으로 표현해도 좋아요.",
    multiline: true,
  },
  {
    key: "strength",
    question: "나의 강점은 무엇인가요?",
    placeholder: "예: 문제 해결력, 책임감 등",
    multiline: true,
  },
  {
    key: "fail",
    question: "실패하거나 극복한 경험이 있다면?",
    placeholder: "진솔하게 적어주세요.",
    multiline: true,
  },
  {
    key: "hobby",
    question: "취미나 쉬는 시간에 하는 일은?",
    placeholder: "예: 운동, 독서, 산책 등",
    multiline: false,
  },
  {
    key: "career",
    question: "진로를 어떻게 결정했나요?",
    placeholder: "계기가 있다면 적어주세요.",
    multiline: true,
  },
  {
    key: "project",
    question: "가장 애착이 가는 프로젝트는?",
    placeholder: "간단히 소개해 주세요.",
    multiline: true,
  },
  {
    key: "job_exp",
    question: "취업 과정에서 가장 힘들었던 점은?",
    placeholder: "솔직하게 적어주세요.",
    multiline: true,
  },
  {
    key: "advice",
    question: "후배에게 해주고 싶은 조언이 있다면?",
    placeholder: "짧게 한 마디!",
    multiline: false,
  },
];

type Status = "학생" | "직장인" | "기타";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id") || "";

  // 상태 선택
  const [status, setStatus] = useState<Status | "">("");
  // 기본 정보 입력
  const [form, setForm] = useState({
    univ: "",
    major: "",
    grade: "",
    gpa: "",
    company: "",
    job: "",
  });

  // 에세이(자기소개서) 답변은 카드 방식
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const current = essayQuestions[step];
  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  // 기본 정보 입력 완료 후 에세이 카드로 이동
  const [infoDone, setInfoDone] = useState(false);

  // 기본 정보 입력 핸들러
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 에세이 답변 입력 핸들러
  const handleEssayNext = () => {
    if (!input.trim()) return;
    const newAnswers = { ...answers, [current.question]: input };
    setAnswers(newAnswers);
    setInput("");
    setStep(step + 1);
  };

  const handleEssayPrev = () => {
    if (step === 0) {
      // 첫 번째 에세이 카드에서 이전 누르면 infoDone 해제(기본 정보 입력 폼으로)
      setInfoDone(false);
      setInput(""); // 입력값 초기화
      return;
    }
    // 이전 답변 불러오기
    const prevQuestion = essayQuestions[step - 1].question;
    setInput(answers[prevQuestion] || "");
    setStep(step - 1);
  };

  // 기본 정보 입력 폼에서 이전 누르면 상태 선택으로
  const handleInfoPrev = () => {
    setStatus("");
    setInfoDone(false);
    setForm({
      univ: "",
      major: "",
      grade: "",
      gpa: "",
      company: "",
      job: "",
    });
  };

  // 제출
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createProfile({
        user_id: userId,
        univ: form.univ,
        major: form.major,
        grade: status === "학생" ? form.grade : "",
        gpa: form.gpa,
        company: status === "직장인" ? form.company : "",
        job: status === "직장인" ? form.job : "",
        ref_score: 0,
        profile_tags: [],
        profile_data: answers,
      });
      setSubmitResult("success");
      toast.success("프로필이 성공적으로 저장되었습니다!");
    } catch (e) {
      setSubmitResult("fail");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!infoDone) return;
    if (current?.multiline) {
      textAreaRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [step, infoDone, current?.multiline]);

  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-[#f9f6f2] to-[#f7efe2]"
      style={{
        minHeight: "calc(100vh - 64px)",
        backgroundImage:
          "url('/beige-paper.png'), linear-gradient(to bottom right, #f9f6f2, #f7efe2)",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}
    >
      <Card
        className="w-[370px] shadow-none animate-fade-in "
        style={{ background: "transparent" }}
      >
        <CardContent className="py-10 flex flex-col gap-7">
          {!submitResult ? (
            !status ? (
              <>
                <div className="text-xl font-bold text-center text-brown-700 mb-2">
                  현재 상태를 선택해 주세요
                </div>
                <div className="flex justify-center gap-4 mb-6">
                  {["학생", "직장인", "기타"].map((s) => (
                    <Button
                      key={s}
                      type="button"
                      className={`px-6 py-2 rounded-lg font-semibold ${
                        status === s
                          ? "bg-[#c7a17a] text-white"
                          : "bg-[#f9f6f2] text-brown-700 border border-gray-300"
                      }`}
                      onClick={() => setStatus(s as Status)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </>
            ) : !infoDone ? (
              <>
                <div className="text-xl font-bold text-center text-[#322219] whitespace-nowrap">
                  기본 정보를 입력해 주세요
                </div>
                <form
                  className="flex flex-col gap-5 animate-fade-in"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setInfoDone(true);
                  }}
                >
                  <Input
                    name="univ"
                    placeholder={
                      status === "학생"
                        ? "학교명을 입력해 주세요. (예: 서울대학교)"
                        : "졸업 학교명을 입력해 주세요."
                    }
                    value={form.univ}
                    onChange={handleFormChange}
                    className="bg-[#f9f6f2] border border-gray-200 rounded-lg text-base"
                    required
                  />
                  <Input
                    name="major"
                    placeholder="전공을 입력해 주세요. (예: 컴퓨터공학)"
                    value={form.major}
                    onChange={handleFormChange}
                    className="bg-[#f9f6f2] border border-gray-200 rounded-lg text-base"
                    required
                  />
                  {status === "학생" && (
                    <Input
                      name="grade"
                      placeholder="학년을 입력해 주세요. (예: 4)"
                      value={form.grade}
                      onChange={handleFormChange}
                      className="bg-[#f9f6f2] border border-gray-200 rounded-lg text-base "
                      required
                    />
                  )}
                  <Input
                    name="gpa"
                    placeholder="학점(GPA)을 입력해 주세요. (예: 4.1/4.5)"
                    value={form.gpa}
                    onChange={handleFormChange}
                    className="bg-[#f9f6f2] border border-gray-200 rounded-lg text-base"
                    required
                  />
                  {(status === "직장인" || status === "기타") && (
                    <>
                      <Input
                        name="company"
                        placeholder="재직(또는 경험)한 회사명을 입력해 주세요. (예: 카카오, 없으면 공란)"
                        value={form.company}
                        onChange={handleFormChange}
                        className="bg-[#f9f6f2] border border-gray-200 rounded-lg text-base"
                      />
                      <Input
                        name="job"
                        placeholder="직무를 입력해 주세요. (예: 데이터 엔지니어, 없으면 공란)"
                        value={form.job}
                        onChange={handleFormChange}
                        className="bg-[#f9f6f2] border border-gray-200 rounded-lg text-base"
                      />
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleInfoPrev}
                      className="flex-1 bg-gray-200 text-brown-700 rounded-lg font-semibold text-base h-11 shadow-sm transition"
                    >
                      이전
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#c7a17a] text-white rounded-lg font-semibold text-base h-11 shadow-sm transition disabled:opacity-60"
                    >
                      다음
                    </Button>
                  </div>
                </form>
              </>
            ) : step < essayQuestions.length ? (
              <>
                <div className="text-xl font-bold text-center text-brown-700">
                  {current.question}
                </div>
                {current.multiline ? (
                  <Textarea
                    ref={textAreaRef}
                    placeholder={current.placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="text-base min-h-[100px] bg-[#f9f6f2] border border-gray-200 rounded-lg"
                    onKeyDown={(e) => {
                      if (e.metaKey && e.key === "Enter") handleEssayNext();
                    }}
                    disabled={isSubmitting}
                  />
                ) : (
                  <Input
                    ref={inputRef}
                    placeholder={current.placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="text-base bg-[#f9f6f2] border border-gray-200 rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEssayNext();
                    }}
                    disabled={isSubmitting}
                  />
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={handleEssayPrev}
                    className="flex-1 bg-gray-200 text-brown-700 rounded-lg font-semibold text-base h-11 shadow-sm transition disabled:opacity-60"
                    disabled={isSubmitting}
                    type="button"
                  >
                    이전
                  </Button>
                  <Button
                    onClick={handleEssayNext}
                    className="flex-1 bg-[#c7a17a] text-white rounded-lg font-semibold text-base h-11 shadow-sm transition disabled:opacity-60"
                    disabled={!input.trim() || isSubmitting}
                    type="button"
                  >
                    {step === essayQuestions.length - 1 ? "완료" : "다음"}
                  </Button>
                </div>
                <div className="text-xs text-gray-400 text-center">
                  {current.multiline
                    ? "⌘+Enter로 빠르게 넘길 수 있어요!"
                    : "Enter로 빠르게 넘길 수 있어요!"}
                </div>
                {/* 마지막 카드에서 완료 누르면 제출 */}
                {step === essayQuestions.length - 1 && input.trim() && (
                  <Button
                    onClick={handleSubmit}
                    className="w-full mt-4 bg-[#a67c52] text-white rounded-lg font-semibold text-base h-11 shadow-sm"
                    disabled={isSubmitting}
                  >
                    프로필 저장하기
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handleSubmit}
                className="w-full mt-4 bg-[#a67c52] text-white rounded-lg font-semibold text-base h-11 shadow-sm"
                disabled={isSubmitting}
              >
                프로필 저장하기
              </Button>
            )
          ) : (
            <div className="text-center space-y-4">
              {submitResult === "success" ? (
                <>
                  <div className="text-2xl font-bold text-brown-700">
                    🎉 프로필 작성 완료!
                  </div>
                  <div className="text-base text-brown-700">
                    멋진 이야기를 들려주셔서 감사합니다.
                    <br />
                    <span className="text-sm text-gray-500">
                      프로필은 언제든 수정할 수 있어요.
                    </span>
                  </div>
                </>
              ) : submitResult === "fail" ? null : (
                <div className="text-base text-brown-700">
                  프로필 저장 중...
                </div>
              )}
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
