import { useUserDocuments } from '@/hooks/useAccountData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, Download, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useRef } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentsTabProps {
  userId: string;
  isAdmin?: boolean;
}

export default function DocumentsTab({ userId, isAdmin }: DocumentsTabProps) {
  const { data: documents, isLoading } = useUserDocuments(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleDownload = async (filePath: string, name: string) => {
    const { data, error } = await supabase.storage.from('user-documents').createSignedUrl(filePath, 300);
    if (error) { toast.error('Failed to get download link'); return; }
    window.open(data.signedUrl, '_blank');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('user-documents').upload(filePath, file);
    if (uploadError) { toast.error('Upload failed'); return; }

    const { data: { user } } = await supabase.auth.getUser();
    const { error: dbError } = await supabase.from('user_documents').insert({
      user_id: userId,
      name: file.name,
      file_path: filePath,
      uploaded_by: user!.id,
    });
    if (dbError) { toast.error('Failed to save document record'); return; }

    toast.success('Document uploaded');
    queryClient.invalidateQueries({ queryKey: ['user-documents', userId] });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {isAdmin && (
        <div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          <Button size="sm" variant="outline" className="gap-1" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> Upload Document
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground p-4">Loading…</p>
      ) : !documents?.length ? (
        <p className="text-sm text-muted-foreground p-4">No documents uploaded.</p>
      ) : (
        documents.map((d) => (
          <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {d.created_at ? format(new Date(d.created_at), 'MMM d, yyyy') : '—'}
                </p>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(d.file_path, d.name)}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
