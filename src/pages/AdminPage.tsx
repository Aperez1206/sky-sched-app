import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import AdmissionsTab from '@/components/admin/AdmissionsTab';
import SubscriptionsTab from '@/components/admin/SubscriptionsTab';
import DocumentsTab from '@/components/admin/DocumentsTab';
import AnnouncementsTab from '@/components/admin/AnnouncementsTab';
import AuditLogTab from '@/components/admin/AuditLogTab';
import SettingsTab from '@/components/admin/SettingsTab';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  // Auth disabled for testing — guard is a no-op, but keep the hook for when re-enabled.
  useAdminGuard();

  return (
    <div className="h-full overflow-auto bg-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-600" />
          <h1 className="text-2xl font-semibold">Admin</h1>
        </div>
        <Tabs defaultValue="admissions" className="w-full">
          <TabsList className="bg-white">
            <TabsTrigger value="admissions">Admissions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="admissions"><AdmissionsTab /></TabsContent>
          <TabsContent value="subscriptions"><SubscriptionsTab /></TabsContent>
          <TabsContent value="documents"><DocumentsTab /></TabsContent>
          <TabsContent value="announcements"><AnnouncementsTab /></TabsContent>
          <TabsContent value="audit"><AuditLogTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
