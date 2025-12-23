import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { XCircle, RotateCcw } from "lucide-react";
import { format } from "date-fns";

export default function FailedEmails() {
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetch = async () => {
    const { data } = await supabase
      .from("email_queue")
      .select("*, students(student_name)")
      .eq("status", "failed")
      .order("created_at", { ascending: false });
    setEmails(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleRetry = async (id: string) => {
    await supabase.from("email_queue").update({ status: "pending", error_message: null }).eq("id", id);
    toast({ title: "Email re-queued for retry" });
    fetch();
  };

  return (
    <AdminLayout title="Failed Emails" description="View and retry failed email deliveries">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Failed Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              ) : emails.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No failed emails</TableCell></TableRow>
              ) : emails.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.students?.student_name || "-"}</TableCell>
                  <TableCell>{item.recipient_email}</TableCell>
                  <TableCell><Badge variant="outline">{item.email_type}</Badge></TableCell>
                  <TableCell className="text-sm text-destructive max-w-xs truncate">{item.error_message || "-"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleRetry(item.id)}>
                      <RotateCcw className="h-4 w-4 mr-1" /> Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
