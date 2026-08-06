import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SearchResultSettings } from "../types";

const defaultSettings: SearchResultSettings = {
  showHeight: false,
  showWeight: false,
};

const settingsFilePath = process.env.SEARCH_RESULT_SETTINGS_FILE
  ? path.resolve(process.env.SEARCH_RESULT_SETTINGS_FILE)
  : path.join(process.cwd(), "data", "search-result-settings.json");

export async function getSearchResultSettings(): Promise<SearchResultSettings> {
  try {
    const content = await readFile(settingsFilePath, "utf8");
    const settings = JSON.parse(content) as Partial<SearchResultSettings>;

    return {
      showHeight: settings.showHeight === true,
      showWeight: settings.showWeight === true,
    };
  } catch (error) {
    if (isFileNotFoundError(error)) {
      return defaultSettings;
    }

    throw error;
  }
}

export async function saveSearchResultSettings(
  settings: SearchResultSettings,
): Promise<SearchResultSettings> {
  await mkdir(path.dirname(settingsFilePath), { recursive: true });
  await writeFile(settingsFilePath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  return settings;
}

function isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
