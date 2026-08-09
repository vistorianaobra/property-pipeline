import { Link } from "@tanstack/react-router";
import { ArrowLeft, LayoutGrid, LifeBuoy, Settings, Users, Package, FileText, Home } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials, type Profile } from "@/lib/crm-data";

export interface NavItem {
  label: string;
  to: string;
  icon: "kanban" | "users" | "tickets" | "back" | "package" | "file-text" | "home";
}

const ICONS = {
  kanban: LayoutGrid,
  users: Users,
  tickets: LifeBuoy,
  back: ArrowLeft,
  package: Package,
  "file-text": FileText,
  home: Home,
} as const;

import { useRef, useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export function AppSidebar({ user, items }: { user: Profile; items: NavItem[] }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`avatar_${user.id}`) || user.avatar_url;
    }
    return user.avatar_url;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`avatar_${user.id}`);
      setAvatarUrl(saved || user.avatar_url);
    }
  }, [user.id, user.avatar_url]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (typeof window !== "undefined") {
        localStorage.setItem(`avatar_${user.id}`, result);
      }
      setAvatarUrl(result);
      user.avatar_url = result;
      toast.success(`Foto de perfil de ${user.nome.split(" ")[0]} atualizada com sucesso!`);
    };
    reader.readAsDataURL(file);
  };

  const isCorretor = user.role === "CORRETOR" || user.id.startsWith("u-corr-");

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="px-6 py-8">
        <Link to="/" className="label-caps text-sm tracking-[0.28em] text-sidebar-foreground">
          NEXMOVE
        </Link>
      </div>

      <div className="flex items-start gap-3 px-6 pb-8">
        <button
          type="button"
          onClick={handleAvatarClick}
          title={`Clique para enviar foto de perfil de ${user.nome}`}
          className="group relative cursor-pointer outline-none"
        >
          <Avatar className="size-10 border border-sidebar-border transition-transform group-hover:scale-105">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={user.nome} /> : null}
            <AvatarFallback className="bg-sidebar-accent text-xs">
              {initials(user.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-4 text-white" />
          </div>
        </button>

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

      {!isCorretor && (
        <div className="border-t border-sidebar-border px-3 py-4">
          <Link
            to="/configuracoes"
            className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60"
          >
            <Settings className="size-4" aria-hidden />
            <span>Configurações</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
