import { useState, useCallback } from 'react';
import Header from '@/components/aeroplan/Header';
import MetarRibbon from '@/components/aeroplan/MetarRibbon';
import Timeline from '@/components/aeroplan/Timeline';
import BookingModal from '@/components/aeroplan/BookingModal';
import PendingModal from '@/components/aeroplan/PendingModal';
import StatusModal from '@/components/aeroplan/StatusModal';
import Legend from '@/components/aeroplan/Legend';
import { AIRCRAFT, SAMPLE_BOOKINGS, Booking, Aircraft } from '@/data/aeroplan';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>(SAMPLE_BOOKINGS);
  const [aircraftList, setAircraftList] = useState<Aircraft[]>(AIRCRAFT);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [statusTail, setStatusTail] = useState<string | null>(null);

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const statusAircraft = statusTail ? aircraftList.find(a => a.tailNumber === statusTail) || null : null;

  const handleConfirmBooking = useCallback((booking: Omit<Booking, 'id'>) => {
    setBookings(prev => [...prev, { ...booking, id: `b${Date.now()}` }]);
  }, []);

  const handleAuthorize = useCallback((id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' as const } : b));
  }, []);

  const handleDeny = useCallback((id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  }, []);

  const handleStatusSave = useCallback((tail: string, status: Aircraft['status'], airport: string) => {
    setAircraftList(prev => prev.map(a => a.tailNumber === tail ? { ...a, status, lastAirport: airport } : a));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        pendingCount={pendingCount}
        onBookFlight={() => setBookingOpen(true)}
        onOpenPending={() => setPendingOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-0 mx-3 mb-1 mt-2">
        <div className="bg-card rounded-xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <MetarRibbon />
          </div>
          <Timeline
            aircraft={aircraftList}
            bookings={bookings}
            selectedDate={selectedDate}
            onEditStatus={setStatusTail}
          />
        </div>
      </div>

      <Legend />

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        aircraft={aircraftList}
        onConfirm={handleConfirmBooking}
      />
      <PendingModal
        open={pendingOpen}
        onClose={() => setPendingOpen(false)}
        bookings={bookings}
        onAuthorize={handleAuthorize}
        onDeny={handleDeny}
      />
      <StatusModal
        open={!!statusTail}
        onClose={() => setStatusTail(null)}
        aircraft={statusAircraft}
        onSave={handleStatusSave}
      />
    </div>
  );
};

export default Index;
