import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
