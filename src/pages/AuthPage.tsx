import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plane, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [role, setRole] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({ title: 'Select a role', variant: 'destructive' });
      return;
    }
    setSignupLoading(true);

    // Validate school code for students
    if (role === 'student') {
      const { data: school, error: schoolErr } = await supabase
        .from('schools')
        .select('id')
        .eq('code', schoolCode.trim().toUpperCase())
        .single();

      if (schoolErr || !school) {
        setSignupLoading(false);
        toast({ title: 'Invalid School Code', description: 'Please enter a valid school code to register as a student.', variant: 'destructive' });
        return;
      }
    }

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: window.location.origin,
      },
    });
    setSignupLoading(false);
    if (error) {
      toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Check your email', description: 'We sent you a confirmation link. Please verify your email to sign in.' });
      setTab('login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-foreground">AeroPlan</h1>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1">Log In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Email</label>
                  <Input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Password</label>
                  <Input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Full Name</label>
                  <Input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Email</label>
                  <Input type="email" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Password</label>
                  <Input type="password" required minLength={6} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Role</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue placeholder="Select your role..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="dispatch">Dispatch</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {role === 'student' && (
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">School Code</label>
                    <Input required value={schoolCode} onChange={e => setSchoolCode(e.target.value)} placeholder="Enter your school code" className="uppercase" />
                    <p className="text-[10px] text-muted-foreground mt-1">Ask your school administrator for this code.</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
