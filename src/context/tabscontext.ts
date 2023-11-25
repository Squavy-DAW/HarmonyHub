import Tab from "@models/tab";
import React from "react";

interface TabsContextProps {
    tabs: Tab[];
    setTabs: (tabs: Tab[]) => void;
    tabIndex: number;
    setTabIndex: (index: number) => void;
}

const TabsContext = React.createContext<TabsContextProps>(undefined!);
export default TabsContext;