
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react'; // Removed BarChart3

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  // Add more admin pages here
  // { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <ShieldCheck className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
          <h2 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden font-headline">
            AgentAlly Admin
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
        <Link href="/" passHref legacyBehavior>
           <Button variant="outline" className="w-full group-data-[collapsible=icon]:hidden">
            <LogOut className="mr-2 h-4 w-4" /> Exit Admin
           </Button>
        </Link>
         <Link href="/" passHref legacyBehavior>
             <Button variant="ghost" size="icon" className="w-full hidden group-data-[collapsible=icon]:flex justify-center">
                <LogOut className="h-5 w-5" />
             </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
