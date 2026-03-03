import { CalendarDays, Users, Plane, CreditCard, Radio, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
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

const NAV_ITEMS = [
  { title: 'Schedule', url: '/', icon: CalendarDays, roles: null },
  { title: 'People', url: '/people', icon: Users, roles: ['admin', 'dispatch'] as const },
  { title: 'Aircraft', url: '/aircraft', icon: Plane, roles: null },
  { title: 'Billing', url: '/billing', icon: CreditCard, roles: null },
  { title: 'Dispatch', url: '/dispatch', icon: Radio, roles: null },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { role, signOut } = useAuth();

  const isActive = (url: string) =>
    url === '/' ? location.pathname === '/' : location.pathname.startsWith(url);

  const visibleItems = NAV_ITEMS.filter(item =>
    item.roles === null || (role && (item.roles as readonly string[]).includes(role))
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="flex-1 flex flex-col">
          <SidebarGroupContent className="flex-1 flex flex-col">
            <SidebarMenu className="flex flex-col justify-evenly h-full">
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} end={item.url === '/'}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Log Out" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Log Out</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
