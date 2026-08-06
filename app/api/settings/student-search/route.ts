import { NextResponse } from "next/server";
import {
  getSearchResultSettings,
  saveSearchResultSettings,
} from "@/features/settings/server/search-result-settings-repository";
import type { SearchResultSettings } from "@/features/settings/types";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await getSearchResultSettings());
  } catch {
    return NextResponse.json({ message: "Không thể đọc cấu hình." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  if (user.app_metadata?.role !== "ADMIN") {
    return NextResponse.json({ message: "Bạn không có quyền cập nhật cấu hình." }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Dữ liệu JSON không hợp lệ." }, { status: 400 });
  }

  if (!isSearchResultSettings(body)) {
    return NextResponse.json(
      { message: "showHeight và showWeight phải là boolean." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await saveSearchResultSettings(body));
  } catch {
    return NextResponse.json({ message: "Không thể lưu cấu hình." }, { status: 500 });
  }
}

function isSearchResultSettings(value: unknown): value is SearchResultSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const settings = value as Record<string, unknown>;
  return typeof settings.showHeight === "boolean" && typeof settings.showWeight === "boolean";
}
