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
    const  supabase  = createClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const email = String(formData.get('email') || '').trim();
            const password = String(formData.get('password') || '').trim();

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

    const submitButtonClassName = isAdmin
        ? 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white hover:from-slate-950 hover:via-blue-950 hover:to-slate-900'
        : '';

    return (
        <div>
            <form
                noValidate={true}
                className="mb-4"
                onSubmit={(e) => handleSubmit(e)}
            >
                <input
                    type="hidden"
                    name="isAdmin"
                    value={isAdmin ? 'true' : 'false'}
                />
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <label
                            className={`text-sm font-medium ${isAdmin ? 'text-foreground' : 'text-[#3A4163]'}`}
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            className="mr-2.5 mb-2 h-full min-h-[44px] w-full px-4 py-3"
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            name="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                        />
                        <label
                            className={`mt-2 text-sm font-medium ${isAdmin ? 'text-foreground' : 'text-[#3A4163]'}`}
                            htmlFor="password"
                        >
                            Mật khẩu
                        </label>
                        {/* Password input with visibility toggle */}
                        <div className="relative">
                            <input
                                id="password"
                                placeholder="Mật khẩu"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                autoComplete="current-password"
                                className="mr-2.5 mb-2 h-full min-h-[44px] w-full px-4 py-3 pr-10"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`mt-2 flex h-[unset] w-full items-center justify-center rounded-lg px-4 py-4 text-sm font-medium ${submitButtonClassName}`}
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
                </div>
                {/* Forgot password and register links */}
                <div className="mt-2">
                    <p>
                        <a
                            href={
                                isAdmin
                                    ? '/dashboard/signin/forgot_password'
                                    : '/signin/forgot_password'
                            }
                            className={`text-sm font-medium ${isAdmin ? 'text-foreground hover:text-primary' : 'text-[#3A4163] hover:text-[#5AA8D6]'}`}
                        >
                            Quên mật khẩu?
                        </a>
                    </p>
                    {!isAdmin && (
                        <p>
                            <a
                                href="/register-org"
                                className="text-sm font-medium text-[#3A4163] hover:text-[#5AA8D6]"
                            >
                                Chưa có tài khoản? Đăng ký
                            </a>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}