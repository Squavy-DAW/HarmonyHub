import Tab from "@models/tab";
import { create } from "zustand";

export interface TabContext {
    tabs: Tab[];
    setTabs: (tabs: Tab[]) => void;
    tabIndex: number;
    setTabIndex: (index: number) => void;
}

export const useTabs = create<TabContext>((set) => ({
    tabs: [],
    setTabs: (tabs) => {
        set(() => ({
            tabs: [...tabs]
        }))
    },
    tabIndex: 0,
    setTabIndex: (index) => set({ tabIndex: index }),
}));

export default useTabs;