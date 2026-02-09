import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Minus } from "lucide-react";

export function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="h-11 w-full flex items-center px-4 select-none cursor-default bg-black/20 shrink-0 relative"
    >
      <div className="flex gap-2 group relative z-10">
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            appWindow.close();
          }}
          className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center transition-colors border border-[#e0443e] outline-none active:scale-95"
        >
          <X className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={4} />
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            appWindow.minimize();
          }}
          className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 flex items-center justify-center transition-colors border border-[#dea123] outline-none active:scale-95"
        >
          <Minus className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={4} />
        </button>
        <div className="w-3 h-3 rounded-full bg-[#27c93f]/30 border border-[#1aab29]/30" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] font-mono text-white/20 font-bold tracking-[0.2em] uppercase">Ryiuk Launcher</span>
      </div>
    </div>
  );
}
