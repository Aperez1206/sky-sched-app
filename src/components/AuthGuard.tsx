export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Auth temporarily disabled for testing
  return <>{children}</>;
}
