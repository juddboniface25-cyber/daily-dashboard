"use client";

import {
  LayoutDashboard,
  Dumbbell,
  Heart,
  Moon,
  Brain,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type PageKey =
  | "overview"
  | "fitness"
  | "health"
  | "productivity"
  | "learning";

const NAV_ITEMS: { key: PageKey; label: string; Icon: LucideIcon }[] = [
  { key: "overview", label: "Overview", Icon: LayoutDashboard },
  { key: "fitness", label: "Fitness", Icon: Dumbbell },
  { key: "health", label: "Health", Icon: Heart },
  { key: "productivity", label: "Productivity", Icon: Moon },
  { key: "learning", label: "Learning", Icon: Brain },
];

function NavButton({
  label,
  Icon,
  active,
  onClick,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[color:var(--color-background-secondary)]"
      style={active ? { backgroundColor: "#EEF2FF" } : undefined}
    >
      <Icon
        className="h-[18px] w-[18px]"
        style={{ color: active ? "#4F46E5" : "hsl(var(--muted-foreground))" }}
      />
    </button>
  );
}

export default function Sidebar({
  activePage,
  onSelect,
}: {
  activePage: PageKey;
  onSelect: (page: PageKey) => void;
}) {
  return (
    <>
      {/* Desktop: fixed left rail */}
      <nav
        className="hidden md:flex h-screen w-14 shrink-0 flex-col items-center gap-2 border-r-[0.5px] border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-primary)] py-3"
      >
        {NAV_ITEMS.map(({ key, label, Icon }) => (
          <NavButton
            key={key}
            label={label}
            Icon={Icon}
            active={activePage === key}
            onClick={() => onSelect(key)}
          />
        ))}
        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          disabled
          className="mt-auto flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/60"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>
      </nav>

      {/* Mobile: bottom tab bar (5 icons) */}
      <nav className="fixed bottom-0 inset-x-0 z-20 flex md:hidden items-center justify-around border-t-[0.5px] border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-primary)] py-2">
        {NAV_ITEMS.map(({ key, label, Icon }) => (
          <NavButton
            key={key}
            label={label}
            Icon={Icon}
            active={activePage === key}
            onClick={() => onSelect(key)}
          />
        ))}
      </nav>
    </>
  );
}
