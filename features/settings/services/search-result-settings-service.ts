import type { SearchResultSettings } from "../types";

const settingsEndpoint = "/api/settings/student-search";

export async function fetchSearchResultSettings(): Promise<SearchResultSettings> {
  const response = await fetch(settingsEndpoint, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Không thể tải cấu hình hiển thị (${response.status}).`);
  }

  return response.json() as Promise<SearchResultSettings>;
}

export async function updateSearchResultSettings(
  settings: SearchResultSettings,
): Promise<SearchResultSettings> {
  const response = await fetch(settingsEndpoint, {
    body: JSON.stringify(settings),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(`Không thể lưu cấu hình hiển thị (${response.status}).`);
  }

  return response.json() as Promise<SearchResultSettings>;
}
