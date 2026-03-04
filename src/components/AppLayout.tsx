import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '@/components/aeroplan/Header';
import AuthGuard from '@/components/AuthGuard';

export default function AppLayout() {
  const navigate = useNavigate();

  const handleBookFlight = () => {
    navigate('/schedule?book=1');
  };

  const handleOpenPending = () => {
    navigate('/schedule?pending=1');
  };

  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={false}>
        <div className="h-screen flex w-full overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
            <Header
              pendingCount={0}
              onBookFlight={handleBookFlight}
              onOpenPending={handleOpenPending}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
