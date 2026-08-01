import { create } from "zustand";
import { persist } from "zustand/middleware";

type SearchResultSettingsState = {
  showHeight: boolean;
  showWeight: boolean;
  setShowHeight: (showHeight: boolean) => void;
  setShowWeight: (showWeight: boolean) => void;
};

export const useSearchResultSettings = create<SearchResultSettingsState>()(
  persist(
    (set) => ({
      showHeight: false,
      showWeight: false,
      setShowHeight: (showHeight) => set({ showHeight }),
      setShowWeight: (showWeight) => set({ showWeight }),
    }),
    {
      name: "an-nhien-kids-search-result-settings",
      skipHydration: true,
    },
  ),
);
