"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type LogoutButtonProps = {
  className?: string;
  redirectTo?: string;
};

export function LogoutButton({ className, redirectTo = "/signin" }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    setHasError(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) {
        setHasError(true);
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setHasError(true);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <button
        className={
          className ??
          "inline-flex h-10 items-center justify-center rounded-full border border-[#d9bda8] bg-white px-4 text-sm font-extrabold text-[#6f4b34] transition hover:bg-[#fff5ed] disabled:cursor-not-allowed disabled:opacity-60"
        }
        disabled={isLoggingOut}
        onClick={() => void handleLogout()}
        type="button"
      >
        {isLoggingOut ? "Đang đăng xuất..." : hasError ? "Thử đăng xuất lại" : "Đăng xuất"}
      </button>
      {hasError ? <span className="sr-only" role="alert">Không thể đăng xuất. Vui lòng thử lại.</span> : null}
    </>
  );
}
