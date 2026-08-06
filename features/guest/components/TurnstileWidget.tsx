"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileRenderOptions = {
  sitekey: string;
  action: string;
  theme: "light";
  size: "flexible";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string | null) => void;
  resetKey: number;
  siteKey: string;
};

export function TurnstileWidget({ onTokenChange, resetKey, siteKey }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    const container = containerRef.current;
    const turnstile = window.turnstile;
    if (!scriptReady || !container || !turnstile || !siteKey) {
      return;
    }

    container.replaceChildren();
    const widgetId = turnstile.render(container, {
      action: "student_search",
      callback: (token) => onTokenChangeRef.current(token),
      "error-callback": () => onTokenChangeRef.current(null),
      "expired-callback": () => onTokenChangeRef.current(null),
      sitekey: siteKey,
      size: "flexible",
      theme: "light",
    });

    return () => {
      turnstile.remove(widgetId);
    };
  }, [resetKey, scriptReady, siteKey]);

  if (!siteKey) {
    return (
      <p className="rounded-2xl border border-[#efb5a8] bg-[#fff7f5] p-3 text-sm font-bold text-[#9b3f2c]">
        CAPTCHA chưa được cấu hình. Vui lòng liên hệ quản trị viên.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <Script
        id="cloudflare-turnstile-script"
        onError={() => setScriptFailed(true)}
        onReady={() => setScriptReady(true)}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div className="min-h-[65px] min-w-[300px]" ref={containerRef} />
      {scriptFailed ? (
        <p className="text-sm font-bold text-[#9b3f2c]">
          Không thể tải CAPTCHA. Vui lòng kiểm tra kết nối và tải lại trang.
        </p>
      ) : null}
    </div>
  );
}
