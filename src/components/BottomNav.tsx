import React from "react";
import { FileAudio, LayoutGrid, MessageSquareText } from "lucide-react";
import { StudioTab } from "../types/studio";

interface BottomNavProps {
  activeTab: StudioTab;
  onChangeTab: (tab: StudioTab) => void;
  takesCount: number;
  hasUnreadProposal?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  takesCount,
  hasUnreadProposal = false,
}) => {
  const items: Array<{
    id: StudioTab;
    labelEn: string;
    labelAr: string;
    icon: React.ReactNode;
    meta?: string;
  }> = [
    {
      id: "chat",
      labelEn: "Chat",
      labelAr: "مساعد الأفكار",
      icon: <MessageSquareText className="h-4 w-4 shrink-0" />,
      meta: hasUnreadProposal ? "جديد" : undefined,
    },
    {
      id: "preview",
      labelEn: "Preview",
      labelAr: "الاستوديو",
      icon: <LayoutGrid className="h-4 w-4 shrink-0" />,
    },
    {
      id: "artifacts",
      labelEn: "Artifacts",
      labelAr: "المونتاج والملفات",
      icon: <FileAudio className="h-4 w-4 shrink-0" />,
      meta: takesCount > 0 ? String(takesCount) : undefined,
    },
  ];

  return (
    <nav
      aria-label="التنقل الرئيسي للاستوديو"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#080A0F]/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-around px-3 sm:px-6 gap-2">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex flex-1 max-w-[260px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 ${
                isActive
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/35"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              {item.icon}
              <span dir="ltr" className="font-mono text-xs sm:text-sm">
                {item.labelEn}
              </span>
              <span className="hidden sm:inline text-xs font-normal opacity-80">
                · {item.labelAr}
              </span>
              {item.meta && (
                <span className="font-mono text-[11px] tabular-nums text-amber-300/90">
                  ({item.meta})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
