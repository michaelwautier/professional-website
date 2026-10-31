"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { SiteView, type SiteViewData } from "@/components/site/site-view";
import { siteHost } from "@/lib/hosts";

const WIDTH = { desktop: 1280, mobile: 390 } as const;

/**
 * Aperçu en direct : le vrai rendu du site, mis à l'échelle. Les gabarits utilisent des container queries,
 * donc la mise en page desktop ou mobile dépend de la largeur simulée et non de l'écran.
 */
export function SitePreview({ site }: { site: SiteViewData }) {
  const [device, setDevice] = useState<keyof typeof WIDTH>("desktop");
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setFrame({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseWidth = WIDTH[device];
  const padding = device === "mobile" ? 24 : 0;
  const scale = frame.w ? Math.min(1, (frame.w - padding * 2) / baseWidth) : 0;
  const height = device === "mobile" ? Math.min(frame.h - padding * 2, 820) : frame.h;

  // Les liens ne quittent pas l'aperçu : les ancres font défiler le site simulé, le reste est ignoré.
  function onClickCapture(event: MouseEvent) {
    const link = (event.target as HTMLElement).closest("a");
    if (!link) return;
    event.preventDefault();
    const href = link.getAttribute("href") ?? "";
    if (!href.startsWith("#")) return;
    const target = scrollRef.current?.querySelector<HTMLElement>(href);
    if (target) scrollRef.current?.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-[#e9e8e3]">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-md bg-paper px-3 py-1 text-center font-mono text-xs text-muted">
          {siteHost(site.slug || "votre-site")}
        </div>
        <div className="flex rounded-lg bg-paper p-0.5">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-label={d === "desktop" ? "Aperçu ordinateur" : "Aperçu mobile"}
              aria-pressed={device === d}
              className={`grid size-7 place-items-center rounded-md transition ${device === d ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
            >
              {d === "desktop" ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
            </button>
          ))}
        </div>
      </div>

      <div ref={frameRef} className="relative flex-1">
        {scale > 0 && (
          <div
            className={`absolute overflow-hidden bg-white ${device === "mobile" ? "rounded-[2rem] shadow-2xl ring-8 ring-ink" : ""}`}
            style={{
              width: baseWidth * scale,
              height,
              left: (frame.w - baseWidth * scale) / 2,
              top: device === "mobile" ? (frame.h - height) / 2 : 0,
            }}
          >
            <div
              ref={scrollRef}
              onClickCapture={onClickCapture}
              className="relative overflow-y-auto overscroll-contain"
              style={{
                width: baseWidth,
                height: height / scale,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <SiteView site={site} preview />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
