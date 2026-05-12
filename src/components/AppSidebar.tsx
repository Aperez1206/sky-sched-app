import { CalendarDays, Users, Plane, CreditCard, Radio, LayoutDashboard, Shield } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const NAV_ITEMS = [
  { title: 'Schedule', url: '/schedule', icon: CalendarDays },
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'People', url: '/people', icon: Users },
  { title: 'Aircraft', url: '/aircraft', icon: Plane },
  { title: 'Billing', url: '/billing', icon: CreditCard },
  { title: 'Dispatch', url: '/dispatch', icon: Radio },
  { title: 'Admin', url: '/admin', icon: Shield, roles: ['admin', 'dispatch'] as string[] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const isActive = (url: string) =>
    url === '/schedule' ? location.pathname === '/schedule' : location.pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="flex-1 flex flex-col">
          <SidebarGroupContent className="flex-1 flex flex-col">
            <SidebarMenu className="flex flex-col justify-evenly h-full">
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} end={item.url === '/schedule'}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
