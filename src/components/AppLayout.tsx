import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '@/components/aeroplan/Header';

export default function AppLayout() {
  const navigate = useNavigate();

  const handleBookFlight = () => {
    navigate('/?book=1');
  };

  const handleOpenPending = () => {
    navigate('/?pending=1');
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <Header
            pendingCount={0}
            onBookFlight={handleBookFlight}
            onOpenPending={handleOpenPending}
          />
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
