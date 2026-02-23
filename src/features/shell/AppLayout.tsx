import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Bell } from "lucide-react";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 font-body">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-xs text-zinc-500 font-mono">
              All systems operational
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
