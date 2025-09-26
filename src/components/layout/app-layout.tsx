
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  CircleUser,
  FileText,
  Gavel,
  LayoutDashboard,
  LogOut,
  MessageCircleQuestion,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';


import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NotificationBell } from './NotificationBell';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/contracts',
    label: 'Contracts',
    icon: FileText,
  },
  {
    href: '/collaboration',
    label: 'Collaboration',
    icon: Users,
  },
  {
    href: '/risk-analysis',
    label: 'Risk Analysis',
    icon: ShieldAlert,
  },
  {
    href: '/qa',
    label: 'Q&A',
    icon: MessageCircleQuestion,
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };


  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="border-sidebar-border bg-sidebar text-sidebar-foreground"
      >
        <SidebarHeader className="h-16 items-center">
          <div
            data-sidebar="header-content"
            className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:w-0"
          >
            <span className="font-headline text-lg font-bold">SENTINEL</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href) && (item.href === '/' ? pathname === '/' : true)}
                    tooltip={item.label}
                  >
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-2 flex flex-row gap-2 items-center group-data-[collapsible=icon]:flex-col">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 w-full justify-start gap-2 px-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              >
                <Avatar className="h-8 w-8">
                  {userAvatar && (
                    <Image
                      src={userAvatar.imageUrl}
                      alt={userAvatar.description}
                      width={32}
                      height={32}
                      data-ai-hint={userAvatar.imageHint}
                    />
                  )}
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden group-data-[collapsible=icon]:w-0">
                  <span className="font-medium">Jane Doe</span>
                  <span className="text-xs text-muted-foreground">
                    Legal Counsel
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CircleUser className="mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
