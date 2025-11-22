"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api/apis";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    nickname: "",
    password: "",
  });
  const [step, setStep] = useState<"form" | "done">("form");
  const [userId, setUserId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signup({
        email: form.email,
        username: form.username,
        nickname: form.nickname,
        password: form.password,
      });
      setUserId(res.id);
      setStep("done");
      toast.success("회원가입이 완료되었습니다!");
    } catch (error) {
      toast.error("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSkip = () => {
    if (userId) {
      router.push(`/profile?id=${userId}`);
    } else {
      router.push("/profile");
    }
  };

  const handleGoToIntro = () => {
    if (userId) {
      router.push(`/profile?id=${userId}`);
    } else {
      router.push("/profile");
    }
  };

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
          {step === "form" ? (
            <>
              <div className="text-xl font-bold text-center text-[#a98467]">
                당신의 정보를 알려주세요
              </div>
              <form
                className="flex flex-col gap-5"
                onSubmit={handleSubmit}
                autoComplete="off"
              >
                <Input
                  type="email"
                  name="email"
                  placeholder="이메일을 입력하세요"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="text-base"
                  style={{
                    background: "#e0d6c3",
                    mixBlendMode: "hard-light",
                    borderRadius: 10,
                    border: "1.5px solid #4e342e",
                    color: "#322219",
                  }}
                />
                <Input
                  type="text"
                  name="username"
                  placeholder="아이디(영문)를 입력하세요"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="text-base"
                  style={{
                    background: "rgba(245, 239, 230, 0.7)",
                    borderRadius: 10,
                    border: "1.5px solid #e0d6c3",
                    color: "#4e342e",
                  }}
                />
                <Input
                  type="text"
                  name="nickname"
                  placeholder="닉네임을 입력하세요"
                  value={form.nickname}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className="text-base"
                  style={{
                    background: "rgba(245, 239, 230, 0.7)",
                    borderRadius: 10,
                    border: "1.5px solid #e0d6c3",
                    color: "#4e342e",
                  }}
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="text-base"
                  style={{
                    background: "rgba(245, 239, 230, 0.7)",
                    borderRadius: 10,
                    border: "1.5px solid #e0d6c3",
                    color: "#4e342e",
                  }}
                />
                <Button
                  type="submit"
                  className="w-full mt-2 bg-[#c7a17a] hover:bg-[#a98467] text-white font-semibold"
                  disabled={
                    !form.email.trim() ||
                    !form.username.trim() ||
                    !form.nickname.trim() ||
                    !form.password.trim()
                  }
                >
                  커피 한 잔 내리기
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="text-2xl font-bold text-[#a98467]">
                🎉 가입이 완료되었어요!
              </div>
              <div className="text-base text-[#4e342e]">
                {form.nickname}님, 커피챗에 오신 걸 환영해요.
                <br />
                이제 자기소개를 입력하러 가볼까요?
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <Button
                  onClick={handleGoToIntro}
                  className="w-full bg-[#c7a17a] hover:bg-[#a98467] text-white font-semibold"
                >
                  자기소개 입력
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="w-full border-[#c7a17a] text-[#a98467] font-semibold"
                >
                  건너뛰기
                </Button>
              </div>
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
