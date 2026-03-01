import { useState, useCallback, useMemo } from 'react';
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/aeroplan/Header';
import MetarRibbon from '@/components/aeroplan/MetarRibbon';
import Timeline from '@/components/aeroplan/Timeline';
import BookingModal, { BookingInitialData } from '@/components/aeroplan/BookingModal';
import PendingModal from '@/components/aeroplan/PendingModal';
import StatusModal from '@/components/aeroplan/StatusModal';
import Legend from '@/components/aeroplan/Legend';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AIRCRAFT, INSTRUCTORS, ROOMS, SAMPLE_BOOKINGS,
  Booking, Aircraft, ScheduleColumn,
  aircraftToColumns, instructorsToColumns, roomsToColumns,
} from '@/data/aeroplan';
import { Plane, GraduationCap, DoorOpen, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabValue = 'aircraft' | 'instructors' | 'rooms' | 'custom';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>(SAMPLE_BOOKINGS);
  const [aircraftList, setAircraftList] = useState<Aircraft[]>(AIRCRAFT);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [statusTail, setStatusTail] = useState<string | null>(null);
  const [bookingInitial, setBookingInitial] = useState<BookingInitialData | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('aircraft');
  const [customSelection, setCustomSelection] = useState<{ aircraft: string[]; instructors: string[]; rooms: string[] }>({
    aircraft: [], instructors: [], rooms: [],
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const statusAircraft = statusTail ? aircraftList.find(a => a.tailNumber === statusTail) || null : null;

  const columns = useMemo<ScheduleColumn[]>(() => {
    switch (activeTab) {
      case 'aircraft': return aircraftToColumns(aircraftList);
      case 'instructors': return instructorsToColumns(INSTRUCTORS);
      case 'rooms': return roomsToColumns(ROOMS);
      case 'custom': {
        const ac = aircraftToColumns(aircraftList.filter(a => customSelection.aircraft.includes(a.tailNumber)));
        const ins = instructorsToColumns(INSTRUCTORS.filter(i => customSelection.instructors.includes(i.name)));
        const rm = roomsToColumns(ROOMS.filter(r => customSelection.rooms.includes(r.name)));
        return [...ac, ...ins, ...rm];
      }
    }
  }, [activeTab, aircraftList, customSelection]);

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

  const handleDragCreate = useCallback((columnId: string, columnType: 'aircraft' | 'instructor' | 'room', startDate: Date, endDate: Date) => {
    setBookingInitial({
      aircraftTail: columnType === 'aircraft' ? columnId : '',
      startDate,
      endDate,
    });
    setBookingOpen(true);
  }, []);

  const handleBookingClose = useCallback(() => {
    setBookingOpen(false);
    setBookingInitial(null);
  }, []);

  const toggleCustomItem = useCallback((category: 'aircraft' | 'instructors' | 'rooms', id: string) => {
    setCustomSelection(prev => {
      const list = prev[category];
      return { ...prev, [category]: list.includes(id) ? list.filter(x => x !== id) : [...list, id] };
    });
  }, []);

  const toggleAllCategory = useCallback((category: 'aircraft' | 'instructors' | 'rooms', allIds: string[]) => {
    setCustomSelection(prev => {
      const allSelected = allIds.every(id => prev[category].includes(id));
      return { ...prev, [category]: allSelected ? [] : allIds };
    });
  }, []);

  const allAircraftIds = aircraftList.map(a => a.tailNumber);
  const allInstructorIds = INSTRUCTORS.map(i => i.name);
  const allRoomIds = ROOMS.map(r => r.name);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header
        pendingCount={pendingCount}
        onBookFlight={() => setBookingOpen(true)}
        onOpenPending={() => setPendingOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-0 mx-3 mb-1 mt-2">
        <div className="bg-card rounded-xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="px-4 pt-2 pb-2">
            <MetarRibbon />
          </div>

          {/* Date nav + Tab bar in one row */}
          <div className="flex items-center justify-between gap-4 px-4 pb-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[180px]">
                {(isToday(selectedDate) || isYesterday(selectedDate) || isTomorrow(selectedDate)) && (
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {isToday(selectedDate) ? 'Today' : isYesterday(selectedDate) ? 'Yesterday' : 'Tomorrow'}
                  </span>
                )}
                <div className="text-sm font-bold text-foreground leading-tight">{format(selectedDate, 'EEEE, MMMM d')}</div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!isToday(selectedDate) && (
                <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => setSelectedDate(new Date())}>
                  Today
                </Button>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="flex-1 max-w-md">
              <TabsList className="h-8 w-full">
                <TabsTrigger value="aircraft" className="flex-1 gap-1 text-xs">
                  <Plane className="h-3.5 w-3.5" /> Aircraft
                </TabsTrigger>
                <TabsTrigger value="instructors" className="flex-1 gap-1 text-xs">
                  <GraduationCap className="h-3.5 w-3.5" /> Instructors
                </TabsTrigger>
                <TabsTrigger value="rooms" className="flex-1 gap-1 text-xs">
                  <DoorOpen className="h-3.5 w-3.5" /> Rooms
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex-1 gap-1 text-xs">
                  <Settings2 className="h-3.5 w-3.5" /> Custom
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Custom picker */}
          {activeTab === 'custom' && (
            <div className="px-4 pb-2 flex flex-wrap gap-4 text-xs border-b border-border">
              <CustomGroup
                label="Aircraft"
                items={aircraftList.map(a => ({ id: a.tailNumber, label: a.tailNumber }))}
                selected={customSelection.aircraft}
                onToggle={(id) => toggleCustomItem('aircraft', id)}
                onToggleAll={() => toggleAllCategory('aircraft', allAircraftIds)}
                allSelected={allAircraftIds.every(id => customSelection.aircraft.includes(id))}
              />
              <CustomGroup
                label="Instructors"
                items={INSTRUCTORS.map(i => ({ id: i.name, label: i.name.split(' ')[0] }))}
                selected={customSelection.instructors}
                onToggle={(id) => toggleCustomItem('instructors', id)}
                onToggleAll={() => toggleAllCategory('instructors', allInstructorIds)}
                allSelected={allInstructorIds.every(id => customSelection.instructors.includes(id))}
              />
              <CustomGroup
                label="Rooms"
                items={ROOMS.map(r => ({ id: r.name, label: r.name }))}
                selected={customSelection.rooms}
                onToggle={(id) => toggleCustomItem('rooms', id)}
                onToggleAll={() => toggleAllCategory('rooms', allRoomIds)}
                allSelected={allRoomIds.every(id => customSelection.rooms.includes(id))}
              />
            </div>
          )}

          <Timeline
            columns={columns}
            bookings={bookings}
            selectedDate={selectedDate}
            aircraftList={aircraftList}
            onEditStatus={setStatusTail}
            onDragCreate={handleDragCreate}
          />
        </div>
      </div>

      <Legend />

      <BookingModal
        open={bookingOpen}
        onClose={handleBookingClose}
        aircraft={aircraftList}
        onConfirm={handleConfirmBooking}
        initialData={bookingInitial}
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

interface CustomGroupProps {
  label: string;
  items: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
}

function CustomGroup({ label, items, selected, onToggle, onToggleAll, allSelected }: CustomGroupProps) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="font-semibold text-muted-foreground mr-1">{label}:</span>
      <button onClick={onToggleAll} className="text-[10px] text-primary hover:underline cursor-pointer">
        {allSelected ? 'None' : 'All'}
      </button>
      {items.map(item => (
        <label key={item.id} className="flex items-center gap-1 cursor-pointer">
          <Checkbox
            checked={selected.includes(item.id)}
            onCheckedChange={() => onToggle(item.id)}
            className="h-3.5 w-3.5"
          />
          <span className="text-foreground">{item.label}</span>
        </label>
      ))}
    </div>
  );
}

export default Index;
