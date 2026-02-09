"use client"

import { useState } from "react"
import { StatusBar } from "./launcher/status-bar"
import { HomeTab } from "./launcher/tabs/home-tab"
import { SearchTab } from "./launcher/tabs/search-tab"
import { AppsTab } from "./launcher/tabs/apps-tab"
import { SettingsTab } from "./launcher/tabs/settings-tab"
import { LogsTab } from "./launcher/tabs/logs-tab"
import { BottomNav } from "./launcher/bottom-nav"

export function Launcher() {
  const [activeTab, setActiveTab] = useState("home")

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />
      case "search":
        return <SearchTab />
      case "apps":
        return <AppsTab />
      case "logs":
        return <LogsTab />
      case "settings":
        return <SettingsTab />
      default:
        return <HomeTab />
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-black via-black to-[#050505] flex flex-col p-4 pt-1">
      <StatusBar />

      {/* Tab content with premium scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-hide mt-1">{renderTab()}</div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
