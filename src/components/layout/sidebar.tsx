'use client';

import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
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
  Music,
  Gamepad2,
  Trophy,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainMenuItems = [
  { href: '/', icon: Home, label: 'Beranda' },
  { href: '#', icon: Flame, label: 'Trending' },
  { href: '#', icon: Clapperboard, label: 'Subscription' },
];

const libraryMenuItems = [
  { href: '#', icon: History, label: 'Riwayat' },
  { href: '#', icon: PlaySquare, label: 'Video Anda' },
  { href: '#', icon: Clock, label: 'Tonton Nanti' },
  { href: '#', icon: ThumbsUp, label: 'Video yang Disukai' },
];

const exploreMenuItems = [
  { href: '#', icon: Music, label: 'Musik' },
  { href: '#', icon: Gamepad2, label: 'Game' },
  { href: '#', icon: Trophy, label: 'Olahraga' },
  { href: '#', icon: Lightbulb, label: 'Pelajaran' },
];

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
                isActive={pathname === item.href && item.href === '/'}
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
        <SidebarGroup>
          <SidebarGroupLabel>Anda</SidebarGroupLabel>
          <SidebarMenu>
            {libraryMenuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Jelajahi</SidebarGroupLabel>
          <SidebarMenu>
            {exploreMenuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
