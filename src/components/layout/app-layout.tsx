
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  CircleUser,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircleQuestion,
  Settings,
  ShieldAlert,
  Users,
  Bell,
  Pin,
  PinOff,
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NotificationBell } from './NotificationBell';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

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
        collapsible="icon"
        className="border-sidebar-border bg-sidebar text-sidebar-foreground"
      >
        <div className="flex h-full flex-col">
          <SidebarHeader className="h-16 items-center flex justify-between">
            <div
              data-sidebar="header-content"
              className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:w-0"
            >
              <span className="font-headline text-lg font-bold">SENTINEL</span>
            </div>
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
            <NotificationBell>
                 <div className="relative flex items-center w-full">
                    <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 h-12 px-2">
                        <Bell />
                        <span className='overflow-hidden group-data-[collapsible=icon]:w-0'>Notification</span>
                    </Button>
                 </div>
            </NotificationBell>
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
                    <AvatarFallback>{appUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start overflow-hidden group-data-[collapsible=icon]:w-0">
                    {isAppUserLoading ? (
                      <div className='space-y-1'>
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{appUser?.displayName || 'User'}</span>
                        <span className="text-xs text-muted-foreground">
                          {appUser?.role || 'Role'}
                        </span>
                      </>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <CircleUser className="mr-2" />
                    <span>Profile</span>
                  </Link>
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
        </div>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
