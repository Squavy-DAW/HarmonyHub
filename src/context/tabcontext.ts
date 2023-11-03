import Tab from "@models/tab";
import React from "react";

interface TabContextProps {
    tab: Tab;
}

const TabContext = React.createContext<TabContextProps>(undefined!);
export default TabContext;