import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plane, CalendarDays, Radio, CreditCard, GraduationCap, Shield } from 'lucide-react';

const FEATURES = [
  { icon: CalendarDays, title: 'Scheduling', desc: 'Book aircraft, assign instructors, and manage the daily flight schedule in real time.' },
  { icon: Radio, title: 'Dispatch', desc: 'Live weather, wind analysis, and go/no-go decisions — all in one panel.' },
  { icon: CreditCard, title: 'Billing', desc: 'Track account balances, session charges, and payment history effortlessly.' },
  { icon: GraduationCap, title: 'Course Tracking', desc: 'Enroll students in Part 61/141 programs and monitor their progress.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Admins, dispatchers, instructors, and students each see what they need.' },
  { icon: Plane, title: 'Fleet Management', desc: 'Monitor hobbs/tach times, aircraft status, and maintenance schedules.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-card shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground">AeroPlan</span>
        </div>
        <Button size="sm" onClick={() => navigate('/login')}>Log In</Button>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground max-w-2xl leading-tight">
          Flight School Management,<br />
          <span className="text-primary">Simplified.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-lg text-lg">
          Schedule flights, track student progress, manage billing, and dispatch aircraft — all from one modern platform.
        </p>
        <Button size="lg" className="mt-8 text-base px-8" onClick={() => navigate('/login')}>
          Get Started
        </Button>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-card rounded-xl p-5 shadow-sm border border-border">
              <f.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} AeroPlan · Opa-locka Executive · KOPF
      </footer>
    </div>
  );
}
