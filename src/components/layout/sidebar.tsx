'use client';

import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarSeparator,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  Flame,
  Clapperboard,
  Library,
  History,
  PlaySquare,
  Clock,
  ThumbsUp,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ApiStatus from '../features/ApiStatus';

const mainMenuItems = [
  { href: '/', icon: Home, label: 'Beranda' },
  { href: '#', icon: Flame, label: 'Trending' },
  { href: '#', icon: Clapperboard, label: 'Subscription' },
];

const libraryMenuItems = [
  { href: '#', icon: Library, label: 'Library' },
  { href: '#', icon: History, label: 'Riwayat' },
  { href: '#', icon: PlaySquare, label: 'Video Anda' },
  { href: '#', icon: Clock, label: 'Tonton Nanti' },
  { href: '#', icon: ThumbsUp, label: 'Video yang Disukai' },
];

const premiumMenuItem = {
  href: '#',
  icon: Star,
  label: 'Premium',
};

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
          {libraryMenuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === premiumMenuItem.href}
              tooltip={premiumMenuItem.label}
            >
              <Link href={premiumMenuItem.href}>
                <premiumMenuItem.icon />
                <span>{premiumMenuItem.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <ApiStatus />
      </SidebarFooter>
    </Sidebar>
  );
}
