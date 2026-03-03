
-- Fix the overly permissive INSERT policy on profiles
-- Drop the old one and create a more restrictive one
DROP POLICY "System can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
-- Also allow the trigger (which runs as SECURITY DEFINER) to insert
-- The trigger function already runs with elevated privileges, so this is fine
