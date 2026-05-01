import { create } from "zustand";

const useAnalysisStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
  clear: () => set({ data: null }),
}));

export default useAnalysisStore;
