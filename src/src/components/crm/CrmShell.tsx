import type { ReactNode } from "react";

import { AppSidebar, type NavItem } from "./AppSidebar";
import type { Profile } from "@/lib/crm-data";

export function CrmShell({
  user,
  items,
  children,
}: {
  user: Profile;
  items: NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar user={user} items={items} />
      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="mx-auto max-w-[110rem]">{children}</div>
      </main>
    </div>
  );
}
