'use client';

import { createClient } from "@/utils/supabase/client";
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordSignInProps {
    isAdmin?: boolean;
}

export default function PasswordSignIn({
                                           isAdmin = false
                                       }: PasswordSignInProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const email = String(formData.get('email') || '').trim();
            const password = String(formData.get('password') || '').trim();
            const supabase = createClient();

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                router.push(
                    getErrorRedirect(
                        '/signin',
                        'Sign in failed.',
                        error.message
                    )
                );
                return;
            }

            const userRole = data.user?.app_metadata?.role;

            //If system has more than 2 roles, need to change the logic redirect here
            router.push(
                getStatusRedirect(
                    userRole === 'ADMIN' ? '/admin' : '/teacher',
                    'Success!',
                    'You are now signed in.'
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top_left,#fff8ef_0,#fbefe5_36%,#f6e7dc_100%)] px-4 py-8 text-[#2d211b]">
            <section className="w-full max-w-md rounded-3xl border border-[#ead8ca] bg-white/90 p-6 shadow-[0_24px_70px_rgba(123,82,52,0.16)] backdrop-blur md:p-7">
                <div className="mb-6 text-center">
                    <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#a36c45]">
                        An Nhiên Kids
                    </p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                        Đăng nhập hệ thống
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-[#725e51]">
                        {isAdmin ? "Truy cập khu quản lý trung tâm." : "Giáo viên đăng nhập để xem lịch dạy và điểm danh."}
                    </p>
                </div>

            <form
                noValidate={true}
                className="grid gap-4"
                onSubmit={(e) => handleSubmit(e)}
            >
                <input
                    type="hidden"
                    name="isAdmin"
                    value={isAdmin ? 'true' : 'false'}
                />
                    <div className="grid gap-4">
                        <label
                            className="grid gap-2 text-sm font-extrabold text-[#6f4b34]"
                            htmlFor="email"
                        >
                            Email
                        <input
                            className="h-12 rounded-2xl border border-[#e3d6ca] bg-[#fffaf5] px-4 text-base font-semibold outline-none transition placeholder:text-[#b0927c] focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            name="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                        />
                        </label>
                        <label
                            className="grid gap-2 text-sm font-extrabold text-[#6f4b34]"
                            htmlFor="password"
                        >
                            Mật khẩu
                        <div className="relative">
                            <input
                                id="password"
                                placeholder="Mật khẩu"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                autoComplete="current-password"
                                className="h-12 w-full rounded-2xl border border-[#e3d6ca] bg-[#fffaf5] px-4 pr-12 text-base font-semibold outline-none transition placeholder:text-[#b0927c] focus:border-[#a36c45] focus:ring-2 focus:ring-[#f2dfcf]"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full text-[#8b5632] transition hover:bg-[#f2dfcf]"
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[#a36c45] px-5 text-base font-extrabold text-white shadow-[0_16px_34px_rgba(163,108,69,0.24)] transition hover:-translate-y-0.5 hover:bg-[#8b5632] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <svg
                                className="animate-spin mr-2"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray="60"
                                    strokeDashoffset="20"
                                />
                            </svg>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                <div className="flex flex-col items-center gap-2 pt-1 text-sm font-bold">
                        <a
                            href={
                                isAdmin
                                    ? '/dashboard/signin/forgot_password'
                                    : '/signin/forgot_password'
                            }
                            className="text-[#8b5632] transition hover:text-[#a36c45] hover:underline"
                        >
                            Quên mật khẩu?
                        </a>
                    {!isAdmin && (
                        <a
                            href="/register-org"
                            className="text-[#725e51] transition hover:text-[#a36c45] hover:underline"
                        >
                            Chưa có tài khoản? Đăng ký
                        </a>
                    )}
                </div>
            </form>
            </section>
        </main>
    );
}
