
'use client';

import * as React from 'react';
import {
  CircleUser,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircleQuestion,
  PanelLeft,
  Settings,
  ShieldAlert,
  Users,
  History,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth, useUser, useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';


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
  SidebarTrigger,
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
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

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
  const auth = useAuth();
  const router = useRouter();

  const { user } = useUser(); // Get the auth user
  const { firestore } = useFirebase(); // Get firestore instance

  // Create a memoized reference to the user document
  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };


  return (
    <SidebarProvider>
      <Sidebar
        side="left"
        className="border-sidebar-border bg-sidebar text-sidebar-foreground"
      >
        <div className="flex h-full flex-col">
          <SidebarHeader className="h-16 items-center flex justify-center">
            <div
              data-sidebar="header-content"
              className="flex items-center justify-center gap-2 overflow-hidden w-full"
            >
              <span className="font-headline text-lg font-bold opacity-0 group-hover/sidebar:opacity-100 transition-opacity">SENTINEL</span>
            </div>
            <SidebarTrigger className='md:hidden absolute right-2 top-4' />
          </SidebarHeader>
          <SidebarContent className="flex-1">
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
          <SidebarFooter className="p-2 flex flex-col gap-2">
             <Link href="/profile" className="w-full rounded-md hover:bg-sidebar-accent">
                <div className="flex items-center gap-3 p-2 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={appUser?.photoURL} alt={appUser?.displayName} />
                      <AvatarFallback>{appUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start overflow-hidden opacity-0 w-0 group-hover/sidebar:w-full group-hover/sidebar:opacity-100 transition-all">
                      {isAppUserLoading ? (
                        <div className='space-y-1'>
                          <Skeleton className="h-4 w-20 bg-sidebar-accent" />
                          <Skeleton className="h-3 w-16 bg-sidebar-accent" />
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-sm whitespace-nowrap">{appUser?.displayName || 'User'}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {appUser?.role || 'Role'}
                          </span>
                        </>
                      )}
                    </div>
                </div>
             </Link>
          </SidebarFooter>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger />
            {/* You can add more header content here, like breadcrumbs or a title */}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
