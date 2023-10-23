import { useState } from "react";
import { TabProps } from "react-tabs";

export default interface Tab {
    name: string,
    content: React.ReactNode
}

export const [tabs, setTabs] = useState<TabProps[]>([])
export const [selectedTab, setSelectedTab] = useState(0);