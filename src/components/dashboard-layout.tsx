import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Code, BotMessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <BotMessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">FaithTime-ConfigCenter</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive>
                <Link href="/">
                  <Code />
                  <span>邀请码</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Future navigation items can be added here */}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center border-b h-14 px-4">
          <SidebarTrigger />
          {/* We can add more header items here like a user menu */}
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
