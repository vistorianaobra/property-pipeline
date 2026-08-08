import { Link } from "@tanstack/react-router";
import { ArrowLeft, LayoutGrid, LifeBuoy, Settings, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials, type Profile } from "@/lib/crm-data";

export interface NavItem {
  label: string;
  to: string;
  icon: "kanban" | "users" | "tickets" | "back";
}

const ICONS = {
  kanban: LayoutGrid,
  users: Users,
  tickets: LifeBuoy,
  back: ArrowLeft,
} as const;

export function AppSidebar({ user, items }: { user: Profile; items: NavItem[] }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="px-6 py-8">
        <Link to="/" className="label-caps text-sm tracking-[0.28em] text-sidebar-foreground">
          NEXMOVE
        </Link>
      </div>

      <div className="flex items-start gap-3 px-6 pb-8">
        <Avatar className="size-10">
          {user.avatar_url ? <AvatarImage src={user.avatar_url} alt={user.nome} /> : null}
          <AvatarFallback className="bg-sidebar-accent text-xs">
            {initials(user.nome)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-sidebar-foreground">{user.nome}</p>
          <p className="label-caps mt-1 text-muted-foreground">{user.cargo}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className="size-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <Link
          to="/configuracoes"
          className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60"
        >
          <Settings className="size-4" aria-hidden />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
